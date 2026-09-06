import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Role(Base, UUIDPrimaryKeyMixin):
    """A small, fixed lookup table (tenant, landlord, agent, admin), not an enum in code, per section 5."""

    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Core identity only, per section 5: email, phone, password_hash,
    status, primary_role. Role-specific fields live on the profile
    extension tables below, not here, so this stays lean regardless of
    how many role-specific fields tenant/landlord/agent profiles grow.
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
    __tablename__ = "tenant_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    preferred_locations: Mapped[str | None] = mapped_column(Text, nullable=True)
    """Free text for now; becomes a real relation to the locations hierarchy once search filters need it structured."""


class LandlordProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "landlord_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    business_name: Mapped[str | None] = mapped_column(String(255), nullable=True)


class AgentProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "agent_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    agency_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("agencies.id"), nullable=True)
    license_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_dealer: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    """Distinguishes a car dealer profile from a property agent profile, both sharing this one extension table."""
