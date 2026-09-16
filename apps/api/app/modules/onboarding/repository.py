import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import (
    AgentProfile,
    CarDealerProfile,
    LandlordProfile,
    OnboardingProgress,
    PrivateSellerProfile,
    TenantProfile,
)

PROFILE_MODEL_BY_ROLE = {
    "buyer": TenantProfile,
    "tenant": TenantProfile,
    "landlord": LandlordProfile,
    "agent": AgentProfile,
    "car_dealer": CarDealerProfile,
    "private_seller": PrivateSellerProfile,
}


async def get_progress(db: AsyncSession, user_id: uuid.UUID) -> OnboardingProgress | None:
    return await db.scalar(select(OnboardingProgress).where(OnboardingProgress.user_id == user_id))


async def upsert_progress(
    db: AsyncSession, *, user_id: uuid.UUID, role: str, current_step: str | None, draft_data: dict
) -> OnboardingProgress:
    progress = await get_progress(db, user_id)
    if progress is None:
        progress = OnboardingProgress(user_id=user_id, role=role, status="in_progress", current_step=current_step, draft_data=draft_data)
        db.add(progress)
    else:
        progress.role = role
        progress.status = "in_progress" if progress.status != "completed" else progress.status
        progress.current_step = current_step
        progress.draft_data = draft_data
    await db.flush()
    return progress


async def mark_completed(db: AsyncSession, *, user_id: uuid.UUID, role: str) -> None:
    """
    Always leaves a completed row behind for (user_id, role), whether
    or not a draft row already existed. A submit that never went
    through an autosaved draft first (a direct API call, or a UI flow
    whose earlier autosave silently failed, see
    ProfessionalOnboardingFlow.tsx's persistDraft) must still mark
    onboarding complete: this was previously conditional on a
    matching row already existing, which meant a successful submit
    could leave WorkspaceNextAction on the frontend permanently
    reporting "continue onboarding" even after real verification
    succeeded, since nothing had ever flipped this row to completed.
    """
    progress = await get_progress(db, user_id)
    if progress is None:
        db.add(OnboardingProgress(user_id=user_id, role=role, status="completed", current_step=None, draft_data={}))
    else:
        progress.role = role
        progress.status = "completed"


async def get_profile(db: AsyncSession, *, role: str, user_id: uuid.UUID):
    model = PROFILE_MODEL_BY_ROLE[role]
    return await db.scalar(select(model).where(model.user_id == user_id))


async def create_profile_if_missing(db: AsyncSession, *, role: str, user_id: uuid.UUID):
    model = PROFILE_MODEL_BY_ROLE[role]
    existing = await get_profile(db, role=role, user_id=user_id)
    if existing is not None:
        return existing
    profile = model(user_id=user_id)
    db.add(profile)
    await db.flush()
    return profile
