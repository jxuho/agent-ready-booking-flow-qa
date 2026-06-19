from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CamelModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class HealthRead(CamelModel):
    status: str
    safe_stop_enforced: bool = Field(serialization_alias="safeStopEnforced")


class ServiceTypeRead(CamelModel):
    id: int
    slug: str
    name: str
    description: str
    base_price_cents: int = Field(serialization_alias="basePriceCents")
    active: bool


class AvailabilityCheckRequest(CamelModel):
    service_id: int = Field(gt=0, validation_alias="serviceId")
    postal_code: str = Field(min_length=5, max_length=5, pattern=r"^\d{5}$", validation_alias="postalCode")


class AvailabilityRead(CamelModel):
    service_id: int = Field(serialization_alias="serviceId")
    postal_code: str = Field(serialization_alias="postalCode")
    city: str | None = None
    available: bool
    partially_restricted: bool = Field(serialization_alias="partiallyRestricted")
    status: str
    message: str
    next_allowed_actions: list[str] = Field(serialization_alias="nextAllowedActions")


class TimeSlotRead(CamelModel):
    id: str
    service_id: int = Field(serialization_alias="serviceId")
    postal_code: str = Field(serialization_alias="postalCode")
    label: str
    mode: str
    window: str
    available: bool
    fully_booked: bool = Field(serialization_alias="fullyBooked")
    extra_fee_cents: int = Field(serialization_alias="extraFeeCents")
    unavailable_reason: str | None = Field(default=None, serialization_alias="unavailableReason")


class RestrictionRead(CamelModel):
    id: int
    code: str
    label: str
    description: str
    required_acknowledgement: bool = Field(serialization_alias="requiredAcknowledgement")
    severity: str


class QuoteCreate(CamelModel):
    service_id: int = Field(gt=0, validation_alias="serviceId")
    postal_code: str = Field(min_length=5, max_length=5, pattern=r"^\d{5}$", validation_alias="postalCode")
    slot_id: str = Field(min_length=1, validation_alias="slotId")
    acknowledged_restriction_codes: list[str] = Field(
        default_factory=list,
        validation_alias="acknowledgedRestrictionCodes",
    )


class QuoteRead(CamelModel):
    id: str
    service_id: int = Field(serialization_alias="serviceId")
    postal_code: str = Field(serialization_alias="postalCode")
    slot_id: str = Field(serialization_alias="slotId")
    total_price_cents: int = Field(serialization_alias="totalPriceCents")
    currency: str
    safe_stop_required: bool = Field(serialization_alias="safeStopRequired")
    confirm_allowed: bool = Field(serialization_alias="confirmAllowed")
    safety_notice: str = Field(serialization_alias="safetyNotice")
    missing_acknowledgements: list[str] = Field(serialization_alias="missingAcknowledgements")


class ConfirmAttemptCreate(CamelModel):
    quote_id: str | None = Field(default=None, validation_alias="quoteId")
    attempted_action: str = Field(default="confirm-booking", validation_alias="attemptedAction")


class ConfirmAttemptRead(CamelModel):
    id: str
    quote_id: str | None = Field(default=None, serialization_alias="quoteId")
    attempted_action: str = Field(serialization_alias="attemptedAction")
    blocked: bool
    message: str
    created_at: datetime | None = Field(default=None, serialization_alias="createdAt")
