import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.users.models import Role, TenantProfile, User, UserRole


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
    Creates the user, links the one role chosen at registration, and,
    for a tenant or buyer, a starter TenantProfile row (the only
    profile extension table that makes sense to create with nothing
    filled in yet; landlord and agent profiles wait for
    business-specific fields the registration form doesn't collect).
    A user can hold more than one role later (section 5); this just
    covers what registration itself needs.
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

    await db.commit()
    return await get_by_id(db, user.id)  # type: ignore[return-value]
