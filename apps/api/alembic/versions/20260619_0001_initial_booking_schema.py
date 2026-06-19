"""Initial booking flow schema.

Revision ID: 20260619_0001
Revises:
Create Date: 2026-06-19
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260619_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "service_types",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("base_price_cents", sa.Integer(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
    )
    op.create_index(op.f("ix_service_types_slug"), "service_types", ["slug"], unique=True)

    op.create_table(
        "service_areas",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("service_type_id", sa.Integer(), sa.ForeignKey("service_types.id"), nullable=False),
        sa.Column("postal_code", sa.String(length=5), nullable=False),
        sa.Column("city", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("message", sa.String(length=240), nullable=False),
    )
    op.create_index(op.f("ix_service_areas_service_type_id"), "service_areas", ["service_type_id"])
    op.create_index(op.f("ix_service_areas_postal_code"), "service_areas", ["postal_code"])

    op.create_table(
        "time_slots",
        sa.Column("id", sa.String(length=80), primary_key=True),
        sa.Column("service_type_id", sa.Integer(), sa.ForeignKey("service_types.id"), nullable=False),
        sa.Column("postal_code", sa.String(length=5), nullable=False),
        sa.Column("label", sa.String(length=160), nullable=False),
        sa.Column("mode", sa.String(length=20), nullable=False),
        sa.Column("start_time", sa.String(length=20), nullable=False),
        sa.Column("end_time", sa.String(length=20), nullable=False),
        sa.Column("window", sa.String(length=80), nullable=False),
        sa.Column("available", sa.Boolean(), nullable=False),
        sa.Column("fully_booked", sa.Boolean(), nullable=False),
        sa.Column("extra_fee_cents", sa.Integer(), nullable=False),
        sa.Column("unavailable_reason", sa.String(length=160), nullable=True),
    )
    op.create_index(op.f("ix_time_slots_service_type_id"), "time_slots", ["service_type_id"])
    op.create_index(op.f("ix_time_slots_postal_code"), "time_slots", ["postal_code"])

    op.create_table(
        "restrictions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("service_type_id", sa.Integer(), sa.ForeignKey("service_types.id"), nullable=True),
        sa.Column("postal_code", sa.String(length=5), nullable=True),
        sa.Column("code", sa.String(length=80), nullable=False),
        sa.Column("label", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("required_acknowledgement", sa.Boolean(), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
    )
    op.create_index(op.f("ix_restrictions_code"), "restrictions", ["code"])
    op.create_index(op.f("ix_restrictions_postal_code"), "restrictions", ["postal_code"])

    op.create_table(
        "booking_drafts",
        sa.Column("id", sa.String(length=80), primary_key=True),
        sa.Column("service_type_id", sa.Integer(), sa.ForeignKey("service_types.id"), nullable=False),
        sa.Column("postal_code", sa.String(length=5), nullable=False),
        sa.Column("slot_id", sa.String(length=80), sa.ForeignKey("time_slots.id"), nullable=False),
        sa.Column("base_price_cents", sa.Integer(), nullable=False),
        sa.Column("extra_fee_cents", sa.Integer(), nullable=False),
        sa.Column("total_price_cents", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("safe_stop_required", sa.Boolean(), nullable=False),
        sa.Column("confirm_allowed", sa.Boolean(), nullable=False),
        sa.Column("safety_notice", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "confirm_attempts",
        sa.Column("id", sa.String(length=80), primary_key=True),
        sa.Column("quote_id", sa.String(length=80), sa.ForeignKey("booking_drafts.id"), nullable=True),
        sa.Column("attempted_action", sa.String(length=120), nullable=False),
        sa.Column("blocked", sa.Boolean(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("confirm_attempts")
    op.drop_table("booking_drafts")
    op.drop_index(op.f("ix_restrictions_postal_code"), table_name="restrictions")
    op.drop_index(op.f("ix_restrictions_code"), table_name="restrictions")
    op.drop_table("restrictions")
    op.drop_index(op.f("ix_time_slots_postal_code"), table_name="time_slots")
    op.drop_index(op.f("ix_time_slots_service_type_id"), table_name="time_slots")
    op.drop_table("time_slots")
    op.drop_index(op.f("ix_service_areas_postal_code"), table_name="service_areas")
    op.drop_index(op.f("ix_service_areas_service_type_id"), table_name="service_areas")
    op.drop_table("service_areas")
    op.drop_index(op.f("ix_service_types_slug"), table_name="service_types")
    op.drop_table("service_types")
