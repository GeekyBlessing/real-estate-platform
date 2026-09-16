"""Real messaging tied to a real published listing (section 15)."""

from tests.conftest import create_published_property, register_user


async def test_buyer_can_message_listing_owner(client):
    result = await create_published_property(client)
    listing = result["listing"]

    buyer = await register_user(client, role="buyer")
    headers = {"Authorization": f"Bearer {buyer['access_token']}"}

    send = await client.post(f"/listings/{listing['id']}/messages", headers=headers, json={"body": "Is this still available?"})
    assert send.status_code == 200, send.text
    thread = send.json()
    assert thread["listing"]["slug"] == listing["slug"]
    assert len(thread["messages"]) == 1

    conversations = await client.get("/conversations", headers=headers)
    assert conversations.status_code == 200
    assert len(conversations.json()) == 1
    assert conversations.json()[0]["listing"]["slug"] == listing["slug"]


async def test_repeat_contact_reuses_the_same_conversation(client):
    result = await create_published_property(client)
    listing = result["listing"]
    buyer = await register_user(client, role="buyer")
    headers = {"Authorization": f"Bearer {buyer['access_token']}"}

    first = await client.post(f"/listings/{listing['id']}/messages", headers=headers, json={"body": "First message."})
    second = await client.post(f"/listings/{listing['id']}/messages", headers=headers, json={"body": "Second message."})
    assert first.json()["id"] == second.json()["id"]
    assert len(second.json()["messages"]) == 2


async def test_owner_can_reply_and_it_lands_in_the_same_thread(client):
    result = await create_published_property(client)
    listing = result["listing"]
    owner_headers = {"Authorization": f"Bearer {result['owner']['access_token']}"}
    buyer = await register_user(client, role="buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer['access_token']}"}

    sent = await client.post(f"/listings/{listing['id']}/messages", headers=buyer_headers, json={"body": "Hello?"})
    conversation_id = sent.json()["id"]

    reply = await client.post(f"/conversations/{conversation_id}/messages", headers=owner_headers, json={"body": "Yes, still up."})
    assert reply.status_code == 200
    assert len(reply.json()["messages"]) == 2


async def test_stranger_cannot_read_a_conversation_they_are_not_in(client):
    result = await create_published_property(client)
    listing = result["listing"]
    buyer = await register_user(client, role="buyer")
    buyer_headers = {"Authorization": f"Bearer {buyer['access_token']}"}
    sent = await client.post(f"/listings/{listing['id']}/messages", headers=buyer_headers, json={"body": "Hello?"})
    conversation_id = sent.json()["id"]

    stranger = await register_user(client, role="buyer")
    stranger_headers = {"Authorization": f"Bearer {stranger['access_token']}"}
    read_attempt = await client.get(f"/conversations/{conversation_id}", headers=stranger_headers)
    assert read_attempt.status_code == 404

    reply_attempt = await client.post(f"/conversations/{conversation_id}/messages", headers=stranger_headers, json={"body": "hi"})
    assert reply_attempt.status_code == 404


async def test_unauthenticated_cannot_message_a_listing(client):
    result = await create_published_property(client)
    listing = result["listing"]
    response = await client.post(f"/listings/{listing['id']}/messages", json={"body": "hi"})
    assert response.status_code == 401


async def test_cannot_message_an_unpublished_listing(client):
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
    response = await client.post(f"/listings/{listing_id}/messages", headers=buyer_headers, json={"body": "hi"})
    assert response.status_code == 404


async def test_owner_cannot_message_themselves_about_their_own_listing(client):
    result = await create_published_property(client)
    listing = result["listing"]
    owner_headers = {"Authorization": f"Bearer {result['owner']['access_token']}"}
    response = await client.post(f"/listings/{listing['id']}/messages", headers=owner_headers, json={"body": "hi"})
    assert response.status_code == 403


async def test_blank_message_is_rejected(client):
    result = await create_published_property(client)
    listing = result["listing"]
    buyer = await register_user(client, role="buyer")
    headers = {"Authorization": f"Bearer {buyer['access_token']}"}
    response = await client.post(f"/listings/{listing['id']}/messages", headers=headers, json={"body": "   "})
    assert response.status_code == 422
