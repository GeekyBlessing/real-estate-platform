import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.messaging.models import Conversation, ConversationParticipant, Enquiry, Message


async def find_conversation_between(
    db: AsyncSession, *, listing_id: uuid.UUID, user_a: uuid.UUID, user_b: uuid.UUID
) -> Conversation | None:
    """
    A conversation is identified by (listing, the two participants),
    not by listing alone: the same buyer messaging two different
    sellers about two different listings must not collide, and the
    same buyer messaging the same seller a second time about the same
    listing should reuse the existing thread rather than fork a new
    one every time the "Message" button is pressed again.
    """
    participant_a = ConversationParticipant.__table__.alias("pa")
    participant_b = ConversationParticipant.__table__.alias("pb")
    result = await db.execute(
        select(Conversation)
        .join(participant_a, participant_a.c.conversation_id == Conversation.id)
        .join(participant_b, participant_b.c.conversation_id == Conversation.id)
        .where(
            Conversation.listing_id == listing_id,
            participant_a.c.user_id == user_a,
            participant_b.c.user_id == user_b,
        )
    )
    return result.scalars().first()


async def create_conversation(
    db: AsyncSession, *, listing_id: uuid.UUID | None, participant_user_ids: list[uuid.UUID]
) -> Conversation:
    conversation = Conversation(listing_id=listing_id)
    db.add(conversation)
    await db.flush()
    for user_id in participant_user_ids:
        db.add(ConversationParticipant(conversation_id=conversation.id, user_id=user_id))
    await db.flush()
    return conversation


async def add_message(db: AsyncSession, *, conversation_id: uuid.UUID, sender_user_id: uuid.UUID, body: str) -> Message:
    message = Message(conversation_id=conversation_id, sender_user_id=sender_user_id, body=body)
    db.add(message)
    await db.flush()
    return message


async def is_participant(db: AsyncSession, *, conversation_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    row = await db.scalar(
        select(ConversationParticipant.id).where(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id,
        )
    )
    return row is not None


async def mark_read(db: AsyncSession, *, conversation_id: uuid.UUID, user_id: uuid.UUID) -> None:
    participant = await db.scalar(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id,
        )
    )
    if participant is not None:
        participant.last_read_at = datetime.now(timezone.utc)


async def list_conversations_for_user(db: AsyncSession, user_id: uuid.UUID) -> list[Conversation]:
    my_participant = ConversationParticipant.__table__.alias("mine")
    result = await db.execute(
        select(Conversation)
        .join(my_participant, my_participant.c.conversation_id == Conversation.id)
        .where(my_participant.c.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    return list(result.scalars().unique().all())


async def get_conversation(db: AsyncSession, conversation_id: uuid.UUID) -> Conversation | None:
    return await db.get(Conversation, conversation_id)


async def get_participants(db: AsyncSession, conversation_id: uuid.UUID) -> list[ConversationParticipant]:
    result = await db.execute(select(ConversationParticipant).where(ConversationParticipant.conversation_id == conversation_id))
    return list(result.scalars().all())


async def get_last_message(db: AsyncSession, conversation_id: uuid.UUID) -> Message | None:
    return await db.scalar(
        select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.desc()).limit(1)
    )


async def unread_count(db: AsyncSession, *, conversation_id: uuid.UUID, user_id: uuid.UUID) -> int:
    participant = await db.scalar(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id,
        )
    )
    since = participant.last_read_at if participant else None
    query = select(func.count(Message.id)).where(
        Message.conversation_id == conversation_id, Message.sender_user_id != user_id
    )
    if since is not None:
        query = query.where(Message.created_at > since)
    return int(await db.scalar(query) or 0)


async def list_messages(db: AsyncSession, conversation_id: uuid.UUID, *, limit: int = 100) -> list[Message]:
    result = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).limit(limit)
    )
    return list(result.scalars().all())


async def create_enquiry(db: AsyncSession, *, listing_id: uuid.UUID, sender_user_id: uuid.UUID, message: str, conversation_id: uuid.UUID) -> Enquiry:
    enquiry = Enquiry(listing_id=listing_id, sender_user_id=sender_user_id, message=message, conversation_id=conversation_id)
    db.add(enquiry)
    await db.flush()
    return enquiry
