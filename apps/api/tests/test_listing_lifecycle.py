"""
The critical listing lifecycle: draft, edit, submit, admin review,
publish, reject, resubmit, delete. Section 20 of the brief this
backend was built against.
"""

import uuid

from tests.conftest import create_published_property, promote_to_admin, register_user


PROPERTY_PAYLOAD = {
    "transaction_type": "rent",
    "rent_period": "year",
    "property_type": "apartment",
    "bedrooms": 2,
    "bathrooms": 2,
    "size_sqm": 85,
    "furnishing_status": "furnished",
    "city_slug": "lagos",
    "street_address": "1 Test Close",
    "amenities": ["parking"],
    "price_naira": 2_500_000,
    "description": "A real end to end test listing created by the automated test suite.",
    "media_ids": [],
}

VEHICLE_PAYLOAD = {
    "make": "Toyota",
    "model": "Camry",
    "year": 2019,
    "mileage_km": 45000,
    "transmission": "automatic",
    "fuel_type": "petrol",
    "condition": "foreign used",
    "body_type": "sedan",
    "city_slug": "lagos",
    "price_naira": 8_500_000,
    "description": "A real end to end test vehicle listing created by the automated test suite.",
    "features": ["air conditioning"],
    "media_ids": [],
}


async def test_seller_creates_property_draft(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    response = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    assert response.status_code == 200, response.text
    listing = response.json()
    assert listing["availability_status"] == "draft"
    assert listing["verification_state"] == "unverified"
    assert listing["category"] == "property"
    assert listing["owner_user_id"] == landlord["user_id"]


async def test_seller_creates_vehicle_draft(client):
    dealer = await register_user(client, role="car_dealer")
    headers = {"Authorization": f"Bearer {dealer['access_token']}"}
    response = await client.post("/listings/vehicle", headers=headers, json=VEHICLE_PAYLOAD)
    assert response.status_code == 200, response.text
    listing = response.json()
    assert listing["category"] == "vehicle"
    assert listing["make"] == "Toyota"
    assert listing["features"] == ["air conditioning"]


async def test_only_landlord_or_agent_can_list_a_property(client):
    buyer = await register_user(client, role="buyer")
    headers = {"Authorization": f"Bearer {buyer['access_token']}"}
    response = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    assert response.status_code == 409
    assert "landlord or agent" in response.json()["detail"]


async def test_only_launch_cities_are_accepted(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    payload = {**PROPERTY_PAYLOAD, "city_slug": "ibadan"}
    response = await client.post("/listings/property", headers=headers, json=payload)
    assert response.status_code == 409
    assert "Lagos and Abeokuta" in response.json()["detail"]


async def test_seller_edits_draft(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    create = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    updated_payload = {**PROPERTY_PAYLOAD, "price_naira": 3_000_000, "bedrooms": 3}
    update = await client.patch(f"/listings/{listing_id}/property", headers=headers, json=updated_payload)
    assert update.status_code == 200, update.text
    body = update.json()
    assert body["price_in_kobo"] == 3_000_000 * 100
    assert body["bedrooms"] == 3


async def test_cannot_submit_without_a_photo(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    create = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    submit = await client.post(f"/listings/{listing_id}/submit", headers=headers)
    assert submit.status_code == 409
    assert "photo" in submit.json()["detail"].lower()


async def test_seller_deletes_draft(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    create = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    delete = await client.delete(f"/listings/{listing_id}", headers=headers)
    assert delete.status_code == 204

    mine = await client.get("/listings/mine", headers=headers)
    assert all(item["id"] != listing_id for item in mine.json())


async def test_full_review_pipeline_publishes_a_listing(client):
    result = await create_published_property(client)
    listing = result["listing"]
    assert listing["availability_status"] == "published"
    assert listing["verification_state"] == "verified"

    # Now publicly discoverable without any token.
    public = await client.get("/listings", params={"category": "property", "city": "lagos"})
    assert public.status_code == 200
    assert any(item["id"] == listing["id"] for item in public.json())

    detail = await client.get(f"/listings/{listing['slug']}")
    assert detail.status_code == 200
    assert detail.json()["availability_status"] == "published"


async def test_admin_queue_shows_pending_listing(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    create = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    from app.core.db import AsyncSessionLocal
    from app.modules.media.models import ListingMedia

    async with AsyncSessionLocal() as db:
        db.add(ListingMedia(listing_id=uuid.UUID(listing_id), owner_user_id=None, url="/media/files/x.jpg", sort_order=0, is_primary=True))
        await db.commit()

    submit = await client.post(f"/listings/{listing_id}/submit", headers=headers)
    assert submit.status_code == 200
    assert submit.json()["verification_state"] == "pending"

    admin = await register_user(client, role="buyer")
    await promote_to_admin(admin["user_id"])
    admin_headers = {"Authorization": f"Bearer {admin['access_token']}"}

    queue = await client.get("/admin/listings/queue", headers=admin_headers)
    assert queue.status_code == 200
    assert any(item["id"] == listing_id for item in queue.json())


async def test_admin_reject_requires_a_reason(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    create = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    from app.core.db import AsyncSessionLocal
    from app.modules.media.models import ListingMedia

    async with AsyncSessionLocal() as db:
        db.add(ListingMedia(listing_id=uuid.UUID(listing_id), owner_user_id=None, url="/media/files/x.jpg", sort_order=0, is_primary=True))
        await db.commit()
    await client.post(f"/listings/{listing_id}/submit", headers=headers)

    admin = await register_user(client, role="buyer")
    await promote_to_admin(admin["user_id"])
    admin_headers = {"Authorization": f"Bearer {admin['access_token']}"}

    reject_without_reason = await client.post(f"/admin/listings/{listing_id}/decision", headers=admin_headers, json={"approve": False})
    assert reject_without_reason.status_code == 409

    reject_with_reason = await client.post(
        f"/admin/listings/{listing_id}/decision", headers=admin_headers, json={"approve": False, "reason": "Add a clearer photo."}
    )
    assert reject_with_reason.status_code == 200
    body = reject_with_reason.json()
    assert body["verification_state"] == "rejected"
    assert body["verification_detail"] == "Add a clearer photo."

    # The seller sees the reason on their own listing.
    mine = await client.get("/listings/mine", headers=headers)
    mine_listing = next(item for item in mine.json() if item["id"] == listing_id)
    assert mine_listing["verification_detail"] == "Add a clearer photo."

    # A rejected listing must never be publicly discoverable.
    public = await client.get("/listings", params={"category": "property", "city": "lagos"})
    assert all(item["id"] != listing_id for item in public.json())


async def test_seller_resubmits_after_rejection(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    create = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    from app.core.db import AsyncSessionLocal
    from app.modules.media.models import ListingMedia

    async with AsyncSessionLocal() as db:
        db.add(ListingMedia(listing_id=uuid.UUID(listing_id), owner_user_id=None, url="/media/files/x.jpg", sort_order=0, is_primary=True))
        await db.commit()
    await client.post(f"/listings/{listing_id}/submit", headers=headers)

    admin = await register_user(client, role="buyer")
    await promote_to_admin(admin["user_id"])
    admin_headers = {"Authorization": f"Bearer {admin['access_token']}"}
    await client.post(f"/admin/listings/{listing_id}/decision", headers=admin_headers, json={"approve": False, "reason": "Fix this."})

    resubmit = await client.post(f"/listings/{listing_id}/submit", headers=headers)
    assert resubmit.status_code == 200
    assert resubmit.json()["verification_state"] == "pending"

    decide = await client.post(f"/admin/listings/{listing_id}/decision", headers=admin_headers, json={"approve": True})
    assert decide.status_code == 200
    assert decide.json()["availability_status"] == "published"


async def test_search_filters_by_category_and_transaction_type(client):
    published = await create_published_property(client)
    listing = published["listing"]

    rent_results = await client.get("/listings", params={"category": "property", "transaction_type": "rent"})
    assert any(item["id"] == listing["id"] for item in rent_results.json())

    sale_results = await client.get("/listings", params={"category": "property", "transaction_type": "sale"})
    assert all(item["id"] != listing["id"] for item in sale_results.json())

    vehicle_results = await client.get("/listings", params={"category": "vehicle"})
    assert all(item["id"] != listing["id"] for item in vehicle_results.json())
