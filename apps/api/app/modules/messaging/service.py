import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import ForbiddenError, NotFoundError
from app.modules.messaging import repository
from app.modules.messaging.schemas import (
    ConversationListingSummaryOut,
    ConversationParticipantOut,
    ConversationSummaryOut,
    ConversationThreadOut,
    MessageOut,
)
from app.modules.properties import repository as listings_repository
from app.modules.users.models import User
from app.modules.users.repository import get_by_id as get_user_by_id


async def send_listing_message(db: AsyncSession, sender: User, listing_id: uuid.UUID, body: str) -> ConversationThreadOut:
    """
    The real action behind a listing detail page's "Message" button.
    Only a published listing can be messaged about (mirrors
    inspections.service.request_inspection's same rule): a draft or
    rejected listing has no seller-facing presence yet for a stranger
    to be contacting anyone about, and the row would otherwise leak
    who owns a listing that public discovery does not even show.
    """
    listing = await listings_repository.get_listing_by_id(db, listing_id)
    if listing is None or listing.availability_status != "published":
        raise NotFoundError("Listing not found.")
    if listing.owner_user_id == sender.id:
        raise ForbiddenError("You cannot message yourself about your own listing.")

    conversation = await repository.find_conversation_between(
        db, listing_id=listing.id, user_a=sender.id, user_b=listing.owner_user_id
    )
    if conversation is None:
        conversation = await repository.create_conversation(
            db, listing_id=listing.id, participant_user_ids=[sender.id, listing.owner_user_id]
        )
        await repository.create_enquiry(db, listing_id=listing.id, sender_user_id=sender.id, message=body, conversation_id=conversation.id)

    await repository.add_message(db, conversation_id=conversation.id, sender_user_id=sender.id, body=body)
    await db.commit()

    return await get_thread(db, sender, conversation.id)


async def reply(db: AsyncSession, sender: User, conversation_id: uuid.UUID, body: str) -> ConversationThreadOut:
    conversation = await repository.get_conversation(db, conversation_id)
    if conversation is None or not await repository.is_participant(db, conversation_id=conversation_id, user_id=sender.id):
        raise NotFoundError("Conversation not found.")
    await repository.add_message(db, conversation_id=conversation.id, sender_user_id=sender.id, body=body)
    await db.commit()
    return await get_thread(db, sender, conversation.id)


async def _listing_summary(db: AsyncSession, listing_id: uuid.UUID | None) -> ConversationListingSummaryOut | None:
    if listing_id is None:
        return None
    listing = await listings_repository.get_listing_by_id(db, listing_id)
    if listing is None:
        return None
    return ConversationListingSummaryOut(slug=listing.slug, title=listing.title, category=listing.category)


async def list_conversations(db: AsyncSession, viewer: User) -> list[ConversationSummaryOut]:
    conversations = await repository.list_conversations_for_user(db, viewer.id)
    rows: list[tuple[ConversationSummaryOut, datetime]] = []
    for conversation in conversations:
        participants = await repository.get_participants(db, conversation.id)
        other = next((p for p in participants if p.user_id != viewer.id), None)
        other_out = None
        if other is not None:
            other_user = await get_user_by_id(db, other.user_id)
            if other_user is not None:
                other_out = ConversationParticipantOut(user_id=other_user.id, name=other_user.full_name)
        last_message = await repository.get_last_message(db, conversation.id)
        unread = await repository.unread_count(db, conversation_id=conversation.id, user_id=viewer.id)
        sort_key = last_message.created_at if last_message else conversation.updated_at
        rows.append(
            (
                ConversationSummaryOut(
                    id=conversation.id,
                    listing=await _listing_summary(db, conversation.listing_id),
                    other_participant=other_out,
                    last_message=last_message.body if last_message else None,
                    last_message_at=last_message.created_at if last_message else None,
                    unread_count=unread,
                ),
                sort_key,
            )
        )
    rows.sort(key=lambda pair: pair[1], reverse=True)
    return [item for item, _ in rows]


async def get_thread(db: AsyncSession, viewer: User, conversation_id: uuid.UUID) -> ConversationThreadOut:
    conversation = await repository.get_conversation(db, conversation_id)
    if conversation is None or not await repository.is_participant(db, conversation_id=conversation_id, user_id=viewer.id):
        raise NotFoundError("Conversation not found.")

    participants = await repository.get_participants(db, conversation_id)
    participant_out: list[ConversationParticipantOut] = []
    for participant in participants:
        user = await get_user_by_id(db, participant.user_id)
        if user is not None:
            participant_out.append(ConversationParticipantOut(user_id=user.id, name=user.full_name))

    messages = await repository.list_messages(db, conversation_id)
    await repository.mark_read(db, conversation_id=conversation_id, user_id=viewer.id)
    await db.commit()

    return ConversationThreadOut(
        id=conversation.id,
        listing=await _listing_summary(db, conversation.listing_id),
        participants=participant_out,
        messages=[
            MessageOut(id=m.id, conversation_id=m.conversation_id, sender_user_id=m.sender_user_id, body=m.body, created_at=m.created_at)
            for m in messages
        ],
    )
