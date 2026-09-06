# Asset Platform Expansion: Implementation Audit and Plan

This is the concise audit requested before any of the My Assets, maintenance, document, expense, or service marketplace work begins. It is grounded in the code as it exists today, not a general description. No new features have been implemented yet. The plan at the end proposes a safe order, and flags the one decision that genuinely needs a call before real work starts.

## 1. Current architecture

A Next.js 14 frontend only (`apps/web`), App Router, TypeScript strict mode, Tailwind. There is no backend, no database, and no authentication anywhere in the running application. Every screen reads from static TypeScript objects in `lib/mock-data.ts`. Forms simulate a network call with a timeout rather than calling a real endpoint. This matters more for this expansion than it did for the cars work: My Assets, documents, maintenance, expenses, and reminders are all, by definition, data that belongs to a specific signed in user. None of that can be real until accounts and a database exist. That gap is the single fact this whole audit turns on.

## 2. Current data model

Three TypeScript modules carry the whole model today. `lib/listings.ts` defines `ListingBase`, the shared spine (slug, title, category, location, price, verification, favourite state, and who listed it), with `Vehicle` already sketched as a shape that extends it, unbuilt but ready. `lib/locations.ts` defines the real location hierarchy: country, state, city, and named area, covering Lagos, the FCT, Rivers, Ogun (with Abeokuta's ten areas), Oyo, Edo, and Kwara. `lib/mock-data.ts` holds `Agent` and `PropertyDetail` (which extends the property specialization of `ListingBase`), plus eight seed properties across five cities. There is no User, Document, MaintenanceRequest, MaintenanceRecord, Expense, Reminder, Inspection, Message, Conversation, or ServiceProvider entity anywhere yet, not even as a type. Favouriting exists as a boolean sitting directly on a listing object rather than a relation to a user, which is a symptom of the same underlying gap: there is no user to relate anything to.

## 3. Current marketplace functionality

Property search and filtering, a property detail page, an agent profile page, and login and registration screens that do not yet authenticate anyone. Verification is a real, working system: a six state badge with a click to open disclosure panel explaining what was actually checked, not a green tick sprayed everywhere. Favourites toggle in the UI but reset on reload since nothing persists. There is no cars marketplace yet, no messaging, no real enquiries, no real inspection requests (the modal simulates success and discards the input), no admin interface, and no payments of any kind.

## 4. Current user roles

There is no authentication, so there are no real roles either. The mock data implies two roles on a listing, agent and landlord, purely as a display label. There is no tenant, no dealer, no admin, and no session of any kind. Any role based experience described in this expansion, tenant dashboards, landlord property management, admin operations, depends entirely on accounts existing first.

## 5. Current navigation

The public navbar shows Buy, Rent, Land, and a call to list a property, plus a sign in link. There is no Cars entry, no Dashboard, no My Assets, no Messages, no Notifications, and no Profile, because none of those have anything real to show yet.

## 6. Current location architecture

Already built and already correct for this expansion's needs. `lib/locations.ts` models country, state, city, and area as real records rather than free text, with a `makeLocation` helper that seed data calls rather than writing location strings by hand, and a `locationMatches` helper that search uses. Abeokuta is fully represented: ten named areas, included in search, in the popular locations strip on the homepage, and in two real seed listings, not as a decorative label. Extending this to a new city or an eventual second country is additive, one entry in `STATES`, not a rewrite.

## 7. Current verification architecture

Also already built in the right shape for this expansion. Six states (unverified, pending, verified, rejected, flagged, suspended), a shield icon family, and a disclosure panel with a fixed sentence that verification confirms specific checks, never a legal guarantee. It currently covers property listings and agents only. Extending it to vehicles, documents, and other entities means adding what each one's disclosure explains, not building a second verification system.

## 8. What must change to support Cars

Less than it would look from the outside, because the groundwork is already in place from the last round of work: `ListingBase` and the `Vehicle` shape already exist, and the location and verification systems are already shared infrastructure rather than property specific code. What is actually missing is the vehicle facing surface: a vehicle card with its own information hierarchy (make, model, year, mileage, transmission, fuel, not a relabeled property card), vehicle search filters, a vehicle detail page, seed data, a dealer role concept, and navigation entries. This is UI and content work on top of an already prepared model, not a new architecture.

## 9. What must change to support My Assets

This is the real fork in the road. My Assets is not a UI problem, it is an accounts and persistence problem. Before a single real My Properties or My Cars screen can show anything true, the application needs: real user accounts (registration and login actually creating and checking a record, not simulating one), a session or token that identifies who is asking, a database, and ownership relations connecting a user to the listings, documents, and records that belong to them. Building My Assets screens against mock data before that exists would mean shipping screens that look functional but cannot hold a real user's real information, which is exactly the fake functionality the brief says to avoid. The honest sequencing is: authentication and a database first, then My Assets on top of it.

## 10. What should be implemented now

Two things are safe and valuable without waiting on the backend. First, finishing the cars marketplace frontend, since it was already the agreed next step, the model is ready for it, and it does not depend on accounts existing. Second, defining the Phase 2 data shapes (Document, MaintenanceRequest, MaintenanceRecord, Expense, Reminder, Inspection) as TypeScript interfaces only, the same way `Vehicle` was prepared ahead of the cars build, so the schema does not need a second redesign once the backend exists to hold it. Neither of these touches anything already working.

## 11. What should be deferred

Everything that requires a real signed in user with real persisted data: the actual My Properties, My Cars, My Documents, My Expenses, maintenance workflow, reminders, and inspection history screens, tenant and landlord dashboards, the service marketplace, move in and move out workflows, the AI assistant, and any payment or financial feature. None of this is being rejected, it is sequenced correctly. Building any of it now, against mock data with no accounts behind it, would produce exactly the placeholder buttons pretending to work that the brief explicitly warns against.

## 12. Potential technical risks

The most direct risk is building visible My Assets screens before the backend exists, which would look like progress while actually being disposable work that gets rebuilt once real data is involved. A second risk is scope: this specification covers a five phase product, including financial infrastructure and an AI assistant, and treating all of it as immediate work would stall the parts that are actually ready to ship, namely cars. A third risk is now having two roadmap documents in play, the original twenty section architecture document's phase numbering and this specification's phase numbering, which do not line up; that should be reconciled once in writing so nobody, including the client, is reading two different meanings into the word Phase 3. A fourth, smaller risk is schema churn: defining Document, MaintenanceRequest, Expense, and the others now, before real usage, means some of those shapes will likely change once actual accounts and real data exist. That is normal and acceptable as long as they are typed and reviewed rather than guessed at silently.

## 13. Recommended implementation order

First, reconcile the two roadmaps in a short written note so Phase numbering means one thing going forward. Second, finish the cars marketplace frontend, since it is ready to build and was already in motion. Third, define the Phase 2 data shapes as types only, no UI, so the schema is ready when the backend exists to hold it. Fourth, and this is the fork that actually needs a decision: either continue frontend work (an authenticated navigation shell with honest, clearly labeled "requires an account" states rather than fake dashboards) while backend work is planned separately, or pivot directly into building real authentication and a database, which is the true prerequisite for My Assets, real favourites, real messaging, and everything else in this specification that depends on knowing who is using the product. That choice affects what gets built next more than anything else in this document, so it is worth deciding deliberately rather than defaulting into it.
