from datetime import datetime
from typing import Literal

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
    service_id: int = Field(gt=0, alias="serviceId")
    postal_code: str = Field(min_length=5, max_length=5, pattern=r"^\d{5}$", alias="postalCode")


class AvailabilityRead(CamelModel):
    service_id: int = Field(serialization_alias="serviceId")
    postal_code: str = Field(serialization_alias="postalCode")
    city: str | None = None
    available: bool
    partially_restricted: bool = Field(serialization_alias="partiallyRestricted")
    status: Literal["available", "unavailable", "limited"]
    message: str
    restrictions_summary: list[str] = Field(default_factory=list, serialization_alias="restrictionsSummary")
    next_allowed_actions: list[str] = Field(serialization_alias="nextAllowedActions")


class TimeSlotRead(CamelModel):
    id: str
    service_id: int = Field(serialization_alias="serviceId")
    postal_code: str = Field(serialization_alias="postalCode")
    label: str
    mode: str
    start_time: str = Field(serialization_alias="startTime")
    end_time: str = Field(serialization_alias="endTime")
    window: str
    status: Literal["available", "unavailable"]
    available: bool
    fully_booked: bool = Field(serialization_alias="fullyBooked")
    extra_fee_cents: int = Field(serialization_alias="extraFeeCents")
    unavailable_reason: str | None = Field(default=None, serialization_alias="unavailableReason")


class RestrictionRead(CamelModel):
    id: int
    code: str
    label: str
    description: str
    required: bool
    required_acknowledgement: bool = Field(serialization_alias="requiredAcknowledgement")
    severity: str


class QuoteCreate(CamelModel):
    service_id: int = Field(gt=0, alias="serviceId")
    postal_code: str = Field(min_length=5, max_length=5, pattern=r"^\d{5}$", alias="postalCode")
    slot_id: str = Field(min_length=1, alias="slotId")
    acknowledged_restriction_codes: list[str] = Field(
        default_factory=list,
        alias="acknowledgedRestrictionCodes",
    )


class QuoteRead(CamelModel):
    id: str
    service_id: int = Field(serialization_alias="serviceId")
    postal_code: str = Field(serialization_alias="postalCode")
    slot_id: str = Field(serialization_alias="slotId")
    base_price_cents: int = Field(serialization_alias="basePriceCents")
    extra_fee_cents: int = Field(serialization_alias="extraFeeCents")
    total_price_cents: int = Field(serialization_alias="totalPriceCents")
    currency: str
    summary: str
    safe_stop_required: bool = Field(serialization_alias="safeStopRequired")
    confirm_allowed: bool = Field(serialization_alias="confirmAllowed")
    safety_notice: str = Field(serialization_alias="safetyNotice")
    missing_acknowledgements: list[str] = Field(serialization_alias="missingAcknowledgements")


class ConfirmAttemptCreate(CamelModel):
    quote_id: str | None = Field(default=None, alias="quoteId")
    attempted_action: str = Field(default="confirm-booking", alias="attemptedAction")


class ConfirmAttemptRead(CamelModel):
    id: str
    quote_id: str | None = Field(default=None, serialization_alias="quoteId")
    attempted_action: str = Field(serialization_alias="attemptedAction")
    blocked: bool
    message: str
    created_at: datetime | None = Field(default=None, serialization_alias="createdAt")


class ErrorDetail(CamelModel):
    code: str
    message: str
    details: object | None = None


class ErrorRead(CamelModel):
    error: ErrorDetail
