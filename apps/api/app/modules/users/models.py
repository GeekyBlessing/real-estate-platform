import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Role(Base, UUIDPrimaryKeyMixin):
    """A small, fixed lookup table (tenant, buyer, landlord, agent, car_dealer, private_seller, admin), not an enum in code, per section 5."""

    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Core identity only, per section 5: email, phone, password_hash,
    status, primary_role. Role-specific fields live on the profile
    extension tables below, not here, so this stays lean regardless of
    how many role-specific fields a profile grows.
    """

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(32), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active")
    """One of: active, suspended, deactivated. Soft status transitions, not a hard delete, per section 4."""

    primary_role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)

    email_verified_at: Mapped[str | None] = mapped_column(String, nullable=True)
    """Nullable timestamp string kept simple for this pass; a real email verification flow (section 8) sets this."""
    phone_verified_at: Mapped[str | None] = mapped_column(String, nullable=True)
    """Same shape as email_verified_at. Set once the phone verification code step (onboarding module) succeeds."""

    profile_photo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    """
    Shared across every role rather than duplicated per profile table: a profile photo is a property of the
    person, not of any one role they hold. Uploaded through the same media pipeline as verification documents
    (app/modules/verification/router.py), so it is a real, publicly reachable URL, never a bare filename.
    """

    token_version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    """Bumped to invalidate every previously issued access token at once. See core/security.py."""

    primary_role: Mapped["Role"] = relationship("Role", foreign_keys=[primary_role_id])
    role_links: Mapped[list["UserRole"]] = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")

    @property
    def role_names(self) -> list[str]:
        return [link.role.name for link in self.role_links]


class UserRole(Base, UUIDPrimaryKeyMixin):
    """
    Many-to-many between users and roles, per section 5: "a person can
    hold more than one role (e.g. an agent who is also a tenant)
    without a migration."
    """

    __tablename__ = "user_roles"
    __table_args__ = (UniqueConstraint("user_id", "role_id", name="uq_user_roles_user_role"),)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="role_links")
    role: Mapped["Role"] = relationship("Role")


class Agency(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Optional parent entity for an agent_profile, per section 5. Not
    used for individual agents in Phase 1, present so agent-team
    functionality later does not require restructuring property
    ownership.
    """

    __tablename__ = "agencies"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    registration_number: Mapped[str | None] = mapped_column(String(64), nullable=True)


class TenantProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Shared extension table for both browsing roles, buyer and renter
    (the "tenant" role slug predates this rename; see seed.py's
    ROLE_NAMES comment). A buyer and a renter ask the same shape of
    question, "where, what kind of place, roughly what budget", so one
    table with an intent column avoids two near identical tables that
    would drift apart the first time one of them changes.
    """

    __tablename__ = "tenant_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    preferred_locations: Mapped[str | None] = mapped_column(Text, nullable=True)
    """Legacy free text kept for backward compatibility with any row written before preferred_location_slugs existed."""

    intent: Mapped[str | None] = mapped_column(String(16), nullable=True)
    """buy | rent | both. Null until onboarding sets it; a bare account should not be forced to pick this."""
    preferred_location_slugs: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    """City slugs from apps/web/lib/locations.ts. A loose reference (no FK), matching how AgentOnboardingFlow already treats operating cities."""
    preferred_property_types: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    budget_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    budget_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    interested_in_cars: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    car_preferences: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    preferences_skipped: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    """True when the user explicitly chose "Skip for now" on the preferences step, distinct from never having reached it."""
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class LandlordProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "landlord_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    business_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    residential_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    state_of_residence_slug: Mapped[str | None] = mapped_column(String(64), nullable=True)
    nin: Mapped[str | None] = mapped_column(String(32), nullable=True)
    """
    National Identification Number. Never returned by any schema outside a masked last-four form (see
    users/schemas.py); readable in full only by the owner's own verification review and by an admin, matching
    the brief's instruction not to expose sensitive identity data more broadly than the review it supports.
    """
    ownership_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    """What the landlord told us about how they hold the property (owner, family property, managing on behalf of, etc). Reviewed, never taken as proof of title on its own."""
    property_count_estimate: Mapped[str | None] = mapped_column(String(16), nullable=True)
    """A coarse bucket ("1", "2-5", "6+"), not a running count: this is onboarding context, not the source of truth for how many listings a landlord actually has."""
    operating_location_slugs: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AgentProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "agent_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    agency_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("agencies.id"), nullable=True)
    license_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_dealer: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    """
    Deprecated: earlier modeling distinguished a car dealer from a property agent with this one flag on a
    shared table. Car dealers now register under the separate car_dealer role and CarDealerProfile below,
    which fits their actual fields (dealership name, CAC number) far better than an agent's (license number,
    agency). Column kept, not dropped, so no historical data is lost; new dealer registrations never set it.
    """

    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    residential_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    state_of_residence_slug: Mapped[str | None] = mapped_column(String(64), nullable=True)
    nin: Mapped[str | None] = mapped_column(String(32), nullable=True)
    years_experience: Mapped[str | None] = mapped_column(String(16), nullable=True)
    specializations: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    operates_as: Mapped[str | None] = mapped_column(String(16), nullable=True)
    """independent | agency."""
    agency_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    agency_registration_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    operating_location_slugs: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class CarDealerProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A registered dealership selling vehicles, distinct from an individual private seller (PrivateSellerProfile below) and from a property agent (AgentProfile)."""

    __tablename__ = "car_dealer_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    nin: Mapped[str | None] = mapped_column(String(32), nullable=True)
    dealership_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    business_registration_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    """CAC registration number, where the dealership has one."""
    dealership_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    years_in_business: Mapped[str | None] = mapped_column(String(16), nullable=True)
    specialties: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    """What the dealership mainly sells: for example new vehicles, used vehicles, a specific set of makes."""
    operating_location_slugs: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class PrivateSellerProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    An individual selling their own vehicle, not a dealership. Kept deliberately light per the brief: identity
    verification and location now, vehicle information only once the seller actually starts a listing, which
    is out of this module's scope (see PropertyListingFlow/SellACarFlow for that step).
    """

    __tablename__ = "private_seller_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    nin: Mapped[str | None] = mapped_column(String(32), nullable=True)
    location_slug: Mapped[str | None] = mapped_column(String(64), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class OnboardingProgress(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    One row per user, tracking whatever role-based onboarding they are
    currently in the middle of (or last completed). Exists so a user
    can leave mid-flow, on any device, and pick back up exactly where
    they left off: draft_data holds field values that have not yet
    been validated and copied onto the real profile columns above,
    which only happens on a real submit, not on every keystroke.

    Deliberately one row per user rather than one per role: the brief
    describes a single active "which role are you setting up" flow at
    a time, not several in parallel, and a second table per role would
    be exactly the duplicate-model risk the brief warns against.
    """

    __tablename__ = "onboarding_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    """Which role this onboarding progress belongs to. Matches Role.name; may differ from primary_role_id if the user is onboarding into an additional role."""
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="not_started")
    """not_started | in_progress | completed."""
    current_step: Mapped[str | None] = mapped_column(String(32), nullable=True)
    draft_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
