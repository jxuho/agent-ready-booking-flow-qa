from collections.abc import Generator

import pytest

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.seed.load import seed_reference_data
from sqlalchemy.orm import Session


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_reference_data(db)
        yield db


@pytest.fixture()
def service_id(db: Session) -> int:
    from app.api.routes import services

    service_list = services(db)
    return next(service.id for service in service_list if service.slug == "standard-install")
