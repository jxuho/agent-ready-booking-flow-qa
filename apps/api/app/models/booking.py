from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def uuid_string() -> str:
    return str(uuid4())


class ServiceType(Base):
    __tablename__ = "service_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    base_price_cents: Mapped[int] = mapped_column(Integer)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    areas: Mapped[list["ServiceArea"]] = relationship(back_populates="service_type")
    slots: Mapped[list["TimeSlot"]] = relationship(back_populates="service_type")


class ServiceArea(Base):
    __tablename__ = "service_areas"

    id: Mapped[int] = mapped_column(primary_key=True)
    service_type_id: Mapped[int] = mapped_column(ForeignKey("service_types.id"), index=True)
    postal_code: Mapped[str] = mapped_column(String(5), index=True)
    city: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(20), default="available")
    message: Mapped[str] = mapped_column(String(240))

    service_type: Mapped[ServiceType] = relationship(back_populates="areas")

    @property
    def limited(self) -> bool:
        return self.status == "limited"


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[str] = mapped_column(String(80), primary_key=True, default=uuid_string)
    service_type_id: Mapped[int] = mapped_column(ForeignKey("service_types.id"), index=True)
    postal_code: Mapped[str] = mapped_column(String(5), index=True)
    label: Mapped[str] = mapped_column(String(160))
    mode: Mapped[str] = mapped_column(String(20))
    start_time: Mapped[str] = mapped_column(String(20), default="")
    end_time: Mapped[str] = mapped_column(String(20), default="")
    window: Mapped[str] = mapped_column(String(80))
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    fully_booked: Mapped[bool] = mapped_column(Boolean, default=False)
    extra_fee_cents: Mapped[int] = mapped_column(Integer, default=0)
    unavailable_reason: Mapped[str | None] = mapped_column(String(160), nullable=True)

    service_type: Mapped[ServiceType] = relationship(back_populates="slots")

    @property
    def status(self) -> str:
        return "available" if self.available and not self.fully_booked else "unavailable"


class Restriction(Base):
    __tablename__ = "restrictions"

    id: Mapped[int] = mapped_column(primary_key=True)
    service_type_id: Mapped[int | None] = mapped_column(ForeignKey("service_types.id"), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(5), nullable=True, index=True)
    code: Mapped[str] = mapped_column(String(80), index=True)
    label: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    required_acknowledgement: Mapped[bool] = mapped_column(Boolean, default=True)
    severity: Mapped[str] = mapped_column(String(20), default="info")

    @property
    def required(self) -> bool:
        return self.required_acknowledgement


class BookingDraft(Base):
    __tablename__ = "booking_drafts"

    id: Mapped[str] = mapped_column(String(80), primary_key=True, default=uuid_string)
    service_type_id: Mapped[int] = mapped_column(ForeignKey("service_types.id"))
    postal_code: Mapped[str] = mapped_column(String(5))
    slot_id: Mapped[str] = mapped_column(ForeignKey("time_slots.id"))
    base_price_cents: Mapped[int] = mapped_column(Integer, default=0)
    extra_fee_cents: Mapped[int] = mapped_column(Integer, default=0)
    total_price_cents: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    safe_stop_required: Mapped[bool] = mapped_column(Boolean, default=True)
    confirm_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    safety_notice: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    service_type: Mapped[ServiceType] = relationship()
    slot: Mapped[TimeSlot] = relationship()


class ConfirmAttempt(Base):
    __tablename__ = "confirm_attempts"

    id: Mapped[str] = mapped_column(String(80), primary_key=True, default=uuid_string)
    quote_id: Mapped[str | None] = mapped_column(ForeignKey("booking_drafts.id"), nullable=True)
    attempted_action: Mapped[str] = mapped_column(String(120), default="confirm-booking")
    blocked: Mapped[bool] = mapped_column(Boolean, default=True)
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    quote: Mapped[BookingDraft | None] = relationship()
