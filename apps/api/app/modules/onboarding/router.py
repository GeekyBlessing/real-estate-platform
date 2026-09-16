from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import AppError
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.onboarding import service
from app.modules.onboarding.schemas import OnboardingProgressOut, OnboardingResultOut, SaveProgressRequest, SubmitOnboardingRequest
from app.modules.users.models import User

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/progress", response_model=OnboardingProgressOut)
async def read_progress(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> OnboardingProgressOut:
    """
    Always this user's own progress, never anyone else's: user comes
    from the bearer token via get_current_user, not from a request
    parameter, so there is no id to substitute in the first place.
    """
    return await service.get_progress(db, user)


@router.patch("/progress", response_model=OnboardingProgressOut)
async def save_progress(
    body: SaveProgressRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
) -> OnboardingProgressOut:
    """
    Autosave: called as a person moves between onboarding steps, so a
    closed tab or a dead connection loses at most the current step,
    never the whole flow. draft_data is not validated here beyond
    basic shape, on purpose: a person mid-flow should be able to save
    an incomplete answer and come back to it, the real validation
    happens once at /onboarding/submit.
    """
    try:
        return await service.save_progress(db, user, role=body.role, current_step=body.current_step, draft_data=body.draft_data)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/submit", response_model=OnboardingResultOut)
async def submit_onboarding(
    body: SubmitOnboardingRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
) -> OnboardingResultOut:
    """
    The one place a role is actually granted (see users/repository.py's
    add_role_to_user): the role in the request body is never trusted
    on its own, it only takes effect after this endpoint's own
    role-specific validation of draft_data passes.
    """
    try:
        return await service.submit(db, user, role=body.role, draft_data=body.draft_data)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
