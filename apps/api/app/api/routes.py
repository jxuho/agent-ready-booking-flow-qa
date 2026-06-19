from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.booking import (
    AvailabilityCheckRequest,
    AvailabilityRead,
    ConfirmAttemptCreate,
    ConfirmAttemptRead,
    HealthRead,
    QuoteCreate,
    QuoteRead,
    RestrictionRead,
    ServiceTypeRead,
    TimeSlotRead,
)
from app.services.booking import (
    check_availability,
    create_confirm_attempt,
    create_quote,
    list_restrictions,
    list_services,
    list_slots,
)

router = APIRouter()


@router.get("/health", response_model=HealthRead, response_model_by_alias=True)
def health() -> HealthRead:
    return HealthRead(status="ok", safe_stop_enforced=True)


@router.get("/api/services", response_model=list[ServiceTypeRead], response_model_by_alias=True)
def services(db: Session = Depends(get_db)) -> list[ServiceTypeRead]:
    return list_services(db)


@router.post(
    "/api/availability/check",
    response_model=AvailabilityRead,
    response_model_by_alias=True,
)
def availability_check(
    payload: AvailabilityCheckRequest,
    db: Session = Depends(get_db),
) -> AvailabilityRead:
    return check_availability(db, payload)


@router.get("/api/slots", response_model=list[TimeSlotRead], response_model_by_alias=True)
def slots(
    service_id: int = Query(gt=0),
    postal_code: str = Query(min_length=5, max_length=5, pattern=r"^\d{5}$"),
    db: Session = Depends(get_db),
) -> list[TimeSlotRead]:
    return list_slots(db, service_id=service_id, postal_code=postal_code)


@router.get(
    "/api/restrictions",
    response_model=list[RestrictionRead],
    response_model_by_alias=True,
)
def restrictions(
    service_id: int = Query(gt=0),
    postal_code: str = Query(min_length=5, max_length=5, pattern=r"^\d{5}$"),
    db: Session = Depends(get_db),
) -> list[RestrictionRead]:
    return list_restrictions(db, service_id=service_id, postal_code=postal_code)


@router.post(
    "/api/quote",
    response_model=QuoteRead,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
def quote(payload: QuoteCreate, db: Session = Depends(get_db)) -> QuoteRead:
    return create_quote(db, payload)


@router.post(
    "/api/confirm-attempt",
    response_model=ConfirmAttemptRead,
    response_model_by_alias=True,
    status_code=status.HTTP_202_ACCEPTED,
)
def confirm_attempt(
    payload: ConfirmAttemptCreate,
    db: Session = Depends(get_db),
) -> ConfirmAttemptRead:
    return create_confirm_attempt(db, payload)
