import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import AppError
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.messaging import service
from app.modules.messaging.schemas import ConversationSummaryOut, ConversationThreadOut, SendMessageRequest
from app.modules.users.models import User

router = APIRouter(tags=["messaging"])


@router.post("/listings/{listing_id}/messages", response_model=ConversationThreadOut)
async def message_listing_owner(
    listing_id: uuid.UUID,
    payload: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ConversationThreadOut:
    try:
        return await service.send_listing_message(db, user, listing_id, payload.body)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/conversations", response_model=list[ConversationSummaryOut])
async def list_conversations(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> list[ConversationSummaryOut]:
    return await service.list_conversations(db, user)


@router.get("/conversations/{conversation_id}", response_model=ConversationThreadOut)
async def get_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ConversationThreadOut:
    try:
        return await service.get_thread(db, user, conversation_id)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/conversations/{conversation_id}/messages", response_model=ConversationThreadOut)
async def reply_to_conversation(
    conversation_id: uuid.UUID,
    payload: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ConversationThreadOut:
    try:
        return await service.reply(db, user, conversation_id, payload.body)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
