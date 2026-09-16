"""
Server side ownership and role enforcement, never trusted from the
frontend. Section 10 and section 20's authorization checklist.
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
    "amenities": [],
    "price_naira": 2_500_000,
    "description": "A real end to end test listing created by the automated test suite.",
    "media_ids": [],
}


async def test_seller_a_cannot_edit_seller_b_listing(client):
    seller_a = await register_user(client, role="landlord")
    seller_b = await register_user(client, role="landlord")
    headers_a = {"Authorization": f"Bearer {seller_a['access_token']}"}
    headers_b = {"Authorization": f"Bearer {seller_b['access_token']}"}

    create = await client.post("/listings/property", headers=headers_a, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    edit_attempt = await client.patch(
        f"/listings/{listing_id}/property", headers=headers_b, json={**PROPERTY_PAYLOAD, "price_naira": 1}
    )
    assert edit_attempt.status_code == 404  # Not found, never a 403 that would confirm the id exists.


async def test_seller_a_cannot_delete_seller_b_listing(client):
    seller_a = await register_user(client, role="landlord")
    seller_b = await register_user(client, role="landlord")
    headers_a = {"Authorization": f"Bearer {seller_a['access_token']}"}
    headers_b = {"Authorization": f"Bearer {seller_b['access_token']}"}

    create = await client.post("/listings/property", headers=headers_a, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    delete_attempt = await client.delete(f"/listings/{listing_id}", headers=headers_b)
    assert delete_attempt.status_code == 404

    still_there = await client.get("/listings/mine", headers=headers_a)
    assert any(item["id"] == listing_id for item in still_there.json())


async def test_seller_a_cannot_submit_seller_b_listing(client):
    seller_a = await register_user(client, role="landlord")
    seller_b = await register_user(client, role="landlord")
    headers_a = {"Authorization": f"Bearer {seller_a['access_token']}"}
    headers_b = {"Authorization": f"Bearer {seller_b['access_token']}"}

    create = await client.post("/listings/property", headers=headers_a, json=PROPERTY_PAYLOAD)
    listing_id = create.json()["id"]

    submit_attempt = await client.post(f"/listings/{listing_id}/submit", headers=headers_b)
    assert submit_attempt.status_code == 404


async def test_non_admin_cannot_reach_the_decision_endpoint_at_all(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    response = await client.post(f"/admin/listings/{uuid.uuid4()}/decision", headers=headers, json={"approve": True})
    assert response.status_code == 403


async def test_seller_who_is_also_admin_cannot_approve_their_own_listing(client):
    """
    Roles are additive (see users/repository.py's add_role_to_user), so
    a real seller-admin overlap is possible; require_roles("admin")
    alone would let this through since it only checks the role, not
    who owns the specific listing being decided. properties/service.py's
    admin_decide has to catch this with a real ownership check.
    """
    landlord = await register_user(client, role="landlord")
    await promote_to_admin(landlord["user_id"])
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

    decide = await client.post(f"/admin/listings/{listing_id}/decision", headers=headers, json={"approve": True})
    assert decide.status_code == 409


async def test_normal_user_cannot_access_admin_queue(client):
    buyer = await register_user(client, role="buyer")
    headers = {"Authorization": f"Bearer {buyer['access_token']}"}
    response = await client.get("/admin/listings/queue", headers=headers)
    assert response.status_code == 403


async def test_unpublished_listing_not_retrievable_publicly(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    create = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    listing = create.json()

    anonymous = await client.get(f"/listings/{listing['slug']}")
    assert anonymous.status_code == 404

    stranger = await register_user(client, role="buyer")
    stranger_headers = {"Authorization": f"Bearer {stranger['access_token']}"}
    as_stranger = await client.get(f"/listings/{listing['slug']}", headers=stranger_headers)
    assert as_stranger.status_code == 404

    # The owner can still see their own unpublished listing.
    as_owner = await client.get(f"/listings/{listing['slug']}", headers=headers)
    assert as_owner.status_code == 200


async def test_admin_can_see_unpublished_listing_but_not_edit_it(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
    create = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    listing = create.json()

    admin = await register_user(client, role="buyer")
    await promote_to_admin(admin["user_id"])
    admin_headers = {"Authorization": f"Bearer {admin['access_token']}"}

    as_admin = await client.get(f"/listings/{listing['slug']}", headers=admin_headers)
    assert as_admin.status_code == 200

    edit_attempt = await client.patch(f"/listings/{listing['id']}/property", headers=admin_headers, json=PROPERTY_PAYLOAD)
    assert edit_attempt.status_code == 404


async def test_unauthenticated_request_rejected_on_protected_routes(client):
    create = await client.post("/listings/property", json=PROPERTY_PAYLOAD)
    assert create.status_code == 401

    mine = await client.get("/listings/mine")
    assert mine.status_code == 401


async def test_role_gate_is_enforced_per_category(client):
    dealer = await register_user(client, role="car_dealer")
    headers = {"Authorization": f"Bearer {dealer['access_token']}"}
    response = await client.post("/listings/property", headers=headers, json=PROPERTY_PAYLOAD)
    assert response.status_code == 409
    assert "landlord or agent" in response.json()["detail"]


async def test_cannot_edit_a_listing_pending_review(client):
    """A listing an admin is actively reviewing cannot be pulled out from under that review by an edit."""
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

    edit_attempt = await client.patch(f"/listings/{listing_id}/property", headers=headers, json=PROPERTY_PAYLOAD)
    assert edit_attempt.status_code == 409
