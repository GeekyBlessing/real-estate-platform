import uuid

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, UUIDPrimaryKeyMixin


class Country(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "countries"

    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)


class StateRegion(Base, UUIDPrimaryKeyMixin):
    """Named StateRegion, not State, to avoid colliding with SQLAlchemy's own State import elsewhere."""

    __tablename__ = "states"
    __table_args__ = (UniqueConstraint("country_id", "slug", name="uq_states_country_slug"),)

    country_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("countries.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), nullable=False)
    include_state_in_label: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    """Mirrors StateRegion.includeInLabel in apps/web/lib/locations.ts: whether a formatted label spells out the state."""


class City(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "cities"
    __table_args__ = (UniqueConstraint("state_id", "slug", name="uq_cities_state_slug"),)

    state_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("states.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), nullable=False)

    state: Mapped["StateRegion"] = relationship("StateRegion")


class Area(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "areas"
    __table_args__ = (UniqueConstraint("city_id", "slug", name="uq_areas_city_slug"),)

    city_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), nullable=False)
