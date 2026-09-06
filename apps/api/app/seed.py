"""
Reference data every environment needs before anything else can be
inserted: roles, the Nigeria location hierarchy, property types, and
amenities. Idempotent (checks for an existing row by its natural key
before inserting), so running it twice against the same database is
safe rather than something to be careful about.

The location hierarchy mirrors apps/web/lib/locations.ts's STATES
constant exactly, on purpose: the frontend's seed properties and this
backend's location rows need to agree on the same slugs, or a
frontend listing's location would not resolve to a real row here.

Run with: python -m app.seed
"""

import asyncio

from sqlalchemy import select

from app.core.db import AsyncSessionLocal
from app.modules.locations.models import Area, City, Country, StateRegion
from app.modules.properties.models import Amenity, PropertyType
from app.modules.users.models import Role

ROLE_NAMES = ["tenant", "buyer", "landlord", "agent", "admin"]
"""Matches the client's stated Phase 1 roles (Tenant, Buyer, Landlord, Agent, Administrator) and the register
page's ROLE_OPTIONS (apps/web/app/(auth)/register/page.tsx). Buyer has no dedicated profile extension table,
same as the architecture doc's section 5, which only defines tenant_profiles, landlord_profiles, and
agent_profiles: a buyer's needs don't diverge from a bare user record yet."""

# Mirrors apps/web/lib/locations.ts's STATES constant. Keep these two in
# sync by hand for now; there is no shared source of truth between the
# Python backend and the TypeScript frontend yet.
NIGERIA_STATES = [
    {
        "name": "Lagos",
        "slug": "lagos",
        "include_state_in_label": False,
        "cities": [{"name": "Lagos", "slug": "lagos", "areas": ["Lekki Phase 1", "Ikoyi", "Epe", "Ikeja"]}],
    },
    {
        "name": "FCT",
        "slug": "fct",
        "include_state_in_label": False,
        "cities": [{"name": "Abuja", "slug": "abuja", "areas": ["Wuse 2"]}],
    },
    {
        "name": "Rivers",
        "slug": "rivers",
        "include_state_in_label": False,
        "cities": [{"name": "Port Harcourt", "slug": "port-harcourt", "areas": ["Old GRA"]}],
    },
    {
        "name": "Ogun",
        "slug": "ogun",
        "include_state_in_label": True,
        "cities": [
            {
                "name": "Abeokuta",
                "slug": "abeokuta",
                "areas": [
                    "GRA",
                    "Oke Ilewo",
                    "Kuto",
                    "Asero",
                    "Oke Mosan",
                    "Ibara",
                    "Obantoko",
                    "Adatan",
                    "Panseke",
                    "Lafenwa",
                ],
            }
        ],
    },
    {
        "name": "Oyo",
        "slug": "oyo",
        "include_state_in_label": True,
        "cities": [{"name": "Ibadan", "slug": "ibadan", "areas": ["Bodija", "Ring Road"]}],
    },
    {
        "name": "Edo",
        "slug": "edo",
        "include_state_in_label": True,
        "cities": [{"name": "Benin City", "slug": "benin-city", "areas": []}],
    },
    {
        "name": "Kwara",
        "slug": "kwara",
        "include_state_in_label": True,
        "cities": [{"name": "Ilorin", "slug": "ilorin", "areas": []}],
    },
]

# Per marketplace-expansion-audit-and-plan.md section 5's property types list.
PROPERTY_TYPES = [
    "self contain",
    "mini flat",
    "apartment",
    "duplex",
    "detached house",
    "semi detached house",
    "bungalow",
    "terrace",
    "land",
    "office",
    "shop",
    "warehouse",
    "commercial property",
]

AMENITIES = [
    "parking",
    "24/7 security",
    "borehole water",
    "generator backup",
    "air conditioning",
    "swimming pool",
    "gym",
    "elevator",
    "cctv",
    "fenced and gated",
    "fitted kitchen",
    "internet ready",
]


def slugify(value: str) -> str:
    return "-".join(value.lower().split())


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        for name in ROLE_NAMES:
            existing = await session.scalar(select(Role).where(Role.name == name))
            if not existing:
                session.add(Role(name=name))

        country = await session.scalar(select(Country).where(Country.slug == "nigeria"))
        if not country:
            country = Country(name="Nigeria", slug="nigeria")
            session.add(country)
            await session.flush()

        for state_data in NIGERIA_STATES:
            state = await session.scalar(select(StateRegion).where(StateRegion.slug == state_data["slug"]))
            if not state:
                state = StateRegion(
                    country_id=country.id,
                    name=state_data["name"],
                    slug=state_data["slug"],
                    include_state_in_label=state_data["include_state_in_label"],
                )
                session.add(state)
                await session.flush()

            for city_data in state_data["cities"]:
                city = await session.scalar(
                    select(City).where(City.state_id == state.id, City.slug == city_data["slug"])
                )
                if not city:
                    city = City(state_id=state.id, name=city_data["name"], slug=city_data["slug"])
                    session.add(city)
                    await session.flush()

                for area_name in city_data["areas"]:
                    area_slug = slugify(area_name)
                    existing_area = await session.scalar(
                        select(Area).where(Area.city_id == city.id, Area.slug == area_slug)
                    )
                    if not existing_area:
                        session.add(Area(city_id=city.id, name=area_name, slug=area_slug))

        for type_name in PROPERTY_TYPES:
            existing_type = await session.scalar(select(PropertyType).where(PropertyType.name == type_name))
            if not existing_type:
                session.add(PropertyType(name=type_name))

        for amenity_name in AMENITIES:
            existing_amenity = await session.scalar(select(Amenity).where(Amenity.name == amenity_name))
            if not existing_amenity:
                session.add(Amenity(name=amenity_name))

        await session.commit()
    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
