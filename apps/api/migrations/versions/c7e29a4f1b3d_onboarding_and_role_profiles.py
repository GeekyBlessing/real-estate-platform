"""Registration and onboarding data model

Adds the two roles the registration redesign needs that had no distinct
profile table before (car_dealer, private_seller), a phone_verified_at
and shared profile_photo_url column on users, the onboarding fields each
existing profile table (tenant, landlord, agent) needs to collect during
progressive onboarding, and onboarding_progress for save-and-resume.

Revision ID: c7e29a4f1b3d
Revises: b4a1f9c7d2e6
Create Date: 2026-09-08
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "c7e29a4f1b3d"
down_revision = "b4a1f9c7d2e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone_verified_at", sa.String(), nullable=True))
    op.add_column("users", sa.Column("profile_photo_url", sa.String(length=1024), nullable=True))

    op.add_column("tenant_profiles", sa.Column("intent", sa.String(length=16), nullable=True))
    op.add_column("tenant_profiles", sa.Column("preferred_location_slugs", postgresql.JSONB(), nullable=True))
    op.add_column("tenant_profiles", sa.Column("preferred_property_types", postgresql.JSONB(), nullable=True))
    op.add_column("tenant_profiles", sa.Column("budget_min", sa.Integer(), nullable=True))
    op.add_column("tenant_profiles", sa.Column("budget_max", sa.Integer(), nullable=True))
    op.add_column("tenant_profiles", sa.Column("bedrooms", sa.Integer(), nullable=True))
    op.add_column(
        "tenant_profiles", sa.Column("interested_in_cars", sa.Boolean(), nullable=False, server_default=sa.false())
    )
    op.add_column("tenant_profiles", sa.Column("car_preferences", postgresql.JSONB(), nullable=True))
    op.add_column(
        "tenant_profiles", sa.Column("preferences_skipped", sa.Boolean(), nullable=False, server_default=sa.false())
    )
    op.add_column("tenant_profiles", sa.Column("onboarding_completed_at", sa.DateTime(timezone=True), nullable=True))

    op.add_column("landlord_profiles", sa.Column("date_of_birth", sa.Date(), nullable=True))
    op.add_column("landlord_profiles", sa.Column("residential_address", sa.Text(), nullable=True))
    op.add_column("landlord_profiles", sa.Column("state_of_residence_slug", sa.String(length=64), nullable=True))
    op.add_column("landlord_profiles", sa.Column("nin", sa.String(length=32), nullable=True))
    op.add_column("landlord_profiles", sa.Column("ownership_notes", sa.Text(), nullable=True))
    op.add_column("landlord_profiles", sa.Column("property_count_estimate", sa.String(length=16), nullable=True))
    op.add_column("landlord_profiles", sa.Column("operating_location_slugs", postgresql.JSONB(), nullable=True))
    op.add_column("landlord_profiles", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column("landlord_profiles", sa.Column("onboarding_completed_at", sa.DateTime(timezone=True), nullable=True))

    op.add_column("agent_profiles", sa.Column("date_of_birth", sa.Date(), nullable=True))
    op.add_column("agent_profiles", sa.Column("residential_address", sa.Text(), nullable=True))
    op.add_column("agent_profiles", sa.Column("state_of_residence_slug", sa.String(length=64), nullable=True))
    op.add_column("agent_profiles", sa.Column("nin", sa.String(length=32), nullable=True))
    op.add_column("agent_profiles", sa.Column("years_experience", sa.String(length=16), nullable=True))
    op.add_column("agent_profiles", sa.Column("specializations", postgresql.JSONB(), nullable=True))
    op.add_column("agent_profiles", sa.Column("operates_as", sa.String(length=16), nullable=True))
    op.add_column("agent_profiles", sa.Column("agency_name", sa.String(length=255), nullable=True))
    op.add_column("agent_profiles", sa.Column("agency_registration_number", sa.String(length=64), nullable=True))
    op.add_column("agent_profiles", sa.Column("operating_location_slugs", postgresql.JSONB(), nullable=True))
    op.add_column("agent_profiles", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column("agent_profiles", sa.Column("onboarding_completed_at", sa.DateTime(timezone=True), nullable=True))

    op.create_table(
        "car_dealer_profiles",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("nin", sa.String(length=32), nullable=True),
        sa.Column("dealership_name", sa.String(length=255), nullable=True),
        sa.Column("business_registration_number", sa.String(length=64), nullable=True),
        sa.Column("dealership_address", sa.Text(), nullable=True),
        sa.Column("years_in_business", sa.String(length=16), nullable=True),
        sa.Column("specialties", postgresql.JSONB(), nullable=True),
        sa.Column("operating_location_slugs", postgresql.JSONB(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("onboarding_completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "private_seller_profiles",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("nin", sa.String(length=32), nullable=True),
        sa.Column("location_slug", sa.String(length=64), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("onboarding_completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "onboarding_progress",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="not_started"),
        sa.Column("current_step", sa.String(length=32), nullable=True),
        sa.Column("draft_data", postgresql.JSONB(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("onboarding_progress")
    op.drop_table("private_seller_profiles")
    op.drop_table("car_dealer_profiles")

    for column in (
        "onboarding_completed_at",
        "bio",
        "operating_location_slugs",
        "agency_registration_number",
        "agency_name",
        "operates_as",
        "specializations",
        "years_experience",
        "nin",
        "state_of_residence_slug",
        "residential_address",
        "date_of_birth",
    ):
        op.drop_column("agent_profiles", column)

    for column in (
        "onboarding_completed_at",
        "bio",
        "operating_location_slugs",
        "property_count_estimate",
        "ownership_notes",
        "nin",
        "state_of_residence_slug",
        "residential_address",
        "date_of_birth",
    ):
        op.drop_column("landlord_profiles", column)

    for column in (
        "onboarding_completed_at",
        "preferences_skipped",
        "car_preferences",
        "interested_in_cars",
        "bedrooms",
        "budget_max",
        "budget_min",
        "preferred_property_types",
        "preferred_location_slugs",
        "intent",
    ):
        op.drop_column("tenant_profiles", column)

    op.drop_column("users", "profile_photo_url")
    op.drop_column("users", "phone_verified_at")
