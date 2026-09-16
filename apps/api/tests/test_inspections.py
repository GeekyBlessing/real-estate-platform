"""Real inspection requests tied to a real published listing (section 14)."""

from tests.conftest import create_published_property, register_user


async def test_buyer_requests_inspection(client):
    result = await create_published_property(client)
    listing = result["listing"]
    buyer = await register_user(client, role="buyer")
    headers = {"Authorization": f"Bearer {buyer['access_token']}"}

    response = await client.post(
        f"/listings/{listing['id']}/inspections",
        headers=headers,
        json={"preferred_at": "2026-10-01T10:00:00Z", "mode": "in person", "notes": "Weekday mornings work best."},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "requested"
    assert body["listing"]["slug"] == listing["slug"]

    mine = await client.get("/inspections/mine", headers=headers)
    assert len(mine.json()) == 1


async def test_owner_sees_and_confirms_the_request(client):
    result = await create_published_property(client)
    listing = result["listing"]
    owner_headers = {"Authorization": f"Bearer {result['owner']['access_token']}"}
    buyer = await register_user(client, role="buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer['access_token']}"}

    request = await client.post(
        f"/listings/{listing['id']}/inspections", headers=buyer_headers, json={"preferred_at": "2026-10-01T10:00:00Z"}
    )
    inspection_id = request.json()["id"]

    owner_view = await client.get(f"/listings/{listing['id']}/inspections", headers=owner_headers)
    assert owner_view.status_code == 200
    assert len(owner_view.json()) == 1

    confirm = await client.post(f"/inspections/{inspection_id}/decision", headers=owner_headers, json={"action": "confirm"})
    assert confirm.status_code == 200
    assert confirm.json()["status"] == "confirmed"


async def test_owner_can_reject_with_no_reason_required(client):
    """Unlike a listing rejection, an inspection decline has no required-reason rule in the brief; this documents that it works without one."""
    result = await create_published_property(client)
    listing = result["listing"]
    owner_headers = {"Authorization": f"Bearer {result['owner']['access_token']}"}
    buyer = await register_user(client, role="buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer['access_token']}"}

    request = await client.post(
        f"/listings/{listing['id']}/inspections", headers=buyer_headers, json={"preferred_at": "2026-10-01T10:00:00Z"}
    )
    inspection_id = request.json()["id"]

    reject = await client.post(f"/inspections/{inspection_id}/decision", headers=owner_headers, json={"action": "reject"})
    assert reject.status_code == 200
    assert reject.json()["status"] == "rejected"


async def test_stranger_cannot_see_or_decide_someone_elses_inspection_queue(client):
    result = await create_published_property(client)
    listing = result["listing"]
    buyer = await register_user(client, role="buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer['access_token']}"}
    request = await client.post(
        f"/listings/{listing['id']}/inspections", headers=buyer_headers, json={"preferred_at": "2026-10-01T10:00:00Z"}
    )
    inspection_id = request.json()["id"]

    stranger = await register_user(client, role="buyer")
    stranger_headers = {"Authorization": f"Bearer {stranger['access_token']}"}

    queue_attempt = await client.get(f"/listings/{listing['id']}/inspections", headers=stranger_headers)
    assert queue_attempt.status_code == 404

    decide_attempt = await client.post(f"/inspections/{inspection_id}/decision", headers=stranger_headers, json={"action": "confirm"})
    assert decide_attempt.status_code == 404


async def test_owner_cannot_decide_the_same_request_twice(client):
    result = await create_published_property(client)
    listing = result["listing"]
    owner_headers = {"Authorization": f"Bearer {result['owner']['access_token']}"}
    buyer = await register_user(client, role="buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer['access_token']}"}
    request = await client.post(
        f"/listings/{listing['id']}/inspections", headers=buyer_headers, json={"preferred_at": "2026-10-01T10:00:00Z"}
    )
    inspection_id = request.json()["id"]

    await client.post(f"/inspections/{inspection_id}/decision", headers=owner_headers, json={"action": "confirm"})
    second_attempt = await client.post(f"/inspections/{inspection_id}/decision", headers=owner_headers, json={"action": "confirm"})
    assert second_attempt.status_code == 409


async def test_cannot_request_inspection_of_own_listing(client):
    result = await create_published_property(client)
    listing = result["listing"]
    owner_headers = {"Authorization": f"Bearer {result['owner']['access_token']}"}
    response = await client.post(
        f"/listings/{listing['id']}/inspections", headers=owner_headers, json={"preferred_at": "2026-10-01T10:00:00Z"}
    )
    assert response.status_code == 403


async def test_cannot_request_inspection_of_unpublished_listing(client):
    landlord = await register_user(client, role="landlord")
    headers = {"Authorization": f"Bearer {landlord['access_token']}"}
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
            "city_slug": "lagos",
            "street_address": "1 Test Close",
            "amenities": [],
            "price_naira": 2_500_000,
            "description": "A real end to end test listing created by the automated test suite.",
            "media_ids": [],
        },
    )
    listing_id = create.json()["id"]

    buyer = await register_user(client, role="buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer['access_token']}"}
    response = await client.post(f"/listings/{listing_id}/inspections", headers=buyer_headers, json={"preferred_at": "2026-10-01T10:00:00Z"})
    assert response.status_code == 404
