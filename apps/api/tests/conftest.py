"""
Shared pytest fixtures for the whole suite. Runs against a real
Postgres database, ownit_test, migrated with the same Alembic history
as development and production (see the project README's "run the
tests" instructions), not sqlite or a mocked session: the bugs this
suite exists to catch, the async lazy-load crash and the int32 price
overflow described in properties/models.py, only ever showed up
against a real Postgres connection.

DATABASE_URL is overridden to point at ownit_test before anything
under app/ is imported, so every module's module-level engine (see
app/core/db.py) binds to the test database for the lifetime of the
test process, not the development one. This file's first lines matter
more than usual for that reason: nothing above the os.environ.setdefault
call may import anything from app.
"""

import os
import uuid

os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+asyncpg://ownit_dev:ownit_dev@localhost:5432/ownit_test"
)

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

from app.core.db import AsyncSessionLocal, Base, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.modules.users.models import User  # noqa: E402
from app.modules.users.repository import add_role_to_user, get_by_id  # noqa: E402
from app.seed import seed as seed_reference_data  # noqa: E402


@pytest_asyncio.fixture(autouse=True)
async def reset_database():
    """
    Truncates every application table and reseeds reference data
    (roles, the Nigeria location hierarchy, property types, amenities)
    before each test, rather than wrapping each test in a rolled-back
    transaction: the app under test opens and commits its own sessions
    per request (see app/core/db.py's get_db), so a single outer
    transaction this fixture holds open would not actually see those
    commits roll back cleanly. Truncate-and-reseed is slower but
    matches how the real app really uses the database.
    """
    # pytest-asyncio gives each test function its own event loop by
    # default, but app/core/db.py's engine and its connection pool are
    # created once at import time, under whichever loop happened to be
    # running the first time something used it. Disposing the pool
    # here, at the start of every test, drops any connection left over
    # from a previous (now closed) loop, so the very next checkout
    # opens a fresh asyncpg connection under this test's own loop
    # instead of asyncpg raising "attached to a different loop".
    await engine.dispose()
    async with engine.begin() as conn:
        table_names = [table.name for table in Base.metadata.sorted_tables]
        if table_names:
            quoted = ", ".join(f'"{name}"' for name in table_names)
            await conn.execute(text(f"TRUNCATE TABLE {quoted} RESTART IDENTITY CASCADE"))
    await seed_reference_data()
    yield


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"X-Ile-Client": "web"}) as ac:
        yield ac


def random_phone() -> str:
    import random

    return "0" + "".join(str(random.randint(0, 9)) for _ in range(10))


async def register_user(client: AsyncClient, *, role: str, full_name: str = "Test User", password: str = "TestPass123!") -> dict:
    """
    Registers a real account through POST /auth/register, the same
    endpoint the frontend uses, rather than inserting a User row
    directly: exercising the real validation and password hashing path
    is part of what these tests are meant to cover. Returns the
    endpoint's own response plus the email and password used, so a
    test can log back in later if it needs a fresh token.
    """
    email = f"{role}_{uuid.uuid4().hex[:10]}@test.com"
    response = await client.post(
        "/auth/register",
        json={"full_name": full_name, "email": email, "phone": random_phone(), "password": password, "role": role},
    )
    assert response.status_code == 201, response.text
    data = response.json()
    return {
        "email": email,
        "password": password,
        "access_token": data["access_token"],
        "user_id": data["user"]["id"],
    }


async def promote_to_admin(user_id: str) -> None:
    """
    Mirrors how a real admin role grant happens: there is no self
    registration path for "admin" (see auth/schemas.py's
    VALID_REGISTRATION_ROLES), so this calls the same
    add_role_to_user used by onboarding's own server side role grants,
    directly against the database, the way a real ops or seed process
    would.
    """
    async with AsyncSessionLocal() as db:
        user = await get_by_id(db, uuid.UUID(user_id))
        assert user is not None
        await add_role_to_user(db, user=user, role_name="admin")
        await db.commit()


async def create_published_property(client: AsyncClient, *, city_slug: str = "lagos") -> dict:
    """
    Full pipeline in one call for tests that need a real published
    listing rather than being about the pipeline itself: register a
    landlord, create a draft, attach no media (media upload needs a
    real file and is covered by its own tests elsewhere), submit is
    skipped in favor of driving the service layer directly so tests
    that only need "a published listing exists" do not also depend on
    the media-upload flow succeeding. Returns the owner's credentials
    and the listing.
    """
    owner = await register_user(client, role="landlord", full_name="Test Landlord")
    headers = {"Authorization": f"Bearer {owner['access_token']}"}
    create = await client.post(
        "/listings/property",
        headers=headers,
        json={
            "transaction_type": "rent",
            "rent_period": "year",
            "property_type": "apartment",
            "bedrooms": 2,
            "bathrooms": 2,
            "size_sqm": 85,
            "furnishing_status": "furnished",
            "city_slug": city_slug,
            "street_address": "1 Test Close",
            "amenities": ["parking"],
            "price_naira": 2_500_000,
            "description": "A real end to end test listing created by the automated test suite.",
            "media_ids": [],
        },
    )
    assert create.status_code == 200, create.text
    listing = create.json()

    admin = await register_user(client, role="buyer", full_name="Test Admin")
    await promote_to_admin(admin["user_id"])
    admin_headers = {"Authorization": f"Bearer {admin['access_token']}"}

    # A listing needs at least one photo to submit (see
    # properties/service.py's submit_for_review); attach one directly
    # through the media repository rather than a real upload, since
    # this fixture's job is a published listing, not the upload path.
    from app.core.db import AsyncSessionLocal as _Session
    from app.modules.media.models import ListingMedia

    async with _Session() as db:
        db.add(
            ListingMedia(
                listing_id=uuid.UUID(listing["id"]),
                owner_user_id=None,
                url="/media/files/test-cover.jpg",
                thumbnail_url="/media/files/test-cover-thumb.jpg",
                sort_order=0,
                is_primary=True,
            )
        )
        await db.commit()

    submit = await client.post(f"/listings/{listing['id']}/submit", headers=headers)
    assert submit.status_code == 200, submit.text

    decide = await client.post(f"/admin/listings/{listing['id']}/decision", headers=admin_headers, json={"approve": True})
    assert decide.status_code == 200, decide.text

    return {"owner": owner, "admin": admin, "listing": decide.json()}
