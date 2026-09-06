# OWNIT: running the app and API locally

This repo has two apps that run together: `apps/web` (Next.js frontend) and `apps/api` (FastAPI backend, PostgreSQL). This document is the short version of how to get both up on one machine. See `roadmap-reconciliation.md` for where this fits in the overall plan (this is Stage 7: real accounts and a backend).

## Prerequisites

- Python 3.12
- Node 18 or newer
- PostgreSQL 16 with the PostGIS, pg_trgm, and uuid-ossp extensions available (the migration creates them; the server just needs the packages installed)

## 1. Database

Create a role and database for local development, matching `apps/api/.env.example`:

```
sudo -u postgres psql -c "CREATE ROLE ileapp WITH LOGIN PASSWORD 'ileapp_dev_local';"
sudo -u postgres psql -c "CREATE DATABASE ile_dev OWNER ileapp;"
```

If PostGIS is not already installed on the Postgres server, install the matching version's package (for example `postgresql-16-postgis-3` on Debian or Ubuntu) before running the migration below. The migration creates the extensions themselves; it just needs the packages present on the server first.

## 2. API (apps/api)

```
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# .env works as is for local development. Change JWT_SECRET_KEY before
# anything but a throwaway local database ever touches this config.

alembic upgrade head
python -m app.seed

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Confirm it is up with `curl http://127.0.0.1:8000/health`, which should return `{"status": "ok"}`.

Running `alembic check` after `alembic upgrade head` should report no drift between the models and the applied migration. If you change any file under `app/modules/*/models.py`, generate a new migration with `alembic revision --autogenerate -m "..."`, read the generated file before applying it (autogenerate is a starting point, not a guarantee), and then `alembic upgrade head` again.

`python -m app.seed` is idempotent: safe to run again after a fresh migration, or after wiping the database, without creating duplicate rows.

## 3. Web (apps/web)

```
cd apps/web
npm install

# .env.local already points at the local API:
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Visit `http://localhost:3000`. Registering an account, signing in, reloading the page, and signing out should all work end to end against the local API, backed by real Postgres rows rather than any simulated or in-memory state.

## 4. What's real right now, and what isn't yet

Accounts are real: registration, login, session restore on reload, and sign out all go through `apps/api`'s auth module (argon2id password hashing, JWT access tokens, rotating refresh tokens in an httpOnly cookie). `/dashboard`, `/messages`, and `/notifications` correctly show a signed in state once you have an account, but the actual dashboard, messaging, and notification features behind that gate are not built yet. That is intentional, not a bug: those pages are honest about being real Stage 7 (accounts) sitting in front of not yet built Stage 8 (listings, messaging, inspections) features, rather than faking either one.

Everything under `apps/api/app/modules/{properties,media,verification,messaging,inspections,reports,payments,notifications,admin}` has real ORM models and a real migration, but no router yet. That is Stage 8 and Stage 10 work, built on top of the accounts and backend this document covers.

## Troubleshooting

A 401 from `/auth/refresh` immediately after loading the app with no prior sign in is expected: the frontend always attempts a silent session restore on mount, and there is nothing to restore yet.

A `429` from `/auth/login` means the per-account or per-IP rate limiter tripped (5 attempts per 5 minutes per account, 20 per IP): wait for the window to pass, or restart the API process, since the limiter's state is in memory and does not survive a restart. This is a deliberate placeholder for the Redis backed limiter the architecture doc specifies for real infrastructure; see the comment in `app/common/rate_limit.py`.

If the browser console shows a CORS error on a request that used to work, check the API's own log first: an unhandled exception on the backend also shows up in the browser as a CORS failure, because the response never passes back through the CORS middleware. The real error is in the API process's log, not in anything the browser can tell you.
