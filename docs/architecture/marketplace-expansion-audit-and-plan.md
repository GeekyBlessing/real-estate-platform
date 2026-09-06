# Property and Cars Marketplace: Audit and Expansion Plan

This document is the audit and plan requested before any implementation begins. It covers the current state of the application exactly as it exists in the repository today, the problems that need to be solved before the cars expansion can sit alongside property as one coherent marketplace, and a prioritized plan for closing those gaps. No code changes have been made yet. This is the "look before you leap" step.

## 1. Complete audit of the current application

The application today is a Next.js 14 frontend (`apps/web`), App Router, TypeScript in strict mode, Tailwind for styling. It covers one vertical only: property. There is no backend yet (Phase 3, the authentication and API layer, has not been started), so every screen runs on static mock data in `lib/mock-data.ts`: three agents and a handful of properties in Lagos, Abuja, and Port Harcourt. Six screens exist: homepage, search results, property detail, agent profile, login, and registration. Forms simulate their network calls with a timeout rather than calling a real endpoint.

What is genuinely solid and should not be thrown away:

The design system has real intent behind it. Colors are named after materials (paper, parchment, ink, bark, clay, patina) rather than generic startup blue or purple, with a single accent color spent deliberately rather than scattered everywhere. Typography pairs a display serif for prices and headings with a plain, highly legible sans for the interface, which avoids the cream and serif cliche that reads as generated. There are exactly two border radius values and two shadow values in the whole system, used consistently, and resting surfaces are defined by a border rather than a shadow. Property photography is deliberately illustrated rather than stock or AI generated, which was the right call and should extend to vehicles.

Verification is already built as a real system, not a green badge slapped on everything. There are six distinct states (unverified, pending, verified, rejected, flagged, suspended), a shield icon family, and a click to open disclosure panel with a fixed sentence explaining that verification confirms specific documents were reviewed and is not a legal guarantee. This is exactly the right foundation for vehicle verification and should be extended, not rebuilt.

What is missing or genuinely weak, given the product now needs to support two marketplace categories rather than one:

There is no vehicle domain of any kind: no data model, no card, no filters, no detail page. There is no location hierarchy. `locationLabel` on a property is a flat string like "Lekki Phase 1, Lagos" with nothing structured behind it, so there is no way to build a location page, a location filter that understands states and areas, or a URL like `/properties/abeokuta`. Ogun State and Abeokuta do not exist anywhere in the application.

The primary navigation only knows about property, and only part of it: the links are Buy, Rent, and Land, with no Shortlets, no Commercial, and critically, no way to represent a second marketplace category at all. The brand name "Ile" is hardcoded as a literal string in three places (the navbar link, the auth layout link, and the root metadata title) despite a code comment in each spot noting it is a placeholder. That is a real defect against the requirement that the final brand can be introduced without rewriting the application: right now it cannot be, because nothing reads from a central configuration.

Search state lives in component state only. There is no URL query string driving filters, so a search cannot be shared, bookmarked, or revisited with the same results. There is no map view. The data model has no concept of Listing as distinct from Property, no Message or Conversation, no Inspection as a real entity (the inspection request modal simulates success and discards the input), no Favourite relation (it is a boolean flag sitting directly on the property object), no Review, Report, Notification, Subscription, Promotion, or Audit log. None of this is a defect exactly, since Phase 3 has not started, but it means the data model needs to be designed now, before cars are added, so that adding a category later does not mean redesigning the schema again.

There are no dashboards with real content. A `DashboardSidebar` component exists but there is no agent, landlord, dealer, or admin dashboard behind it yet. There is no admin interface at all. SEO metadata exists only at the root layout level: no per page titles, no Open Graph tags, no structured data, and no location or category based URL structure.

Finally, an operational note rather than a product one: the current Vercel deployment used for client preview sits behind Vercel's team login wall (Deployment Protection), so the link is not actually viewable by anyone outside the Vercel team yet. That needs a settings fix, separate from anything in this document, before the next client review.

## 2. The twenty biggest problems

1. **No vehicle domain exists.** There is no Vehicle type, no car card, no car filters, no car detail page, and no car search. This is the headline gap: cars cannot be added by copying the property pattern with different labels, because a car's information hierarchy (make, model, year, mileage, transmission, fuel) is genuinely different from a property's (bedrooms, bathrooms, size, furnishing).

2. **No location hierarchy.** Location is a flat display string with nothing structured behind it. There is no Nigeria, State, City, Area model, which blocks location filtering, location pages, and clean URLs, and is the direct reason Abeokuta cannot currently be represented properly.

3. **Abeokuta and Ogun State are entirely absent**, from search, filters, popular locations, listings, and seed data.

4. **The brand name is hardcoded in three places** despite comments calling it a placeholder, which directly violates the requirement that the final brand can be introduced without rewriting the app.

5. **Navigation has no room for a second category.** The current three link navbar assumes property is the only thing on the platform.

6. **Search state is not in the URL.** Filters live in component state, so results cannot be shared, bookmarked, or revisited, and the back button does not restore a previous search.

7. **No data model for Listing as distinct from Property or Vehicle**, which matters once a listing can be one of several asset types with shared fields (price, status, dates) and type specific fields.

8. **No Message, Conversation, or Inspection entities.** The inspection modal and any future messaging UI currently have nothing real to write to or read from.

9. **Favourites are a boolean on the property object**, not a relation to a user, so favouriting cannot actually persist per user once accounts exist.

10. **No dashboards have real content.** The sidebar exists; the landlord, agent, dealer, and admin experiences behind it do not.

11. **No admin interface exists at all**, and the product needs one for verification review, reports, and moderation before it can safely scale past a handful of manually reviewed listings.

12. **Verification is scoped to property and agents only.** It needs a parallel path for vehicle documentation and dealer identity that reuses the existing shield and disclosure pattern rather than inventing a new one.

13. **No map view for either search results or a listing detail page.**

14. **SEO metadata stops at the root layout.** No per page titles or descriptions, no Open Graph tags, no structured data, and no clean, category and location based URL scheme.

15. **No listing creation flow exists at all**, for property or vehicles. This is required before any real seller can use the platform.

16. **No formal accessibility pass has been done.** Components use reasonable semantic patterns by default, but nothing has been checked against keyboard navigation, focus order, or screen reader labeling specifically.

17. **No structured empty, error, and permission denied states beyond the basics.** Building blocks (EmptyState, ErrorState, LoadingState) exist, but most of the specific states this product needs (verification rejected, listing pending, unauthorized) have not been designed.

18. **No trust and safety surface.** There is no report listing, report user, or safety guidance page, and no visible path from a listing to those actions beyond a single report link component.

19. **The current Vercel deployment is not publicly viewable**, which blocks the immediate need for a client review link.

20. **No automated checks exist**, no CI, no linting run on push, no test suite. This is minor at the current size of the project but will compound quickly once two marketplace categories, four dashboard types, and an admin panel are all shipping changes into the same codebase.

## 3. Proposed information architecture

The core structural decision is that Property and Cars are categories inside one marketplace, not two applications. Everything that is not category specific (accounts, verification, messaging, trust and safety, navigation chrome) lives once and is shared. Everything that is category specific (search filters, card layout, detail page structure) lives in its own module underneath a shared shell.

Primary navigation: Explore, Property, Cars, Sell, Professionals, Trust, then Sign in and a primary action that adapts to context (List a property while browsing property, Sell a car while browsing cars, or a combined "Start selling" entry point from the homepage). Property and Cars each expand to their own second level: Property gives Buy, Rent, Land, Shortlets, Commercial; Cars gives Buy Cars, Sell Cars.

URL structure follows the category and location pattern requested: `/properties/lagos`, `/properties/abeokuta`, `/properties/abeokuta/oke-ilewo`, `/cars/toyota/camry`, with individual listings at `/properties/[slug]` and `/cars/[slug]` as today. Dashboards live under role specific paths (`/dashboard/landlord`, `/dashboard/agent`, `/dashboard/dealer`) with a separate `/admin` surface entirely, gated once real authentication exists.

The data model gains a small number of shared concepts that both categories sit on top of: User and Role, Listing as a shared envelope (status, dates, price, location, owner, verification state) with Property and Vehicle as the two current specializations, Location as a real hierarchy (Country, State, City, Area) rather than a string, Verification as its own record type referencing whatever it verifies, Document, Message, Conversation, Inspection, Favourite, Enquiry, Review, Report, Notification, Subscription, Promotion, and Audit log. Adding a third category later (say, land as its own type rather than a property subtype, or vehicle services) means adding one more specialization under Listing, not touching the shared spine.

Once real rentals exist, the spine gains a second layer described fully in section 10: Tenancy as the record of an actual rental relationship (resident, property, landlord, start date, expected end date, status), with ResidentExperienceReview, ResidentLifecycleEvent, IssueReport, and PropertyReputationSummary sitting on top of it. Review here is generalized from a single flat entity into this structured family, since a resident's experience review, a landlord's response, and a reported issue are three different kinds of record with different visibility and moderation rules, not one Review row with a star count.

## 4. Proposed design system

The existing design system is the right foundation and should be extended, not replaced. The material palette, the two font system, the two radius and two shadow discipline, and the single spent accent color all already avoid the generic look the brief is guarding against, and rebuilding them from scratch would throw away work that is already correct.

What needs to be added rather than changed: a small set of category indicators so a user can tell at a glance whether they are looking at property or vehicle results, without turning the interface into two different color schemes. The recommended approach is a single small label or icon treatment per category (a house glyph and a car glyph, both rendered in the existing ink and bark tones) rather than assigning property its own color and cars a different one. Cream and brown stay the base of the interface as instructed; they are not used as the only decoration, and the patina accent stays reserved for calls to action and verification, not spent on category branding.

The token set gains entries for data heavy states that do not exist yet: table row states for the admin interface, a distinct but restrained treatment for pending or rejected listings, and status colors for inspection states (pending, confirmed, completed, cancelled) that reuse the existing verified, pending, danger, and neutral semantic tokens rather than introducing new ones. Component wise, the system needs a few additions it does not have today: a proper multi step form shell for listing creation, a data table with sort, filter, and pagination for the admin and dashboard surfaces, and a bottom sheet pattern for mobile filters and actions, distinct from the existing Drawer, which currently opens from the side.

## 5. Proposed property experience

The existing property experience is close to right and mostly needs to be finished rather than redesigned. Categories (Buy, Rent, Land, Shortlets, Commercial) and property types (self contain, mini flat, apartment, duplex, detached house, semi detached house, bungalow, terrace, land, office, shop, warehouse, commercial property) become explicit fields on the Property record rather than being implied by free text. Search filters extend to cover furnished, serviced, verified only, listing type, land size, and property size, each persisted in the URL so a search can be shared. The property card keeps its current information hierarchy (price, title, location, bedrooms, bathrooms, size, verification, agent) since it already reflects the correct priority order; it should not be redesigned from scratch, only extended to read from the richer data model once it exists.

The property detail page keeps its current structure (gallery, price, title, location, verification, overview, description, amenities, specifications, map, agent profile, similar properties, and the primary actions of request inspection, message, call, and save) and gains a real location breadcrumb (Nigeria, state, city, area) once the location hierarchy exists, plus a genuine map rather than a placeholder.

## 6. Proposed cars experience

Cars gets its own information hierarchy rather than reusing the property card with different labels, per the brief. A vehicle listing leads with make, model, and year as the identity of the item (the way a property leads with bedrooms and location), then price, then the attributes that actually drive a car buying decision: mileage, transmission, fuel type, condition (brand new, Nigerian used, foreign used), body type, and location. The vehicle card shows image, price, make and model with year, mileage, transmission and fuel on one line, location, seller, and verification, in that order, which is a deliberately different shape from the property card rather than a copy of it.

Vehicle search filters are make, model, price, year, mileage, transmission, fuel type, body type, condition, location, and verified seller. Make and model should be a dependent pair (choosing a make narrows the model list) rather than two independent free text fields, both to keep the data clean and because that is how a buyer actually searches. The vehicle detail page mirrors the property detail page's overall shape (gallery, price, title, location, verification, specifications, description, seller profile, similar listings, primary actions) but with vehicle specific specification fields and a seller response information block instead of an amenities list, plus a report listing action shared with property.

## 7. Proposed Abeokuta and Ogun State location structure

Location becomes a real three level hierarchy: country, state, and city, with a fourth level for named areas inside a city. Nigeria is the only country for now. States include Lagos, FCT (for Abuja), Rivers (for Port Harcourt), Oyo (for Ibadan), Edo (for Benin City), Kwara (for Ilorin), and Ogun (for Abeokuta and Abeokuta South and North where relevant). Ogun State, with Abeokuta as its primary city, is added as a first class location on the same footing as the existing five cities, not as a special case bolted onto the property model.

Abeokuta needs named areas the way Lagos already implies areas like Lekki Phase 1: GRA, Oke Ilewo, Kuto, Asero, Oke Mosan, Ibara, Obantoko, Adatan, Panseke, and Lafenwa. These areas need to exist in the location table, the search autocomplete, the filter dropdowns, the popular locations list on the homepage, and as their own pages at `/properties/abeokuta/oke-ilewo` and equivalent, exactly mirroring however Lekki or Wuse are structured. Seed data gets fictional but realistic Abeokuta listings, both property and vehicle, clearly marked as illustrative the same way the current mock agents and properties are, for example a three bedroom detached duplex in Oke Ilewo at a realistic Abeokuta price point, and a used vehicle listing from a seller based in Abeokuta.

## 8. Proposed verification experience

The existing shield icon and disclosure panel system is correct and gets extended rather than replaced. Today it covers six states for a listing or a person; the levels described in the brief (identity verified, ownership reviewed, listing checked, vehicle reviewed) map cleanly onto that system as the specific checks behind a "verified" state, surfaced inside the same disclosure panel rather than as new badge types. So a verified property shows the shield, and opening its disclosure explains which of ownership reviewed and listing checked were completed, with the existing fixed disclaimer sentence still present underneath. A verified vehicle listing works the same way, with vehicle reviewed as its equivalent check, and a verified dealer or seller shows identity verified.

The one addition needed is that the disclosure panel currently explains the badge in general terms; it should become specific per listing, naming which checks were completed and when, the way the existing mock agent data already does in its bio text (for example, "identity and CAC business registration reviewed by an administrator on 2 August"). That pattern already exists in the mock data and just needs to be surfaced in the actual disclosure UI rather than left in agent copy alone. Nothing here implies ownership or legal guarantee at any point, matching the constraint in the brief.

## 9. Proposed dashboard structure

Each dashboard needs to be built around what that role actually does day to day, not as a shared generic template with a different label. A landlord dashboard opens with a portfolio summary (active listings, enquiries, inspections this month) in plain language rather than a chart heavy layout, then active listings, enquiries, inspection requests, and verification tasks as real, actionable lists. An agent dashboard leads with leads and enquiries rather than a portfolio summary, since an agent's job is response speed, and shows response rate and listing performance alongside active listings and verification status. A car dealer dashboard mirrors the agent dashboard's shape but with vehicles listed, views, and saved vehicles in place of the agent's client facing metrics.

The admin dashboard is a different kind of interface entirely and should look like one: dense data tables with search, filter, sort, pagination, and bulk actions, covering users, agents, landlords, dealers, properties, cars, verification queue, reports, complaints, fraud flags, reviews, promotions, analytics, and audit logs. Tables are the right tool here, not cards, because an administrator's job is scanning many records quickly, not browsing a small number of rich ones.

## 10. Proposed resident experience and reputation system

This is called out in the brief as a core product differentiator, not an add on to section 2's problem 12 (verification) or the review foundation mentioned in the original roadmap. The distinction the brief draws is real: a listing tells a customer what the landlord wants them to know, and resident experience tells them what previous residents actually experienced. Getting this right means treating it as a lifecycle and a structured record, not a five star rating widget dropped onto the property detail page.

The data model needs a Tenancy record that did not exist anywhere in the previous nine sections: resident, property, landlord, start date, expected end date, and status (upcoming, active, ended). Nothing about resident experience can work without this, since every trigger in the lifecycle (move in, thirty day check in, six month follow up, move out approaching, exit review) reads off these dates. On top of Tenancy sit four more records. ResidentLifecycleEvent tracks which follow up prompts have fired for a given tenancy and when, so a resident is never asked the same question twice and notification preferences are respected rather than the platform emailing on a fixed schedule regardless of what the resident wants. ResidentExperienceReview is a structured record, not a single rating: separate category ratings for the property itself (water, electricity, internet, security, noise, flooding, parking, maintenance, cleanliness, environment, accessibility), separate category ratings for the landlord (responsiveness, communication, maintenance response, privacy, deposit handling), separate category ratings for the agent where one was involved (listing accuracy, communication, professionalism, transparency, inspection experience), plus a short written account, optional photos, the stay period, issues encountered, issues resolved, and a recommend or not flag. IssueReport is its own record rather than folded into the review text, carrying a status of reported, confirmed, or resolved, so the platform can say "residents have reported water pressure issues" rather than asserting "this property has water pressure issues" as settled fact until there is a real basis to confirm it. PropertyReputationSummary is a computed, cached aggregate rather than something a landlord or admin can edit directly, since editable aggregates are exactly the kind of thing that undermines trust in the whole feature.

The Verified Resident indicator reuses the existing shield and disclosure pattern from section 8 rather than inventing a new badge family. It means the platform has a reasonable basis for believing the reviewer had a real rental relationship through the platform, tied to a real Tenancy row, the same way a verified listing means specific documents were reviewed rather than an unqualified guarantee. What is shown publicly next to a review stays deliberately limited to something like "Verified Resident, stayed 2025 to 2026": never the exact unit number, phone number, email, NIN, or any private document, and never a resident's identity without their explicit permission, matching the same disclosure discipline the platform already applies to verification.

Public display of the aggregate follows the same restraint the rest of the platform already uses for verification and, going forward, for search result counts: real numbers only, and an explicit "Not enough resident experiences yet" state below whatever sample size threshold the team sets, rather than a synthetic 4.2 out of 5 sitting on a property with two reviews. Category breakdowns (water, electricity, security, maintenance, landlord responsiveness, location) render the same way, each with its own star value and its own count, and each capable of independently saying there is not yet enough data. Reputation is attached to the property record itself, not to any single listing instance, so relisting a property after a vacancy does not wipe its history. A future resident evaluating a relisted property should be able to see recurring maintenance problems, common complaints, and how a landlord responded to past issues, while individual past residents stay unidentified unless they chose otherwise.

Landlords and agents get a response channel, shown attached to but visually distinct from the original review, the same pairing pattern used for report responses elsewhere in trust and safety. They cannot delete a legitimate review; the recourse for a genuinely false or abusive one is the same report and moderation queue used for listings and users elsewhere in the product, extended with rules specific to reviews: no personal attacks, threats, hate speech, private personal information, unverified criminal accusations, defamatory statements, spam, fake reviews, off topic content, or rating manipulation. The review flow itself is framed around "what happened during your stay" rather than open ended commentary about individuals, which does most of the moderation work before it is needed.

The move out flow is where this earns its place as a retention mechanic rather than just a data collection form: when a tenancy is marked as ending, the resident sees a move out checklist (final inspection, outstanding maintenance, deposit status, documents, final meter readings where applicable, photos) and the exit experience review in the same place, then the lifecycle triggers the final follow up after the move out date passes. None of this is a trust score with an opaque formula. The methodology stays the structured categories and verified indicators described above, so a customer can see exactly what was asked and who was eligible to answer, which is the only kind of trust signal worth building on a marketplace that does not yet have years of transaction history behind it.

## 11. Prioritized implementation roadmap

**P0, before anything else ships:**
Fix the Vercel deployment protection setting so the current property only build is actually viewable by the client. Centralize the brand name behind APP_NAME, APP_TAGLINE, APP_DESCRIPTION, logo, and favicon configuration and remove the three hardcoded "Ile" references. Design and migrate the shared data model (User, Role, Listing, Location, Verification, Document) so that Property and Vehicle can both sit on top of it without a second migration later. Build the Location hierarchy and add Ogun State and Abeokuta with its named areas throughout search, filters, and seed data.

**P1, the cars expansion itself:**
Build the Vehicle data model, the vehicle card, vehicle search and filters, and the vehicle detail page, keeping the information hierarchy distinct from property as described above. Extend the verification disclosure system to vehicle and dealer checks. Update the primary navigation to represent both categories. Move search filters into URL state for both categories so results are shareable.

**P2, making the platform usable by real sellers:**
Build the multi step listing creation flow for both property and vehicles, with autosave, progress, and validation. Build the landlord, agent, and car dealer dashboards with real (even if still mock) data behind them. Build basic messaging and a real inspection request flow backed by actual entities rather than a simulated success toast. Add per page SEO metadata, Open Graph tags, and the clean category and location URL structure.

**P3, platform maturity:**
Build the admin dashboard and the trust and safety surface (report listing, report user, safety guidance). Add map views to search results and detail pages. Run a full accessibility pass against keyboard navigation, focus states, and screen reader labeling. Add CI with linting and type checking on every push, and a basic test suite. Build the resident experience and reputation data model described in section 10 (Tenancy, ResidentExperienceReview, IssueReport, ResidentLifecycleEvent, PropertyReputationSummary), the structured review submission flow, and the property reputation display with its sample size gating, seeded only with clearly marked illustrative reviews until real tenancies exist, never with invented statistics presented as real.

**P4, once real tenancies and payments exist:**
Turn on the resident lifecycle notification triggers (move in check in, six month follow up, move out approaching, exit review) against real Tenancy records and real notification delivery, respecting per resident notification preferences and rate limiting so residents are not spammed. Build the landlord and agent response flow to reviews. Build the move out flow (checklist, final inspection, deposit status, documents, final meter readings, exit review) as a connected sequence rather than a form in isolation. Extend the moderation queue with review specific rules (personal attacks, threats, private information, unverified accusations, fake reviews, rating manipulation) alongside the listing and user moderation already in the admin dashboard. This phase depends on the payment and lease infrastructure described in the separate Phase 1 architecture document, since a Tenancy record needs a real rental transaction behind it to be trustworthy rather than something any user could self report.

Nothing in this plan has been implemented yet. The next step, once this is reviewed, is to start at the top of P0 and work down in order, verifying each piece against the running application before moving to the next rather than making broad changes across the codebase at once.
