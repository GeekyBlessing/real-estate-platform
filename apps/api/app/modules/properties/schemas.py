import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

LAUNCH_CITY_SLUGS = {"lagos", "abeokuta"}
"""
Mirrors apps/web/lib/locations.ts's LAUNCH_CITIES exactly. There is no
shared source of truth between the Python backend and the TypeScript
frontend yet (see app/seed.py's own docstring making the same point
about the location hierarchy), so this stays a second, hand kept copy
on purpose: a real listing must never be creatable in a city the rest
of the product does not consider live, and that has to be enforced
here, not only by the frontend disabling a chip. Widen this set only
once LAUNCH_CITIES on the frontend is widened too.
"""

PROPERTY_TRANSACTION_TYPES = {"rent", "sale"}
VEHICLE_TRANSMISSIONS = {"automatic", "manual"}
VEHICLE_CONDITIONS = {"brand new", "nigerian used", "foreign used"}

ROLES_ALLOWED_TO_LIST_PROPERTY = {"landlord", "agent"}
ROLES_ALLOWED_TO_LIST_VEHICLE = {"car_dealer", "private_seller"}


class LocationOut(BaseModel):
    state: str
    state_slug: str
    city: str
    city_slug: str
    area: str | None = None
    area_slug: str | None = None
    label: str


class SellerOut(BaseModel):
    slug: str
    """The seller's user id. Not a mock agent slug: see lib/mock-data.ts's Agent record for that separate, older concept."""
    name: str
    role: str
    """agent | landlord | dealer | private seller, matching ListingBase["listedBy"]["role"] in lib/listings.ts."""


class ImageOut(BaseModel):
    url: str
    thumbnail_url: str | None = None
    alt: str


class ListingCardOut(BaseModel):
    """Matches PropertyCardData / VehicleCardData (lib/listings.ts, components/property/PropertyCard.tsx) field for field."""

    id: uuid.UUID
    slug: str
    title: str
    category: str
    location: LocationOut
    price_in_kobo: int
    images: list[ImageOut]
    verification_state: str
    verification_detail: str
    listed_by: SellerOut

    # Property only
    property_type: str | None = None
    listing_type: str | None = None
    rent_period: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    size_sqm: int | None = None

    # Vehicle only
    make: str | None = None
    model: str | None = None
    year: int | None = None
    mileage_km: int | None = None
    transmission: str | None = None
    fuel_type: str | None = None
    condition: str | None = None
    body_type: str | None = None


class ListingDetailOut(ListingCardOut):
    """Matches PropertyDetail / VehicleDetail: the card fields plus what only the detail page needs."""

    description: str
    amenities: list[str] = Field(default_factory=list)
    furnishing_status: str | None = None
    availability: str | None = None
    features: list[str] = Field(default_factory=list)
    availability_status: str
    """draft | pending_review | published | rejected | under_offer | let | sold | archived. Only meaningful to the owner and admins; a public read never returns anything but a published listing."""
    owner_user_id: uuid.UUID


class CreatePropertyListingRequest(BaseModel):
    transaction_type: str
    rent_period: str | None = None
    property_type: str
    bedrooms: int | None = None
    bathrooms: int
    size_sqm: int
    furnishing_status: str
    city_slug: str
    area_slug: str | None = None
    street_address: str
    amenities: list[str] = Field(default_factory=list)
    price_naira: int
    description: str
    media_ids: list[uuid.UUID] = Field(default_factory=list)

    @field_validator("transaction_type")
    @classmethod
    def valid_transaction_type(cls, value: str) -> str:
        if value not in PROPERTY_TRANSACTION_TYPES:
            raise ValueError("Choose whether this is for rent or for sale.")
        return value

    @field_validator("property_type")
    @classmethod
    def non_blank_property_type(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Choose a property type.")
        return value.strip().lower()

    @field_validator("price_naira")
    @classmethod
    def positive_price(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("Enter a price greater than zero.")
        return value

    @field_validator("description")
    @classmethod
    def real_description(cls, value: str) -> str:
        if len(value.strip()) < 20:
            raise ValueError("Description must be at least 20 characters.")
        return value.strip()

    @field_validator("street_address")
    @classmethod
    def non_blank_address(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Enter the property's street address.")
        return value.strip()


class CreateVehicleListingRequest(BaseModel):
    make: str
    model: str
    year: int
    mileage_km: int
    transmission: str
    fuel_type: str
    condition: str
    body_type: str
    city_slug: str
    price_naira: int
    description: str
    features: list[str] = Field(default_factory=list)
    media_ids: list[uuid.UUID] = Field(default_factory=list)

    @field_validator("transmission")
    @classmethod
    def valid_transmission(cls, value: str) -> str:
        if value.lower() not in VEHICLE_TRANSMISSIONS:
            raise ValueError("Choose a valid transmission type.")
        return value.lower()

    @field_validator("condition")
    @classmethod
    def valid_condition(cls, value: str) -> str:
        if value.lower() not in VEHICLE_CONDITIONS:
            raise ValueError("Choose a valid vehicle condition.")
        return value.lower()

    @field_validator("price_naira")
    @classmethod
    def positive_price(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("Enter a price greater than zero.")
        return value

    @field_validator("description")
    @classmethod
    def real_description(cls, value: str) -> str:
        if len(value.strip()) < 20:
            raise ValueError("Description must be at least 20 characters.")
        return value.strip()

    @field_validator("make", "model", "body_type")
    @classmethod
    def non_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("This field is required.")
        return value.strip()


class UpdatePropertyListingRequest(CreatePropertyListingRequest):
    """Same shape as create: editing a draft or a rejected listing replaces its editable fields wholesale rather than patching one at a time, matching how PropertyListingFlow already collects the whole form before saving."""


class UpdateVehicleListingRequest(CreateVehicleListingRequest):
    """Same shape as create: see UpdatePropertyListingRequest."""


class ListingDecisionRequest(BaseModel):
    approve: bool
    reason: str | None = None

    @field_validator("reason")
    @classmethod
    def reason_required_on_reject(cls, value: str | None, info) -> str | None:
        # Cross field validation (approve must be read too) happens in the service layer,
        # since Pydantic v2 field_validator only sees this field's own value reliably here.
        return value.strip() if value else value


class AdminListingQueueItemOut(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    category: str
    submitted_at: datetime | None
    owner_name: str
    owner_email: str
