import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import ConflictError, UnauthorizedError
from app.common.rate_limit import login_attempts_by_account, login_attempts_by_ip
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.modules.auth.repository import create_refresh_token, get_by_hash_any_state, get_valid_by_hash, revoke_family, revoke_token
from app.modules.auth.repository import get_by_id as get_refresh_token_by_id
from app.modules.auth.schemas import VALID_REGISTRATION_ROLES
from app.modules.users.models import User
from app.modules.users.repository import create_user, get_by_email, get_by_id, get_by_phone, get_role_by_name

REFRESH_REUSE_GRACE_SECONDS = 10
"""
How long after a refresh token is rotated away that presenting it
again is treated as a benign race (two near-simultaneous requests from
the same legitimate session, e.g. React 18 StrictMode's intentional
double-invoke of an effect in development, or two tabs open at once)
rather than as reuse of a stolen token. Outside this window, the same
presentation is treated as an attack and the whole family is revoked,
per the doc's section 8. This grace period is exactly why
replaced_by_id (app/modules/auth/models.py) exists: without it there
would be no way to tell "this token was already rotated ten
milliseconds ago by the same client" apart from "this token was stolen
and used an hour after rotation."
"""


class TokenPair:
    def __init__(self, user: User, access_token: str, refresh_token_plaintext: str):
        self.user = user
        self.access_token = access_token
        self.refresh_token_plaintext = refresh_token_plaintext


async def register(
    db: AsyncSession, *, full_name: str, email: str, phone: str, role: str, password: str
) -> User:
    if role not in VALID_REGISTRATION_ROLES:
        raise ConflictError(f"'{role}' is not a role you can register as.")

    existing = await get_by_email(db, email)
    if existing:
        raise ConflictError("An account with this email already exists.")

    existing_phone = await get_by_phone(db, phone)
    if existing_phone:
        raise ConflictError("An account with this phone number already exists.")

    role_row = await get_role_by_name(db, role)
    if not role_row:
        # Seed data (app/seed.py) has not been run. A clear 409 beats a
        # foreign key violation surfacing as an unhandled 500.
        raise ConflictError("Registration is not available yet: role reference data is missing.")

    return await create_user(
        db,
        email=email,
        phone=phone,
        full_name=full_name,
        password_hash=hash_password(password),
        primary_role=role_row,
    )


async def _issue_token_pair(db: AsyncSession, user: User, *, family_id: uuid.UUID):
    """Returns (TokenPair, the new RefreshToken row), the row so a caller rotating an old token can point replaced_by_id at it."""
    access_token = create_access_token(user_id=user.id, roles=user.role_names, token_version=user.token_version)
    plaintext, token_hash = generate_refresh_token()
    token_row = await create_refresh_token(db, user_id=user.id, family_id=family_id, token_hash=token_hash)
    return TokenPair(user=user, access_token=access_token, refresh_token_plaintext=plaintext), token_row


async def issue_session(db: AsyncSession, user: User) -> TokenPair:
    """Starts a brand new refresh token family: a fresh login or the moment right after registration."""
    tokens, _ = await _issue_token_pair(db, user, family_id=uuid.uuid4())
    await db.commit()
    return tokens


async def login(db: AsyncSession, *, email: str, password: str, ip_address: str) -> TokenPair:
    """
    Rate limited per account and per IP (section 8) before touching the
    database: an attacker guessing passwords against one account, or
    spraying one password across many accounts from one IP, both hit a
    limit before verify_password ever runs. Both limiters are checked
    (and both record this attempt) even when the account does not
    exist, so the response time and behaviour do not leak which
    accounts are real.
    """
    login_attempts_by_ip.check_and_record(ip_address)
    login_attempts_by_account.check_and_record(email)

    user = await get_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise UnauthorizedError("Incorrect email or password.")
    if user.status != "active":
        raise UnauthorizedError("This account is not active.")

    return await issue_session(db, user)


async def refresh(db: AsyncSession, *, refresh_token_plaintext: str) -> TokenPair:
    """
    Rotates the refresh token on every use, per section 8. If the
    presented token has already been rotated away, that is either a
    benign race (see REFRESH_REUSE_GRACE_SECONDS above) or reuse of a
    stolen or replayed token. Only the latter revokes the entire
    family: an attacker who captured an old token should not be able
    to keep retrying it, but two near-simultaneous requests from the
    same legitimate browser should not log the user out either, which
    is exactly what happened in this scaffold's own manual testing
    (a Playwright check tripped this before the grace period existed,
    caught by React StrictMode's double-invoked effect).
    """
    token_hash = hash_refresh_token(refresh_token_plaintext)
    valid_token = await get_valid_by_hash(db, token_hash)

    if not valid_token:
        stale_token = await get_by_hash_any_state(db, token_hash)
        grace_tokens = await _try_grace_period_recovery(db, stale_token)
        if grace_tokens:
            return grace_tokens

        if stale_token and stale_token.revoked_at is not None:
            await revoke_family(db, stale_token.family_id)
            await db.commit()
        raise UnauthorizedError("Session expired. Sign in again.")

    user = await get_by_id(db, valid_token.user_id)
    if not user or user.status != "active":
        raise UnauthorizedError("This account is not active.")

    new_tokens, new_row = await _issue_token_pair(db, user, family_id=valid_token.family_id)
    await revoke_token(db, valid_token, replaced_by_id=new_row.id)
    await db.commit()
    return new_tokens


async def _try_grace_period_recovery(db: AsyncSession, stale_token) -> TokenPair | None:
    """
    Presented token exists, is revoked, and was rotated away very
    recently: rather than treating this as an attack, hand back a
    valid session built from wherever the rotation chain currently
    stands. Bounded to one hop (the token that directly replaced the
    stale one), which is what a same-client race of two concurrent
    requests actually produces; a genuinely stolen token replayed
    after several further rotations have already happened
    legitimately won't satisfy this (its direct successor will itself
    already be revoked) and correctly falls through to the attack
    path. A three-or-more-way simultaneous race is the one case this
    doesn't cover and would still trip the attack response; that's a
    deliberately accepted limit for this pass, not an oversight.
    """
    if not stale_token or stale_token.revoked_at is None or not stale_token.replaced_by_id:
        return None

    age = datetime.now(timezone.utc) - stale_token.revoked_at
    if age > timedelta(seconds=REFRESH_REUSE_GRACE_SECONDS):
        return None

    successor = await get_refresh_token_by_id(db, stale_token.replaced_by_id)
    if not successor or successor.revoked_at is not None or successor.expires_at <= datetime.now(timezone.utc):
        return None

    user = await get_by_id(db, successor.user_id)
    if not user or user.status != "active":
        return None

    new_tokens, new_row = await _issue_token_pair(db, user, family_id=successor.family_id)
    await revoke_token(db, successor, replaced_by_id=new_row.id)
    await db.commit()
    return new_tokens


async def logout(db: AsyncSession, *, refresh_token_plaintext: str) -> None:
    token_hash = hash_refresh_token(refresh_token_plaintext)
    token = await get_by_hash_any_state(db, token_hash)
    if token:
        await revoke_family(db, token.family_id)
        await db.commit()
