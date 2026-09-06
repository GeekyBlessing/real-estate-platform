# UX and product redesign plan: from real estate website to mobile marketplace app

This plan responds to a direct product review: the app currently reads as a real estate website, not a mobile-first consumer marketplace. This document is the audit-then-plan step before any implementation, per the brief's own process (section 32). It is grounded in what the codebase actually contains today, not assumptions.

## Part 1: what the audit found

### Already solid, and worth keeping as the foundation

A few things in the current build are further along than the visual impression suggests, and a redesign should build on them rather than replace them.

Bottom navigation already exists and is already the primary mobile nav. `components/navigation/BottomNav.tsx` implements Home, Explore, Saved, Activity, and Profile, is fixed to the viewport bottom, has iOS safe-area padding, and correctly routes Profile to sign in when signed out. The top `Navbar` already collapses to just a wordmark and location picker below the `md` breakpoint. In other words, the mobile navigation shell the brief asks for (section 1) is not something to invent from nothing, it needs its destinations redesigned.

The location model already exists and is already scoped correctly. `lib/locations.ts` defines a real Country to State to City to Area hierarchy, launch coverage is deliberately narrowed to Lagos and Abeokuta only (`LAUNCH_CITIES`), and the wider `STATES` table already has room for Ibadan, Abuja, Port Harcourt, and more without code changes. Section 5's ask is largely already met at the data layer.

Verification is already a first-class concept, not a single badge. `VerificationBadge` and `VerificationDisclosure` exist and are used on cards and detail pages, and the backend already has a `verification` module with `VerificationRequest`, `VerificationDocument`, and `VerificationHistory` models. Section 11's core idea (verification with context, not just a green checkmark) is partially built.

The project has a deliberate no-fake-functionality discipline. Every screen that depends on a backend feature that does not exist yet (dashboard, messages, notifications, list a property, sell a car) shows an honest "not built yet" or "sign in required" state rather than mocked content, via `ComingSoonPage` and `SignInRequiredPage`. This is a real product-quality signal and should be extended into the redesign, not abandoned in favor of prettier fake screens.

The backend's data model already covers most of the brief. `apps/api` has real ORM tables and an applied migration for listings, media, messaging, inspections, verification, reports, notifications, and payments (see `roadmap-reconciliation.md`, Stage 7). None of these are exposed through API routes yet (only auth and users are), which is the real constraint on how much of this brief can become genuinely functional in the near term, as opposed to another layer of convincing-looking placeholder.

The design token system is a real system, not ad hoc styling. `tailwind.config.ts` defines a restrained brown and cream editorial palette, a named type scale built on a serif display face plus a sans body face, and a deliberately small radius and shadow vocabulary. The brief is right that the current screens over-rely on large brown blocks as the primary visual element, but the fix is using this palette as accents against strong photography, not replacing the palette itself.

### Where the current build genuinely matches the brief's diagnosis

The home screen's top section is a website hero, not an app home feed. `app/(marketplace)/page.tsx` opens with a large "What are you looking for?" heading and a manual Property/Cars toggle above the search field, which is exactly the landing page pattern the brief calls out in section 2. The discovery rails below it are real and mostly well structured, but two of the five ("Recently added" and "Popular in {city}") are documented in the code itself as reusing the same list in a different order rather than reflecting real signals.

Card images are placeholder photography, not real listing photos, and it shows. `ListingImage` currently sources images from Lorem Picsum, a keyless stock photo service, seeded by listing slug so the same card always shows the same photo, falling back to an illustrated graphic if that fails to load. This satisfies section 29's instruction not to use a placeholder house drawing as the primary image, but section 3's actual ask (real property and vehicle photography as the strongest visual element) is not met by stock photography of unrelated homes and cars.

Filters are a desktop side drawer adapted for mobile, not a native bottom sheet. `FilterDrawer` and `VehicleFilterDrawer` slide in from the right edge and are full height, which works on a phone screen but is not the same interaction as a bottom sheet with a drag handle and partial-height snap points, which is what section 4 and section 6 ask for.

Search results pages are desktop-first. `search/page.tsx` and `cars/page.tsx` use a two column grid (results list next to a map panel, the map itself a documented stub) that collapses to a single column with a "Show map" toggle on small screens, rather than being designed mobile-first with desktop as an expansion, which section 26 explicitly requires.

Several major sections of the brief have no frontend at all yet, and, more importantly, no backend route to build against yet: agent onboarding and KYC status tracking (section 9), agent profiles beyond a basic card (section 10), neighborhood and tenant reviews (section 12), automated lifecycle follow ups (section 13), neighborhood intelligence scores (section 14), the inspection request and status flow (section 15), listing-linked messaging (section 16), My Assets (section 19, types exist, zero UI), tenant experience (section 20), maintenance (section 21), document vault (section 22), reminders (section 23), and admin (section 24).

### The one constraint that has to shape sequencing

This is the important tension to be explicit about before proposing phases. The brief's sections 12 through 23 are substantial product features (reviews, lifecycle automation, inspections, messaging, asset management, maintenance, documents, reminders), and this codebase has held a strict line against building UI that looks functional but has no real backend behind it. Building polished screens for, say, neighborhood reviews or maintenance requests right now would either mean quietly breaking that discipline with fake data, or building real UI against backend routes that do not exist yet (auth and users are the only mounted routers today). Neither is the right first move. The right first move is the part of the brief that is purely a frontend and design problem against data that already exists: the browsing, discovery, and search experience, which is also exactly what the screenshots and the complaint are about.

## Part 2: proposed phases for this codebase

**Phase 1, the core app experience (browse, discover, search).** This is achievable now, fully, without touching the no-fake-data discipline, because it works against listing data that already exists.
- Rebuild the home screen as a discovery feed: compact greeting and location header, prominent search entry point (not a giant hero), Property and Cars as app categories, and horizontal rails driven by real distinguishing logic instead of the same list reordered.
- Replace the Lorem Picsum image pipeline with a proper image data structure sized for real listing photography (multiple images per listing, defined aspect ratios, a real upload path later), and source an actual set of Lagos and Abeokuta appropriate property and vehicle photos for seed data now, rather than stock photos of arbitrary international homes.
- Redesign listing cards around the photo as the dominant element, tightening the badge and metadata hierarchy per the brief's card examples.
- Replace the side drawer filter with a real bottom sheet component (drag handle, partial and full height states), applied to both property and vehicle filters.
- Rebuild search results mobile-first: a single scrollable list is the primary experience, with map as a secondary, explicitly optional view rather than a permanent split-screen layout, on every breakpoint including desktop.
- Build a dedicated search screen (tap-to-search entry, recent searches, suggested searches) rather than a filter bar bolted onto the results page.

**Phase 2, listing and profile depth.** Once Phase 1's structure is in place.
- Rework property and vehicle detail pages around the brief's information order (gallery, price and title, specs, description, amenities or features, location, verification, seller, then a persistent bottom action bar on every breakpoint, not just mobile).
- Rebuild the agent and seller profile page as a trust-building surface (rating, listing count, areas served, response time), still against the real `AgentCard`/agent data that exists today.
- Redesign Saved and Activity as real app sections (grouped by type, price-change and status messaging), since both already have real data behind them (favorites, listing state).

**Phase 3, verification and agent onboarding.** This can start once Phase 1 and 2 are stable, and depends on exposing the backend's existing `verification` module through real routes (not yet mounted).
- Build the "become a verified agent" onboarding flow and the identity, agent-info, documents, and review steps, with the onboarding-progress screen the brief describes.
- Expand verification badges to explain what was checked, matching section 11, for every verified role, not just agents.

**Phase 4, transactional features (inspections, messaging, reviews, My Assets, tenant tools).** This is the largest remaining scope, and it is blocked on backend routers that do not exist yet for messaging, inspections, reports, and notifications, plus the resident experience and reputation data model that is currently only a planning section in `marketplace-expansion-audit-and-plan.md`, not implemented. Recommend sequencing backend router work for each of these alongside its frontend, screen by screen, rather than building the frontend ahead of real data again.

**Phase 5, admin.** A fully separate interface, after the operational data (verification queue, reports, listings) that admin needs to manage actually exists to manage.

## What this plan recommends for right now

Start Phase 1. It is the part of the brief that is both fully achievable against real data today and the direct fix for the specific complaint (the app looks like a website, not a marketplace app), and it does not require any backend work that has not already been done.
