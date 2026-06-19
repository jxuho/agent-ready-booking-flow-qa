from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.seed.load import seed_reference_data


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_reference_data(db)
    yield


app = FastAPI(
    title="Agent-Ready Booking Flow QA API",
    description=(
        "Simulated service-booking API for web QA and AI-agent evaluation. "
        "The API supports pre-confirmation quotes and records prohibited confirm attempts, "
        "but it does not create real bookings."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)
