# Real Estate SaaS Platform, Nigeria: Phase 1 Architecture

Status: Discovery and architecture phase (Phase 0 / Phase 1). No application code has been written. This document is the basis for approval before implementation begins.

---

## 0. Scope and Approach

This document defines the technical foundation for a property marketplace targeting Nigeria first, built so later phases (property management SaaS, agent SaaS, shortlets, payments, AI intelligence) can be added as new modules rather than rewrites.

Guiding decision for Phase 1: **modular monolith over microservices**. At current scale (one country, five roles, a marketplace core), microservices would add deployment complexity, network failure modes, and operational overhead without a corresponding benefit. A modular monolith with strict internal module boundaries gets the same evolution path at a fraction of the cost, and any module that later needs independent scaling (search, verification, payments) can be extracted because the boundaries already exist in code.

---

## 1. Final Phase 1 Architecture

Two deployable applications, one shared database, one background worker:

- **Web application** (Next.js): public marketplace, SEO-facing property pages, authenticated dashboards for tenant, buyer, landlord, agent, admin.
- **API application** (FastAPI): the modular monolith. All business logic, data access, and authorization live here. Organized into internal modules with explicit interfaces: auth, users, properties, media, search, verification, messaging, inspections, reports, payments, notifications, admin, audit.
- **Worker process** (same codebase as the API, separate entrypoint): consumes background jobs from a Redis-backed queue (email/SMS sending, image processing, notification fan-out, webhook processing, verification provider polling).
- **PostgreSQL**: single source of truth, with PostGIS for geospatial queries.
- **Redis**: cache, rate limiting, session/refresh-token revocation lists, job queue, pub/sub for realtime messaging.
- **S3 + CloudFront**: media and document storage, public asset delivery.

Communication between web and API is a versioned REST/JSON contract (OpenAPI-generated), not server-to-server framework coupling. This keeps the option open to swap the frontend rendering approach later without touching backend contracts.

Why not microservices in Phase 1: five roles and one core domain do not justify distributed transactions, service meshes, or independent deployment pipelines. Why not a pure serverless (Lambda-per-endpoint) approach: FastAPI on ECS gives predictable latency for a marketplace with steady traffic patterns and avoids cold-start behavior on image-heavy property pages, at a small cost in idle compute spend, which is an acceptable tradeoff at this stage.

---

## 2. Recommended Technology Stack

**Frontend**
- Next.js 14+ (App Router), React 18, TypeScript (strict mode)
- TailwindCSS for the utility layer, with a custom design token system (not a default component kit skin) so the cream/brown identity does not read as a template
- TanStack Query for server state and caching
- React Hook Form + Zod for form state and validation, sharing schema definitions with the backend contract where practical
- Mapbox GL JS for map discovery (see Section 11 for the Mapbox vs Google Maps decision)

**Backend**
- Python 3.12, FastAPI, Pydantic v2
- SQLAlchemy 2.0 (async) + Alembic for migrations
- asyncpg as the PostgreSQL driver
- structlog for structured logging
- arq for background jobs (Redis-backed, asyncio-native). Recommended over Celery: Celery's broker/worker/beat model is heavier than this stage needs, and arq integrates directly with the async stack without a second concurrency model to reason about. Revisit if job complexity grows to need Celery's routing/retry ecosystem.
- argon2-cffi for password hashing (argon2id, the current OWASP-recommended default over bcrypt)

**Database and Cache**
- PostgreSQL 15+ with the PostGIS and pg_trgm extensions
- Redis 7+

**Search**
- Phase 1 search runs on PostgreSQL itself: GIN/trigram indexes for text search, PostGIS for radius and bounding-box queries, standard B-tree indexes for structured filters (price, bedrooms, type). A dedicated search engine (OpenSearch/Elasticsearch/Meilisearch) is deferred until listing volume or relevance requirements (typo tolerance, weighted ranking, synonyms) outgrow what Postgres indexes handle well, typically well past 100k active listings. Introducing a second data store now would be premature for the traffic Phase 1 will actually see.

**Storage**
- AWS S3 (two buckets: public media, private documents), CloudFront in front of the public bucket

**Payments** (Phase 1 scope: featured/boosted listings and platform service fees only)
- Paystack as primary provider (strongest Nigerian bank/card coverage and developer tooling)
- Flutterwave as a secondary provider behind the same abstraction, for redundancy and future multi-country reach
- Both integrated through a `PaymentProvider` interface (Section 13), never called directly from business logic

**Identity Verification / KYC**
- Provider-abstracted (Section 9). Candidates for Nigeria: Smile Identity or Dojah for automated NIN/BVN/document checks, with manual admin review as the Phase 1 fallback and control point regardless of provider. This is flagged as a business decision requiring cost and compliance sign-off before automated ID lookups go live (Section 9 and Section 20 open items).

**Communications**
- Email: AWS SES
- SMS/OTP: Termii or Africa's Talking, behind a `NotificationChannel` abstraction (Section 14)

**Infrastructure**
- AWS: ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3, CloudFront, Route 53, ACM, Secrets Manager, CloudWatch, WAF
- Terraform for infrastructure as code
- GitHub Actions for CI/CD

Every third-party dependency above is chosen for a specific reason tied to this market or this stage, not because it is popular. Where two viable options exist (Paystack/Flutterwave, Smile Identity/Dojah, Termii/Africa's Talking), the abstraction layer means the second option is a configuration change, not a rewrite.

---

## 3. High Level System Architecture

```
                        ┌────────────────────┐
                        │   Route 53 (DNS)    │
                        └──────────┬───────────┘
                                   │
                        ┌──────────▼───────────┐
                        │   CloudFront + WAF    │
                        │ (static assets, CDN,  │
                        │  edge rate limiting)  │
                        └──────────┬───────────┘
                                   │
                      ┌────────────▼────────────┐
                      │   Application Load       │
                      │   Balancer (TLS term.)   │
                      └───────┬──────────┬───────┘
                              │          │
                 ┌────────────▼──┐   ┌──▼─────────────┐
                 │  ECS Fargate   │   │  ECS Fargate    │
                 │  Next.js (web) │   │  FastAPI (api)  │
                 └────────────────┘   └───┬─────────┬───┘
                                           │         │
                                ┌──────────▼──┐   ┌──▼───────────┐
                                │  RDS         │   │  ElastiCache  │
                                │  PostgreSQL  │   │  Redis        │
                                │  + PostGIS   │   └──┬────────────┘
                                └──────────────┘      │
                                                       │
                                           ┌───────────▼───────────┐
                                           │  ECS Fargate           │
                                           │  Worker (arq)          │
                                           └───────────┬────────────┘
                                                        │
                                          ┌─────────────▼─────────────┐
                                          │  S3 (public media,         │
                                          │  private documents)        │
                                          │  SES, SMS provider,         │
                                          │  Paystack/Flutterwave,      │
                                          │  KYC provider                │
                                          └─────────────────────────────┘
```

The web tier renders public property pages server-side for SEO, and calls the API tier for all data. Authenticated dashboard routes also render through Next.js but treat the API as the sole source of truth and authority; the frontend never makes an authorization decision on its own.

---

## 4. Database Architecture

Principles applied throughout the schema:

- UUID primary keys (avoids sequential ID enumeration, safe to generate client-side or across future services)
- `created_at` / `updated_at` on every table
- Soft status transitions instead of hard deletes on records with legal or trust significance (properties, users, verification records, reports) so admin actions remain auditable; a `deleted_at` pattern is used only for genuinely disposable data (draft favorites, expired sessions)
- Money stored as integer minor units (kobo) with an explicit currency column, never floating point
- All location data normalized (country, state, city, area) rather than free text, so filtering and future multi-country rollout do not require a schema change
- Authorization is enforced in the service layer, not via Postgres row-level security, for Phase 1. RLS is worth revisiting once the platform has more than one backend consumer of the same database, which is not the current or near-term shape.
- Alembic migrations only. No manual schema edits against staging or production at any point.

---

## 5. Core Database Entities and Relationships

**Identity and access**
- `users`: core identity (email, phone, password_hash, status, primary_role). A user's role set is stored as `user_roles` (many-to-many against a small `roles` table) rather than a single enum column, so a person can hold more than one role (e.g. an agent who is also a tenant) without a migration.
- `tenant_profiles`, `landlord_profiles`, `agent_profiles`: one-to-one extension tables holding role-specific fields, keeping `users` itself lean.
- `agencies`: optional parent entity an `agent_profile` can belong to. Not used for individual agents in Phase 1, but present so agent-team functionality in a later phase does not require restructuring ownership of properties and listings.

**Location and taxonomy**
- `countries`, `states`, `cities`, `areas`: normalized hierarchy. Nigeria is seeded data, not a hardcoded assumption in code.
- `property_types` (apartment, house, land, commercial, office, other, configurable via admin rather than an enum in code)
- `amenities`: lookup table; `property_amenities` join table

**Listings**
- `properties`: title, description, property_type_id, listing_type (rent/sale), price, currency, location reference, bedrooms, bathrooms, size, furnishing_status, availability_status, verification_status, owner_user_id, agency_id (nullable), created_at, updated_at
- `property_media`: images and videos, ordered, with a type discriminator and processing status (raw upload -> optimized variants)
- `favorites`: user_id + property_id, unique constraint

**Trust and verification**
- `verification_requests`: subject_type (user/agent/landlord/property), subject_id, requested_level, status (unverified/pending/verified/rejected/flagged/suspended), provider_used, reviewed_by_admin_id, decision_reason
- `verification_documents`: private-bucket references, document_type, linked to a verification_request
- `verification_history`: append-only log of every state transition, who made it, and why

**Engagement**
- `enquiries`: buyer/tenant to property, message, status, linked conversation
- `conversations` and `messages`: participant list, property context (nullable), message body, read receipts via `last_read_at` per participant
- `inspections`: requested_by, property_id, proposed times (`inspection_proposals` child table for the back-and-forth), status (requested/proposed/confirmed/rejected/completed/cancelled)

**Trust enforcement**
- `reports`: reporter_id, subject_type (property/user), subject_id, reason category, description, status, handled_by_admin_id
- `reviews`: schema present but feature-flagged off in Phase 1 UI (Section 7 of the brief explicitly asks not to overbuild reputation yet); structured so ratings, response rate, and confirmed-transaction signals can be computed later without new tables

**Platform operations**
- `notifications`: user_id, channel, template_key, payload, status, sent_at
- `payments`: provider, provider_reference, purpose (featured_listing/boost/platform_fee, extensible enum), amount, currency, status, idempotency_key
- `featured_listings`: property_id, payment_id, start_at, end_at
- `audit_logs`: actor_id, action, subject_type, subject_id, before/after snapshot where relevant, IP, timestamp. Every admin action listed in Section 8 of the brief writes here.

Relationships in short: a `property` belongs to one `user` (owner) and optionally one `agency`, has many `property_media`, one current `verification_requests` record (plus history), many `favorites`, `enquiries`, and `inspections`. A `user` can hold multiple roles, has one profile per role held, and has many `notifications`, `payments`, and `audit_logs` entries as actor.

---

## 6. Backend Module Structure

```
apps/api/
  app/
    core/               # config, security primitives, db session, logging, settings per environment
    common/              # shared schemas, pagination, exception types, base repository
    modules/
      auth/              # registration, login, tokens, password reset, RBAC dependencies
      users/             # user + role profile management
      properties/        # listings CRUD, publishing state machine
      media/             # upload orchestration, presigned URLs, processing status
      search/             # filter/query building, geospatial queries
      verification/       # provider interface + implementations, admin review workflow
      messaging/           # conversations, messages, realtime
      inspections/          # scheduling and status workflow
      reports/               # fraud/report intake and admin handling
      payments/               # provider interface + implementations, featured listings
      notifications/            # channel interface + implementations, templates
      admin/                     # cross-module admin operations, audit log writers
    worker/                       # arq entrypoint and job definitions
    main.py                        # FastAPI app assembly, router registration
  migrations/                       # Alembic
  tests/
```

Each module under `modules/` follows the same internal shape: `router.py` (HTTP layer only), `schemas.py` (Pydantic request/response models), `service.py` (business logic, the only place authorization decisions are made), `repository.py` (SQLAlchemy queries, no business logic), `models.py` (ORM models owned by this module), `exceptions.py`. A module may read another module's repository through its service interface, never reach into another module's ORM models directly. This is the internal boundary that makes future extraction (verification or payments as a separate service, for instance) a matter of moving a folder and adding a network client, not a redesign.

---

## 7. Frontend Application Structure

```
apps/web/
  app/
    (marketing)/              # public homepage, about, how-it-works
    (auth)/                    # login, register, verify-email, reset-password
    properties/[slug]/          # public property detail pages, SEO-rendered
    search/                       # map + list discovery experience
    (dashboard)/
      tenant/
      landlord/
      agent/
      admin/
  components/
    ui/                          # design system primitives: Button, Input, Select, Badge, Modal, Drawer, Table
    property/                    # PropertyCard, Gallery, VerificationBadge
    search/                      # FilterBar, MapView, ResultsList
    forms/
  lib/
    api/                          # typed client generated from the backend OpenAPI schema
    hooks/
    auth/                         # client-side session handling, route guards (UX only, never the authority)
  styles/
    tokens.css                     # color, spacing, typography tokens (cream/brown system, Section 2 of the brief)
```

Route groups separate public SEO surface area from authenticated dashboards cleanly, which matters both for performance (public pages stay lean) and for the security principle that dashboard routes always re-check authorization server-side regardless of what the frontend route guard shows.

---

## 8. Authentication and Authorization Architecture

**Authentication**
- Registration requires email; phone number is collected and verified via OTP SMS before an account reaches full standing.
- Password hashing: argon2id, tuned parameters reviewed at deployment time for the actual compute budget.
- Email verification via a signed, time-limited token link.
- Access tokens: short-lived JWT (15 minutes), containing user id, role set, and a token version claim.
- Refresh tokens: opaque, stored httpOnly + Secure + SameSite=Strict cookies, rotated on every use, tracked server-side (Redis) as a token family so a stolen refresh token can be detected and the whole family revoked.
- Login attempts are rate-limited per account and per IP (Redis-backed) with progressive backoff, not just a fixed lockout, to reduce both brute-force risk and denial-of-service against a single account.

**Authorization**
- Role-based access control enforced as a FastAPI dependency at the route level (coarse gate: "must be an agent or landlord").
- Ownership and resource-level checks enforced inside the service layer for every mutating operation (fine gate: "must own this specific property"). This is the rule that matters most: the frontend hiding a button is a UX convenience, never a security control, and every state-changing endpoint re-derives the caller's permission from the database on each request.
- Admin actions (suspend user, approve verification, flag property) go through a distinct permission tier and are always written to `audit_logs` with actor, action, and reason.

**Session and CSRF**
- Because the refresh token lives in an httpOnly cookie, state-changing API requests require either a same-site double-submit CSRF token or strict `SameSite=Strict` cookie scoping combined with custom-header verification (the frontend always calls the API from its own origin, so a simple custom-header check is a pragmatic and low-friction CSRF defense here). This gets finalized with a working implementation in Phase 3, not left as an afterthought.

---

## 9. Verification Architecture

Verification is provider-abstracted from day one:

```python
class VerificationProvider(ABC):
    async def initiate_check(self, subject: VerificationSubject) -> ProviderCheckHandle: ...
    async def get_check_status(self, handle: ProviderCheckHandle) -> CheckResult: ...
    async def handle_webhook(self, payload: dict) -> CheckResult: ...
```

`SmileIdentityProvider` or `DojahProvider` implement this for automated NIN/BVN/document checks; a `ManualReviewProvider` implementation exists unconditionally, because admin review is the backstop regardless of which automated vendor is used, and is the only path in Phase 1 if automated ID verification is not yet under contract.

Data model: `verification_requests` (current state), `verification_documents` (private S3 references, never public), `verification_history` (append-only, every transition recorded with actor and reason). States: Unverified, Verification Pending, Verified, Rejected, Flagged, Suspended, exactly as specified.

**Verification criteria (draft, requires business and legal sign-off before publishing in the product):**

- **Verified User**: confirmed email, confirmed phone number, government-issued ID submitted and approved by an admin or automated provider.
- **Verified Agent**: meets Verified User, plus a business registration document (CAC) or valid agent license/association membership submitted and approved.
- **Verified Landlord**: meets Verified User, plus a proof-of-ownership or right-to-let document (Certificate of Occupancy, deed of assignment, or a utility bill/tenancy agreement matching the property address) submitted and approved.
- **Verified Property**: owner or listing agent holds the relevant verification above, plus admin confirmation that submitted documents and photos are internally consistent with the listing (Phase 1 is document- and photo-based review; in-person inspection verification is a later-phase upgrade, not a Phase 1 claim).

These criteria must be finalized with the client and legal counsel before shipping, and the UI copy around every verification badge must state plainly that verification reduces risk and confirms specific checks were performed, and is not a guarantee against fraud or a legal guarantee of ownership, exactly as required by the brief. This copy requirement is a hard constraint on the design system (Phase 2), not an afterthought.

---

## 10. Messaging Architecture

- `conversations` scoped to a pair of participants and, optionally, a property (an enquiry naturally starts a conversation).
- `messages` are plain text in Phase 1 (attachments are a defined future extension, not built now).
- Unread counts are computed from `last_read_at` per participant rather than a separately maintained counter, avoiding a second source of truth that can drift.
- Realtime delivery: FastAPI WebSocket endpoint backed by Redis pub/sub for fan-out across API instances; clients fall back to polling if the WebSocket connection drops, so the feature degrades gracefully rather than failing.
- Abuse controls: report-a-message and block-a-user both write to the same `reports` table used for property fraud reports, so admins have one moderation queue rather than two.

---

## 11. Search and Map Architecture

Filters supported at launch: location (hierarchical, plus radius search), price range, property type, listing type, bedrooms, bathrooms, size range, amenities (multi-select), furnishing status, availability.

Implementation: PostGIS `geography(Point)` column on `properties`, GiST index for bounding-box and radius queries, standard indexes for the structured filters, `pg_trgm` for free-text location/title search. This keeps Phase 1 to one data store and avoids the operational cost of keeping a second search index in sync with Postgres before there is a proven relevance or scale need for one.

Map provider: **Mapbox** over Google Maps for Phase 1, primarily on cost predictability at scale and more flexible styling for a custom-branded map experience; Google Maps remains a viable swap later if a specific data quality need (e.g. more granular Nigerian address data) justifies it, and the map integration is kept isolated to the `search` module's frontend components so that swap would not ripple through the codebase.

Future extension points already accounted for in the schema and module boundary: a `points_of_interest` table (schools, hospitals, transport, shopping) keyed by location, distance-based queries reusing the same PostGIS indexes, and lifestyle-based discovery as an additional ranking/filter layer on top of the same query builder. None of this is built in Phase 1; the point is that adding it later is additive.

---

## 12. File Storage Architecture

Two S3 buckets with distinct policies:

- **Public media bucket**: property images and video. Bucket policy allows read only via CloudFront (Origin Access Control), never direct public S3 URLs. Uploads go through the backend: client requests a presigned PUT URL after the backend validates declared content-type and size, the client uploads directly to S3, and a webhook or client callback confirms completion, at which point the worker generates optimized variants (multiple sizes, WebP) for web delivery.
- **Private documents bucket**: verification and identity documents. Public access blocked at the bucket level. Access is exclusively through short-lived, backend-issued presigned GET URLs, issued only after an authorization check confirms the requester (the document owner or an authorized admin) is allowed to see it. No document URL is ever rendered directly in a page without going through this check.

Upload validation before any file is accepted: allow-listed MIME types, magic-byte verification (not just trusting the file extension or client-declared content-type), and a hard size cap per file type. Virus/malware scanning (e.g. ClamAV as a Lambda or sidecar step on upload) is flagged as required before general availability and should be built in Phase 3/4, not deferred indefinitely; Phase 1 architecture reserves the hook for it.

---

## 13. Payment Architecture

Phase 1 payment scope is intentionally narrow: featured listings, boosted listings, and other platform service fees. No rent collection, no marketplace escrow, no seller/host settlement in this phase, per the brief.

```python
class PaymentProvider(ABC):
    async def initiate_payment(self, request: PaymentRequest) -> PaymentSession: ...
    async def verify_payment(self, reference: str) -> PaymentResult: ...
    async def handle_webhook(self, payload: dict, signature: str) -> PaymentResult: ...
```

`PaystackProvider` is the default; `FlutterwaveProvider` implements the same interface as a secondary/failover option. Every payment is recorded with an idempotency key before the provider is called, so a retried request or a duplicate webhook cannot double-charge or double-credit. Webhook signatures are verified before any state change. The `payments` table is provider-agnostic; provider-specific fields live in a JSON metadata column rather than leaking into the core schema.

Explicit open item requiring business and legal confirmation before any future phase touches rent collection, escrow, or marketplace commissions: Nigerian money transmission and payment licensing requirements (CBN guidelines) apply differently to a platform that only facilitates introductions versus one that holds or moves tenant/landlord funds. This architecture does not assume an answer here; it is called out so it is decided deliberately rather than discovered during implementation.

---

## 14. Notification Architecture

```python
class NotificationChannel(ABC):
    async def send(self, recipient: NotificationRecipient, template: str, context: dict) -> DeliveryResult: ...
```

Implementations: `EmailChannel` (SES), `SmsChannel` (Termii or Africa's Talking), `InAppChannel` (writes to `notifications` table, pushed over the existing WebSocket connection if the user is online). Templates are versioned and stored server-side, not hardcoded per call site, so copy changes do not require a deploy. Delivery goes through the background worker queue so a slow provider never blocks the request that triggered the notification, and failures retry with backoff rather than being silently dropped. Per-user notification preferences (channel opt-in/opt-out per event type) are part of the schema from the start.

---

## 15. AWS Infrastructure Architecture

- **Networking**: single VPC per environment, public subnets for the ALB only, private subnets for ECS tasks, RDS, and ElastiCache. No database or cache is ever internet-reachable.
- **Compute**: ECS Fargate services for `web`, `api`, and `worker`, each with its own task definition and auto-scaling policy (target-tracking on CPU/memory, with `api` also scaling on request count).
- **Database**: RDS PostgreSQL, Multi-AZ in production, single-AZ acceptable in staging/dev to control cost; automated backups and point-in-time recovery enabled in production from day one.
- **Cache/Queue**: ElastiCache Redis, one cluster shared across cache, rate limiting, and the arq job queue in Phase 1 (separate clusters become worth the cost once traffic volume makes contention a real risk, not before).
- **Storage/CDN**: S3 as described in Section 12, CloudFront in front of the public bucket and optionally in front of the Next.js app for edge caching of static assets.
- **DNS/TLS**: Route 53 for DNS, ACM for certificates, terminated at the ALB and CloudFront.
- **Secrets**: AWS Secrets Manager for database credentials, API keys (Paystack, Flutterwave, KYC provider, SMS provider), and JWT signing keys. Nothing sensitive is ever an environment variable committed to source control; ECS task definitions pull secrets at runtime.
- **Observability**: CloudWatch for logs, metrics, and alarms (error rate, latency, queue depth, failed payment webhooks); structured JSON logs from the application so CloudWatch Logs Insights queries are actually usable.
- **Edge protection**: AWS WAF on CloudFront and/or the ALB with managed rule groups (common exploits, rate-based rules on auth and search endpoints) plus the application's own Redis-backed rate limiting as a second layer.
- **Environments**: three isolated environments (dev, staging, production), each its own VPC and set of resources, managed via Terraform with per-environment state and variables. No shared resources between environments other than the Terraform module source.
- **IAM**: least-privilege task roles per ECS service; the `web` service has no database or S3-write permissions it does not need, the `worker` service is the only one with SES/SMS send permissions, and so on.

---

## 16. Security Architecture

Mapped against OWASP-aligned practice:

- **Injection**: SQLAlchemy parameterized queries exclusively; no raw string-interpolated SQL anywhere in the codebase.
- **Broken authentication**: argon2id hashing, rotated refresh tokens, rate-limited login and OTP endpoints, account lockout with progressive backoff.
- **Sensitive data exposure**: TLS everywhere in transit, RDS encryption at rest, S3 server-side encryption, private documents never public, PII minimized in logs.
- **Broken access control**: deny-by-default authorization, every mutating endpoint re-checks ownership server-side (Section 8), admin actions on a separate permission tier with audit logging.
- **Security misconfiguration**: no debug mode or verbose stack traces in staging/production responses, hardened default security headers (HSTS, X-Content-Type-Options, X-Frame-Options, a real Content-Security-Policy), CORS restricted to known frontend origins only.
- **Cross-site scripting**: React's default escaping plus a strict CSP as defense in depth; no `dangerouslySetInnerHTML` on user-supplied content.
- **Insecure deserialization / input handling**: Pydantic strict schema validation on every request boundary, rejecting unexpected fields rather than silently ignoring them.
- **Vulnerable components**: Dependabot (or equivalent) enabled on both the frontend and backend repositories from the first commit, with a policy of reviewing and merging security patches promptly rather than batching them.
- **Insufficient logging and monitoring**: structured audit logs for every admin action and every authentication event (login, failed login, password reset, token revocation), retained separately from general application logs.
- **File upload risk**: covered in Section 12 (type/size/magic-byte validation, private-by-default documents, virus scanning flagged as a pre-GA requirement).
- **Data protection compliance**: because the platform collects government ID documents and other personal data from Nigerian users, the Nigeria Data Protection Act/NDPR requirements (lawful basis for processing, data subject rights, breach notification, data protection officer registration thresholds) apply and should be reviewed with legal counsel before verification document collection goes live. This is called out explicitly as an item outside engineering's authority to resolve unilaterally.

Errors returned to clients are always human-readable and actionable, never a raw stack trace, database error, or internal exception message; full detail goes to structured logs only, correlated by a request ID the client-facing error message includes for support purposes.

---

## 17. Testing Strategy

- **Backend**: pytest + pytest-asyncio, a real PostgreSQL instance for integration tests (via testcontainers or a docker-compose test service, not SQLite substitution, since PostGIS and Postgres-specific behavior matter), factory-based test data, contract tests validating request/response schemas against the OpenAPI spec.
- **Frontend**: Vitest + React Testing Library for component tests, Playwright for critical end-to-end flows.
- **Critical flows requiring E2E coverage before production, per the brief**: registration, login, verification submission and admin approval, property creation and publishing, search and filtering, property viewing, favoriting, enquiry submission, messaging, inspection request and scheduling, fraud reporting, admin moderation actions, and the featured-listing payment flow (including a simulated webhook failure/retry case).
- **Coverage bar**: higher bar (roughly 85%+) on auth, payments, and verification modules given their trust and financial sensitivity; a general target (roughly 70%+) elsewhere. Coverage percentage is a floor, not a substitute for testing the actual failure and edge cases in the flows above.
- **Security-specific tests**: authorization tests that assert a user cannot act on another user's resources (not just that the happy path works), rate-limit tests on auth endpoints, and a check that private documents are unreachable without a valid signed URL and authorization.
- Tests are written alongside each phase's implementation, not batched at the end; a phase is not considered complete without its tests passing in CI.

---

## 18. Deployment Strategy

GitHub Actions pipeline: lint and type-check, run backend and frontend test suites, build Docker images, push to ECR, deploy to staging automatically on merge to main, require manual approval before promoting the same image to production (no separate production build), then a rolling ECS deployment with health-check gating so a bad deployment does not fully replace healthy tasks before failing checks are noticed.

Database migrations run as an explicit pre-deploy step using the expand/contract pattern (add new columns/tables in one deploy, backfill, switch reads/writes, remove old columns in a later deploy) so a migration never requires the API and database schema to change atomically. Rollback is a redeploy of the previous ECS task definition revision; because migrations follow expand/contract, a rollback does not require a matching down-migration to be safe.

Feature flags for anything higher-risk than a routine feature (e.g. enabling automated KYC provider checks, enabling a new payment provider) are configuration-driven from day one, even if that configuration is initially just an environment variable per environment rather than a full flagging service; a dedicated flagging tool is worth adopting once the number of flags in flight makes manual configuration unwieldy.

---

## 19. Development Roadmap

This document constitutes Phase 0 (discovery) and Phase 1 (architecture and database design). Remaining phases, in dependency order:

- **Phase 2, Design System and UI/UX**: cream/brown token system, component library (buttons, inputs, cards, badges, modals, tables, empty/loading/error states), responsive grid, accessibility baseline. Depends on Phase 1's entity model to know what each component needs to render (verification badges, listing states, etc).
- **Phase 3, Authentication and User Management**: registration, login, verification flows, RBAC enforcement, profile management. Depends on Phase 1 schema and Phase 2 components.
- **Phase 4, Property Marketplace**: listing CRUD, media upload pipeline, property detail pages. Depends on Phase 3 (ownership/authorization) and Phase 2 (property card, gallery components).
- **Phase 5, Search and Map Discovery**: filter system, PostGIS queries, Mapbox integration. Depends on Phase 4 (properties must exist to search).
- **Phase 6, Enquiries, Messaging, and Inspections**: depends on Phase 4 (properties) and Phase 3 (users).
- **Phase 7, Verification and Trust**: provider abstraction, document upload, admin review workflow, badges. Can start in parallel with Phase 4/5 since the schema and abstraction are independent, but the UI depends on Phase 2 components and Phase 3 accounts existing.
- **Phase 8, Admin Dashboard**: user/property/verification/report management, audit log viewer. Depends on nearly every prior phase since it manages their data.
- **Phase 9, Monetization**: featured/boosted listings, payment provider integration. Depends on Phase 4 (properties to feature) and Phase 8 (admin visibility into paid placements).
- **Phase 10, Security Hardening, Testing, and Production Deployment**: penetration-test-style review, load testing, final AWS hardening, go-live runbook. Continuous throughout but formally gated before launch.

---

## 20. Recommended Project Folder Structure

```
real-estate-platform/
  apps/
    web/                    # Next.js application
    api/                    # FastAPI application (see Section 6 for internal structure)
  packages/
    shared-types/            # TypeScript types generated from the backend OpenAPI schema
  infra/
    terraform/
      environments/
        dev/
        staging/
        production/
      modules/
        network/
        ecs/
        rds/
        redis/
        s3/
        cdn/
  docs/
    product/                  # PRD, verification criteria, roadmap
    architecture/              # this document and its successors
    api/                        # generated OpenAPI reference
    runbooks/                    # deployment, incident response, admin operations
  .github/
    workflows/
```

A monorepo is recommended over separate repositories for `web` and `api` at this stage: one company owns both, they version and deploy together in practice, and a shared-types package generated from the OpenAPI schema keeps the frontend and backend contracts from drifting without needing separate repository coordination overhead. This is worth revisiting only if the team later splits into fully independent frontend/backend squads with separate release cadences.

---

## Open Items Requiring Business or Legal Confirmation

These are called out explicitly rather than assumed, per the brief's instruction not to make regulatory assumptions:

1. Final verification criteria for each badge level (Section 9) need sign-off from the client and, ideally, legal review of the badge disclaimer language.
2. Choice and cost of an automated KYC/identity provider (Smile Identity, Dojah, or another) for NIN/BVN checks, versus relying on manual admin review only in Phase 1.
3. Nigeria Data Protection Act/NDPR compliance posture for collecting and storing government ID documents, including whether a Data Protection Officer registration is required at the company's scale.
4. Any future payment licensing implications (CBN money transmission rules) before Phase 9 or later phases move beyond platform service fees into rent collection or marketplace settlement.
5. Ownership and hosting of all third-party accounts (Paystack, Flutterwave, KYC provider, Mapbox, SES/SMS provider, AWS) under the client company's own accounts, per the ownership requirements already stated in the brief.

---

This architecture is submitted for review and approval. No implementation work begins until it is confirmed, per the process defined in the brief.
