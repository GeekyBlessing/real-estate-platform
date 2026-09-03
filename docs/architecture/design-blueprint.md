# Design Blueprint

Real estate marketplace and operating system, Nigeria phase one. This replaces the earlier design pass in full. Nothing from the prior token set, type pairing, or component styling carries forward except the client's fixed brief: cream and brown as the foundation, used with restraint.

What was wrong with the first pass, plainly: it looked like a design system, not a brand. The token names were generic (ink, clay, brass), the type pairing (a soft serif over a safe grotesk) is the exact combination that reads as generated rather than directed, and the layout leaned on a documentation sidebar that could belong to any product. This blueprint fixes the diagnosis before touching a single screen.

---

## 1. Design Philosophy

The product sells two things at once: a place to live or invest, and a reason to trust the platform doing the introducing. Every design decision below is judged against one question: does this make the property or the trust signal easier to read, or does it just decorate the page.

Three working rules, applied without exception:

One accent, spent once per screen. The brand has exactly one color it is allowed to spend boldly: a deep bronze called Patina. It appears on one element per view, the primary action or the single most important trust marker. Everywhere else, hierarchy comes from type weight, spacing, and the tonal steps between paper and ink, not from more color.

Borders over shadows. A resting surface, a card, a table, a page section, is defined by a one pixel line, not a drop shadow. Shadow is reserved for things that are actually floating above the page: a dropdown, a modal, a toast. This alone removes most of what makes an interface look like a template.

Material honesty. Cream reads as paper. Brown reads as ink, timber, bark, aged bronze. The palette is named after those materials, not after abstract scale positions, because a Nigerian property buyer's trust in this product should feel closer to a well kept land title than to a fintech dashboard.

## 2. Visual Direction

The marketplace is editorial and image led: generous margins, a strong type moment on every page, property photography given the most space on the screen. The operating system (landlord, agent, admin dashboards) is dense and quiet: tables and inline metrics, a type scale one step down from the marketplace, almost no imagery.

They share tokens and a component library. They do not share a layout system, and they should never be mistaken for each other in a screenshot.

Reference points: Stripe and Linear for how much restraint a serious technology product can afford in its interface chrome. Compass and Airbnb for how a property photo is allowed to dominate a card without the surrounding UI competing with it. None of these are being copied. The typeface pairing, the color system, and the verification component below exist nowhere else.

## 3. Color System

Named after material, not position. Six core tokens carry the entire product; four semantic tokens carry trust states and are never used for anything else.

| Token | Hex | Role |
|---|---|---|
| Paper | #F7F1E6 | Page background, marketplace |
| Parchment | #FBF7EE | Card and panel surfaces, both experiences |
| Paper Deep | #EFE6D3 | Alternate section band, subtle contrast without a new hue |
| Ink | #2B2016 | Primary text, primary button fill |
| Bark | #7C6248 | Secondary text, default icon color, default border |
| Clay | #A0937C | Placeholder text, disabled state, tertiary meta |
| Bark Line | #E2D5BE | Hairline border on resting surfaces |
| Bark Line Strong | #CDBA9B | Input and form field borders |
| Patina | #8A5A2B | The one accent. Primary link color, focus ring, featured marker |
| Patina Deep | #6E4620 | Patina hover and active state |

Semantic, verification and system feedback only:

| Token | Hex | Background | Role |
|---|---|---|---|
| Verified | #3E5C3E | #E2E8DD | Verified state, success confirmation |
| Pending | #A97A22 | #F1E4C6 | Verification pending, awaiting review |
| Danger | #9C4331 | #F0DCD3 | Rejected, flagged, destructive action |
| Neutral state | #8A7F6C | #EAE2D0 | Suspended, unverified |

Rule that governs all of the above: if a designer or engineer reaches for a hex value not in this table, the answer is to add a token here first, not to inline a color in a component. Patina is never used for a semantic state, and a semantic color is never used for a call to action. That separation is what keeps six colors from turning into visual noise.

## 4. Typography

Two type families carry the product, plus one for anything that behaves like data.

Libre Caslon Text, for display and editorial moments: hero headlines, property titles, price figures on the marketplace, section headers. Caslon is a title deed typeface before it is a fashion typeface. It carries the exact association the verification story needs: something recorded, something that holds up.

IBM Plex Sans, for interface and body text: forms, buttons, navigation, dashboard content, property descriptions. Chosen instead of the more common Inter specifically because it was designed as part of a coherent technical family, which matters here because it sits next to its own monospace sibling.

IBM Plex Mono, for anything that is data rather than prose: reference numbers, table headers as small caps labels, timestamps, verification codes. Sharing a type family with the body face means the data layer reads as part of the same engineered system, not a bolted on afterthought.

Scale (rem, 16px root):

| Role | Size | Face | Use |
|---|---|---|---|
| Display | 4rem / 64px | Caslon | Homepage hero only |
| Display small | 2.75rem / 44px | Caslon | Marketing section headers, property price on detail page |
| H1 | 2rem / 32px | Caslon | Page titles, property title |
| H2 | 1.5rem / 24px | Plex Sans, 600 | Section headers inside a page |
| H3 | 1.125rem / 18px | Plex Sans, 600 | Card titles, subsections |
| Body large | 1.0625rem / 17px | Plex Sans, 400 | Lead paragraphs, property descriptions |
| Body | 0.9375rem / 15px | Plex Sans, 400 | Default UI text |
| Body small | 0.8125rem / 13px | Plex Sans, 400 | Secondary meta, captions |
| Label | 0.75rem / 12px | Plex Mono, 500, uppercase, tracked | Eyebrows, table headers, reference codes |

Three weights maximum for Plex Sans across the whole product: 400, 500, 600. Caslon is used at Regular and Italic for display, Bold only for rare emphasis inside a headline. Every figure that represents money, a count, or a date uses tabular numerals so columns of numbers line up without hand adjustment.

## 5. Spacing, Radius, Elevation

Spacing scale in pixels, one value family for both experiences: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128. Layout gaps come from flex or grid gap properties, never from stacked margins on sibling elements, so spacing never silently doubles.

Radius: two values only. 6px for buttons, inputs, small chips, and table cells. 10px for cards, modals, and drawers. The single exception is the pill shape, reserved entirely for status and verification badges, which is what makes a pill mean something the moment a user sees it, instead of appearing on every rounded rectangle in the product.

Elevation: two shadow tokens, used only for things actually floating above the page. Float, for dropdowns, popovers, and toasts: soft and close, 0 8px 24px rgba(43, 32, 22, 0.12). Modal, for dialogs and drawers: wider and deeper, 0 16px 48px rgba(43, 32, 22, 0.18). A resting card, table, or section never carries a shadow. It is defined by a Bark Line border instead. This single rule removes most of what makes an interface read as an AI generated template.

## 6. Component System

Button: four variants, primary, secondary, ghost, destructive. Primary is solid Ink fill, used once per screen for the one action that matters. Secondary is an outlined Ink border on Parchment. Ghost has no border or fill, used for the lowest priority action in a group. Destructive is an outlined Danger button, used only behind a confirmation step. No button anywhere carries a shadow or a gradient. States: default, hover (fill darkens one step, border unchanged), focus (2px Patina Deep outline, offset 2px), active (1px downward shift), disabled (Clay fill or border, no pointer), loading (label replaced by a spinner in the button's own text color, button keeps its size so the layout does not jump).

Input and form: every field carries a visible label above it, never a placeholder used as a label. Default state is a Bark Line Strong border on white. Focus replaces the border with Patina and adds a soft outer ring. Error replaces the border with Danger and prints the specific correction needed directly under the field, not a generic "invalid input." Disabled fields drop to Paper Deep background with Clay text. A field group (row of related inputs) uses a responsive grid, never a fixed pixel width that breaks on tablet.

Badge and verification: a status badge is a small pill, label plus a single dot in the semantic color, used for listing status and admin states (active, under review, suspended). Verification is its own, larger component, not a repurposed badge. It shows the state (Unverified, Pending, Verified, Rejected, Flagged, Suspended) using one consistent shield glyph family, outline shield for Unverified, shield with a clock for Pending, shield with a check for Verified, shield with an X for Rejected, shield with an exclamation for Flagged, shield with a bar for Suspended, so the icon alone carries meaning without relying on color for users with color vision deficiency. Clicking or focusing the badge opens a small disclosure, on desktop a popover anchored to the badge, on mobile a bottom sheet, that states plainly what was checked for that specific subject (a property, an agent, a landlord), for example "Verified property: ownership document and listing details reviewed by an administrator on 14 August," followed by the fixed line every verification surface carries: "Verification confirms specific documents and checks were reviewed. It does not guarantee legal ownership or eliminate the risk of fraud."

Card: one card shape for the whole product, Parchment surface, Bark Line border, 10px radius, no shadow. The property card gives its image roughly sixty percent of the card's visual weight before any text appears. Price sits in Caslon, the single largest piece of text on the card. Location, specs, and the agent or landlord identity are grouped with clear vertical spacing rather than packed into one dense line, and the verification badge sits on the image itself, not competing with the price for attention in the body.

Modal and drawer: modal for a focused decision that blocks the page (confirm, a short form). Drawer for a wider task that benefits from keeping the underlying context visible (search filters, a property's full enquiry thread). Both use the Modal elevation token, an Ink overlay at 45 percent, and close on Escape, on an overlay click, and via a labeled close control, never an icon alone with no text alternative for screen readers.

Navigation, marketplace: a single row, wordmark, four or five primary links, sign in, and one primary button, never a hamburger menu on desktop. On mobile it collapses to wordmark, search, and a bottom tab bar for Search, Saved, Messages, and Account, because a marketplace is browsed with a thumb, not opened into a slide out menu on every tap.

Navigation, dashboard: a fixed left rail, narrower and quieter than the marketplace header, wordmark reduced to a mark only, then role appropriate sections (Overview, Listings, Enquiries, Inspections, Verification), each a text label with a single line icon, active state marked by a Paper Deep background and a Patina left edge, never a filled pill. Top bar above the content area carries only the page title, a search or filter control where relevant, and the account menu, never a second full navigation.

Table: used for every list of records in the dashboards and the admin panel, not cards repurposed as rows. Header row in Plex Mono label style. Row hover is Paper Deep. Status is always a badge inside its own column, never a colored row background, so a table stays scannable even with several status types present.

Toast and alert: toast is a brief, dismissible confirmation for something that already happened (saved, sent, uploaded), bottom right on desktop, bottom of screen above any tab bar on mobile, auto dismissing after five seconds. Alert is inline and persistent, for something the user needs to act on before continuing (a required verification step, an incomplete listing), placed directly above the content it concerns, never as a floating toast.

Empty, loading, and error states: every list, table, and feed defines all three before it ships. Empty state names the specific thing missing and, where there is a next action, offers it ("No saved properties yet" with a link to search, not just blank space). Loading state is a skeleton shaped like the real content, never a spinner and never the word "Loading" alone. Error state names what failed in plain language and offers a retry where retrying could plausibly work; it never surfaces a status code or a raw exception message.

## 7. Navigation Architecture

Marketplace: Home, Buy, Rent, Shortlets (reserved, not active until that phase), List a property, then Sign in and the primary action. Search lives in the hero and reappears as a persistent compact bar once the user scrolls into results, it is not buried behind a magnifying glass icon.

Dashboards: role scoped left rail as described above. A landlord's rail reads Overview, Listings, Enquiries, Inspections, Verification. An agent's rail reads Overview, Listings, Leads, Inspections, Verification. Admin's rail is denser: Overview, Users, Agents, Landlords, Properties, Verification, Reports, Featured, Analytics, Settings, grouped visually into Operations and Platform sections rather than one long undifferentiated list.

## 8. Marketplace Layout

Homepage, in order, each section earning its place rather than filling a template slot:

A slim announcement free header, wordmark and navigation only. A hero that states what the platform actually does in one sentence, for example "Search verified properties across Nigeria, and talk to the person who owns or manages them," not "find your dream home," with the search bar itself inside the hero, not below a photo. A results preview strip showing real property cards immediately under the hero, so the page proves the inventory exists before it explains anything else. A trust section that shows the verification component in action rather than describing it in marketing copy, using one real badge interaction the user can actually open. Featured properties, a small, clearly labeled paid placement, distinct in presentation from organic results so the monetization never reads as manipulation. A location strip for the handful of cities with real inventory, not a decorative map of a country with no listings. A closing call to action scoped to whichever the platform needs more of at a given time, tenants or landlords, and a footer that is genuinely useful (support, legal, verification criteria) rather than a decorative sitemap.

Property search and results: the initial search bar exposes only location, transaction type (rent or sale), and price, because those three filters eliminate most irrelevant results on their own. Every other filter, bedrooms, bathrooms, amenities, furnishing, size, lives inside a single "Filters" control that opens a drawer, so the page never shows ten dropdowns at once. Results render as a two column layout on desktop, a map alongside the list, and collapse to a single scrollable list with a toggle to a full screen map on mobile.

Property detail: a large hero image with a visible count and a control into a full screen gallery, price and location in Caslon immediately below it, then a specs row, then the description, then the verification component, then the agent or landlord identity card, with Contact, Message, and Request inspection available as a stateless sticky action bar on mobile and inline beside the price on desktop, never hidden behind a scroll.

## 9. Dashboard Layout

Each dashboard opens on an overview built from real business questions, not a wall of counters. A landlord's overview answers: how many active listings, how many open enquiries, what inspections are coming this week, and which listings have gone stale without a view or enquiry in the past two weeks, that last one specifically because it is the metric that tells a landlord to act, not just observe. An agent's overview adds lead response time, because a slow response is the single biggest cause of a lost lead in this market. Admin's overview is denser by necessity: pending verification queue depth, open fraud reports, and platform activity, each a number with one line of context beneath it, and each clickable straight into the filtered table behind it rather than a static tile.

Every metric on every dashboard is a small inline stat, label above number, number in tabular Caslon, not an oversized card with an icon that adds no information. Below the metrics, the page gets straight to the actual work, a table of listings, a list of enquiries, a queue of verification requests, because a dashboard is operated, not admired.

## 10. Property Card System

Structure, top to bottom: image (verification badge overlaid top left, favorite control top right), price in Caslon with the transaction context in Plex Sans immediately after it, title, location, a specs row of beds, baths, and size separated by a hairline from the price block above it, then the agent or landlord identity as the smallest text on the card. Nothing else. A card that tries to show amenities, a description snippet, and a "new" tag alongside all of the above stops being scannable, so those live on the detail page, not the card.

## 11. Property Detail System

Answers, in reading order: what is this (title, type), where is it (location, and a map on request rather than embedded by default to keep the page light), how much (price, prominent, in context of rent or sale and, for rentals, the period), is it verified (the full verification component, not a small badge easy to miss), who listed it (a compact agent or landlord card linking to their full profile), what are the features (specs and amenities, grouped, not a single run on paragraph), and what can I do next (Contact, Message, Request inspection, Favorite, Report, always visible, never nested inside a menu).

## 12. Verification System

Six states carry through every surface that shows a person or a property: Unverified, Verification pending, Verified, Rejected, Flagged, Suspended. The shield glyph family described in Section 6 is the only icon language used for verification anywhere in the product, so a user learns it once. Every instance of the component, regardless of subject type, carries the same fixed disclaimer sentence, and that sentence is treated as fixed copy, not paraphrased per screen, so legal review of the wording only ever has to happen once.

## 13. Responsive Strategy

Breakpoints: 0 to 479 phone, 480 to 767 large phone and small tablet, 768 to 1023 tablet, 1024 to 1279 small desktop, 1280 to 1535 desktop, 1536 and above large desktop. Marketplace layouts are designed mobile first, since most Nigerian traffic to a consumer marketplace arrives on a phone. Dashboards are designed desktop first and made usable down to tablet, since the primary dashboard user is a landlord, agent, or admin at a desk or with a tablet, but every dashboard table still degrades to a card per row rather than a horizontal scroll on a phone, because horizontal scrolling a data table on a small screen is a failure state, not an acceptable tradeoff.

Mobile specific decisions: a bottom tab bar on the marketplace for the four actions a tenant or buyer repeats most (Search, Saved, Messages, Account), a full screen filter drawer instead of an inline filter bar, a sticky action bar on the property detail page, and touch targets no smaller than 44 pixels on any interactive control.

## 14. Accessibility Strategy

Every interactive element has a visible focus state using the Patina Deep outline defined in Section 6, with no exceptions carved out for icon only buttons. Every icon only control carries an accessible label. Color is never the only carrier of meaning, the verification shield shapes and the badge dot plus text label both exist specifically so a user with color vision deficiency reads the same information as anyone else. Forms use real label elements tied to their fields, not placeholder text standing in for a label, and every validation error is announced to assistive technology, not just shown visually. Contrast for Ink on Paper and Ink on Parchment exceeds WCAG AA at body text sizes; Clay text is restricted to non essential meta copy specifically because it does not clear that bar at small sizes.

## 15. Animation Strategy

Motion is used in five places and nowhere else: a button's own state transition (roughly 150 milliseconds), a toast entering and leaving, a modal or drawer's open and close transition, a skeleton's loading shimmer, and a favorite control's fill transition on click. Page transitions, scroll triggered reveals, and decorative hover effects on cards are deliberately not part of this system, because a marketplace that is trying to look trustworthy benefits far more from feeling instant and stable than from feeling animated. Every transition respects a user's reduced motion preference and falls back to an instant state change.

---

This blueprint, once approved, is what the design system reference and every subsequent screen are built against. The next deliverable is the design system made tangible (color, type, and every component above in its real states), followed by the priority one screens once that reference is signed off.
