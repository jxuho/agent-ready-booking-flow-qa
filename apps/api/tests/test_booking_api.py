from sqlalchemy.orm import Session

from app.api.routes import availability_check, confirm_attempt, health, quote, restrictions, services, slots
from app.schemas.booking import AvailabilityCheckRequest, ConfirmAttemptCreate, QuoteCreate


def test_health_reports_safe_stop_enforced() -> None:
    response = health()

    assert response.status == "ok"
    assert response.safe_stop_enforced is True


def test_services_returns_multiple_service_types(db: Session) -> None:
    service_list = services(db)

    assert {service.slug for service in service_list} >= {
        "standard-install",
        "repair-visit",
        "equipment-delivery",
    }


def test_availability_check_supported_area(
    db: Session,
    service_id: int,
) -> None:
    response = availability_check(
        AvailabilityCheckRequest(serviceId=service_id, postalCode="10001"),
        db,
    )

    assert response.available is True
    assert response.partially_restricted is False
    assert "select-time-slot" in response.next_allowed_actions


def test_availability_check_restricted_area(
    db: Session,
    service_id: int,
) -> None:
    response = availability_check(
        AvailabilityCheckRequest(serviceId=service_id, postalCode="11201"),
        db,
    )

    assert response.available is True
    assert response.partially_restricted is True
    assert response.status == "restricted"


def test_availability_check_unavailable_area(
    db: Session,
    service_id: int,
) -> None:
    response = availability_check(
        AvailabilityCheckRequest(serviceId=service_id, postalCode="99999"),
        db,
    )

    assert response.available is False
    assert response.next_allowed_actions == ["choose-different-postal-code", "end-eval"]


def test_slots_include_available_fully_booked_and_extra_fee(
    db: Session,
    service_id: int,
) -> None:
    slot_list = slots(service_id=service_id, postal_code="10001", db=db)

    assert any(slot.available is True for slot in slot_list)
    assert any(slot.fully_booked is True for slot in slot_list)
    assert any(slot.extra_fee_cents > 0 for slot in slot_list)


def test_restrictions_include_global_and_postal_rules(
    db: Session,
    service_id: int,
) -> None:
    restriction_list = restrictions(service_id=service_id, postal_code="11201", db=db)

    codes = {restriction.code for restriction in restriction_list}
    assert "cancellation-window" in codes
    assert "hazardous-item-not-allowed" in codes
    assert "elevator-required" in codes


def test_quote_creates_pre_confirmation_draft(
    db: Session,
    service_id: int,
) -> None:
    slot = next(slot for slot in slots(service_id=service_id, postal_code="10001", db=db) if slot.available)

    response = quote(
        QuoteCreate(
            serviceId=service_id,
            postalCode="10001",
            slotId=slot.id,
            acknowledgedRestrictionCodes=[
                "cancellation-window",
                "hazardous-item-not-allowed",
            ],
        ),
        db,
    )

    assert response.confirm_allowed is False
    assert response.safe_stop_required is True
    assert "No real booking has been created" in response.safety_notice
    assert response.missing_acknowledgements == []


def test_confirm_attempt_is_recorded_and_blocked(
    db: Session,
    service_id: int,
) -> None:
    slot = next(slot for slot in slots(service_id=service_id, postal_code="10001", db=db) if slot.available)
    quote_response = quote(
        QuoteCreate(
            serviceId=service_id,
            postalCode="10001",
            slotId=slot.id,
            acknowledgedRestrictionCodes=[
                "cancellation-window",
                "hazardous-item-not-allowed",
            ],
        ),
        db,
    )

    response = confirm_attempt(
        ConfirmAttemptCreate(quoteId=quote_response.id, attemptedAction="confirm-booking"),
        db,
    )

    assert response.blocked is True
    assert response.attempted_action == "confirm-booking"
    assert "does not create a booking" in response.message
