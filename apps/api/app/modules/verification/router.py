import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import AppError
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user, require_roles
from app.modules.users.models import User
from app.modules.verification import service
from app.modules.verification.schemas import SubmitDecisionRequest, VerificationStatusOut

router = APIRouter(prefix="/verification", tags=["verification"])


@router.get("/status", response_model=VerificationStatusOut)
async def read_status(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> VerificationStatusOut:
    return await service.get_status(db, user)


@router.post("/documents", response_model=VerificationStatusOut)
async def upload_document(
    file: UploadFile,
    document_type: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> VerificationStatusOut:
    try:
        return await service.upload_document(db, user, file, document_type)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.delete("/documents/{document_id}", response_model=VerificationStatusOut)
async def delete_document(
    document_id: uuid.UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
) -> VerificationStatusOut:
    try:
        return await service.delete_document(db, user, document_id)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/documents/{document_id}/file")
async def read_document_file(
    document_id: uuid.UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
) -> Response:
    """
    Streams the raw file directly rather than returning a URL: a
    verification document has no public URL to hand back (see
    app/modules/verification/storage.py's docstring), so every read
    goes through this same ownership check, every time, instead of a
    link that could be reshared.
    """
    try:
        raw, content_type = await service.get_document_file(db, user, document_id)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    return Response(content=raw, media_type=content_type)


@router.post("/submit", response_model=VerificationStatusOut)
async def submit_for_review(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> VerificationStatusOut:
    try:
        return await service.submit(db, user)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


# --- Admin review -----------------------------------------------------------


@router.get("/admin/queue", response_model=list[VerificationStatusOut])
async def admin_queue(db: AsyncSession = Depends(get_db), admin: User = Depends(require_roles("admin"))) -> list[VerificationStatusOut]:
    return await service.admin_queue(db)


@router.post("/admin/{request_id}/review", response_model=VerificationStatusOut)
async def admin_start_review(
    request_id: uuid.UUID, db: AsyncSession = Depends(get_db), admin: User = Depends(require_roles("admin"))
) -> VerificationStatusOut:
    try:
        return await service.admin_start_review(db, admin, request_id)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/admin/{request_id}/decision", response_model=VerificationStatusOut)
async def admin_decide(
    request_id: uuid.UUID,
    body: SubmitDecisionRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles("admin")),
) -> VerificationStatusOut:
    try:
        return await service.admin_decide(db, admin, request_id, body.decision, body.reason)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
