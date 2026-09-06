import uuid

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin

"""
This module's schema is the shared Listing envelope described in
marketplace-expansion-audit-and-plan.md section 3, not the
property-only schema in the original architecture doc's section 5.
The product itself moved to a two category marketplace (property and
cars) after that document was written, and the plan doc's own
audit called out that a real Listing table, with Property and Vehicle
as specializations, needs to exist before a second migration would
otherwise be forced later. This is that table, built the right way
the first time rather than copying the property-only design and
bolting a near-duplicate vehicles table on beside it.
"""


class PropertyType(Base, UUIDPrimaryKeyMixin):
    """Configurable via admin rather than an enum in code, per the architecture doc's section 5."""

    __tablename__ = "property_types"

    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)


class Amenity(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "amenities"

    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)


class Listing(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    The shared spine every listing sits on, whatever category it
    belongs to, mirroring ListingBase in apps/web/lib/listings.ts.
    Category specific fields live on Property or Vehicle below, never
    here, the same discipline the frontend interface already follows.
    """

    __tablename__ = "listings"

    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(16), nullable=False)
    """"property" or "vehicle". Not a Postgres enum, to keep adding a third category a data change, not a migration."""
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")

    listing_type: Mapped[str | None] = mapped_column(String(16), nullable=True)
    """"rent" or "sale". Nullable since a vehicle listing has no equivalent distinction."""
    rent_period: Mapped[str | None] = mapped_column(String(8), nullable=True)
    """"month" or "year", only meaningful when listing_type is "rent"."""

    price_in_minor_units: Mapped[int] = mapped_column(Integer, nullable=False)
    """Kobo, never floating point, per the architecture doc's database principles (section 4)."""
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="NGN")

    city_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)
    area_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("areas.id"), nullable=True)

    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    agency_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("agencies.id"), nullable=True)

    availability_status: Mapped[str] = mapped_column(String(24), nullable=False, default="draft")
    """One of: draft, published, under_offer, let, sold, archived. The listing publishing state machine."""

    verification_state: Mapped[str] = mapped_column(String(16), nullable=False, default="unverified")
    """unverified | pending | verified | rejected | flagged | suspended, matching components/ui/Badge.tsx's VerificationState."""
    verification_detail: Mapped[str] = mapped_column(Text, nullable=False, default="")

    property: Mapped["Property | None"] = relationship("Property", back_populates="listing", uselist=False, cascade="all, delete-orphan")
    vehicle: Mapped["Vehicle | None"] = relationship("Vehicle", back_populates="listing", uselist=False, cascade="all, delete-orphan")


class Property(Base, TimestampMixin):
    """
    The property specialization of Listing, mirroring PropertyCardData
    and PropertyDetail (apps/web/components/property/PropertyCard.tsx,
    apps/web/lib/mock-data.ts). listing_id is both the primary key and
    the foreign key, a strict one to one extension of Listing.
    """

    __tablename__ = "properties"

    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    property_type_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("property_types.id"), nullable=False)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    size_sqm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    furnishing_status: Mapped[str | None] = mapped_column(String(24), nullable=True)
    """furnished | serviced | unfurnished, matching the filters described in marketplace-expansion-audit-and-plan.md section 5."""

    listing: Mapped["Listing"] = relationship("Listing", back_populates="property")


class Vehicle(Base, TimestampMixin):
    """
    The vehicle specialization of Listing, mirroring VehicleCardData
    and VehicleDetail (apps/web/lib/listings.ts). Deliberately its own
    field set, not a relabeled Property, matching the frontend's own
    stated principle that a car's information hierarchy is genuinely
    different from a property's.
    """

    __tablename__ = "vehicles"

    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    make: Mapped[str] = mapped_column(String(64), nullable=False)
    model: Mapped[str] = mapped_column(String(64), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    mileage_km: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    transmission: Mapped[str] = mapped_column(String(16), nullable=False)
    """automatic | manual."""
    fuel_type: Mapped[str] = mapped_column(String(24), nullable=False)
    condition: Mapped[str] = mapped_column(String(24), nullable=False)
    """brand new | nigerian used | foreign used."""
    body_type: Mapped[str] = mapped_column(String(32), nullable=False)

    listing: Mapped["Listing"] = relationship("Listing", back_populates="vehicle")


class ListingAmenity(Base):
    """Join table between listings and amenities, kept generic to category rather than property specific."""

    __tablename__ = "listing_amenities"
    # No separate UniqueConstraint here: the composite primary key below
    # already guarantees one row per (listing_id, amenity_id) pair.

    listing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True
    )
    amenity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("amenities.id"), primary_key=True)


class Favorite(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """user_id + listing_id, unique constraint, per section 5. Replaces the boolean isFavorited flag on mock listing objects."""

    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "listing_id", name="uq_favorites_user_listing"),)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
