import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.users.models import (
    AgentProfile,
    CarDealerProfile,
    LandlordProfile,
    PrivateSellerProfile,
    Role,
    TenantProfile,
    User,
    UserRole,
)


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    stmt = select(User).where(User.email == email).options(selectinload(User.role_links).selectinload(UserRole.role))
    return await db.scalar(stmt)


async def get_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    stmt = select(User).where(User.id == user_id).options(selectinload(User.role_links).selectinload(UserRole.role))
    return await db.scalar(stmt)


async def get_by_phone(db: AsyncSession, phone: str) -> User | None:
    return await db.scalar(select(User).where(User.phone == phone))


async def get_role_by_name(db: AsyncSession, name: str) -> Role | None:
    return await db.scalar(select(Role).where(Role.name == name))


async def create_user(
    db: AsyncSession,
    *,
    email: str,
    phone: str | None,
    full_name: str,
    password_hash: str,
    primary_role: Role,
) -> User:
    """
    Creates the user, links the one role chosen at registration, and
    adds an empty starter profile extension row for that role. The
    row exists from account creation so onboarding (app/modules/
    onboarding) always has a row to update rather than needing its own
    get-or-create logic; nothing on it is filled in until the person
    actually goes through onboarding, and creating an account never
    forces that. A user can hold more than one role later (section 5);
    this just covers what registration itself needs.
    """
    user = User(
        email=email,
        phone=phone,
        full_name=full_name,
        password_hash=password_hash,
        primary_role_id=primary_role.id,
    )
    db.add(user)
    await db.flush()

    db.add(UserRole(user_id=user.id, role_id=primary_role.id))

    if primary_role.name in ("tenant", "buyer"):
        db.add(TenantProfile(user_id=user.id))
    elif primary_role.name == "landlord":
        db.add(LandlordProfile(user_id=user.id))
    elif primary_role.name == "agent":
        db.add(AgentProfile(user_id=user.id))
    elif primary_role.name == "car_dealer":
        db.add(CarDealerProfile(user_id=user.id))
    elif primary_role.name == "private_seller":
        db.add(PrivateSellerProfile(user_id=user.id))

    await db.commit()
    return await get_by_id(db, user.id)  # type: ignore[return-value]


async def add_role_to_user(db: AsyncSession, *, user: User, role_name: str) -> bool:
    """
    Grants an additional role, idempotently: used when onboarding into
    a role a user did not originally register as (for example a buyer
    completing the "become a landlord" flow). Always called from the
    onboarding service after that flow's own submit validation passes,
    never from anything the frontend can trigger directly with just a
    role name, which is what keeps this the one, server-side-enforced
    place a user's role set actually changes. Returns True if the role
    was newly added, False if the user already held it.
    """
    if role_name in user.role_names:
        return False
    role = await get_role_by_name(db, role_name)
    if role is None:
        raise ValueError(f"Unknown role: {role_name}")
    db.add(UserRole(user_id=user.id, role_id=role.id))
    await db.flush()
    return True
