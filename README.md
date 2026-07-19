# WanderLove — Couple Travel Command Center 💕

Full-stack Next.js 14 (App Router) + TypeScript + MongoDB app for couples to plan trips together.

## ✅ Step 1 of 3 — done in this delivery

- Project scaffold: Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, Framer Motion
- Love/scrapbook theme foundation: Poppins + Playfair Display fonts, CSS-variable-driven colors (ready for the Step 3 theme customizer), paper-texture background
- MongoDB models (Mongoose, fully typed, no `any` in schemas): `User`, `Trip` (with embedded `days`/`activities`/`sharedJournal`/`packingChecklist`), `Activity`, `Template`, `JournalEntry`
- Auth: register / login / logout with JWT (httpOnly cookie), bcrypt password hashing
- Partner Link system: generate a unique `LOVE-XXXX` code, partner accepts it, both users get linked one-to-one
- Route protection via `middleware.ts` (edge-safe JWT verification with `jose`) for `/`, `/trips`, `/instant`, `/settings`, and `/profile`
- Dashboard shell: Sidebar + Navbar, trip grid with `TripCard`, live countdown widget to the nearest upcoming trip, empty state
- Reusable UI kit: `Button`, `Input`, `Card`, `Modal` — all theme-aware
- Placeholder pages for Trip Wizard / Instant Plan / Settings so navigation doesn't 404 before Steps 2 & 3 land

## ✅ Step 2 of 3 — done in this delivery

- Trip Creation Wizard at `/trips/new` (3 steps: details → visibility → packing template), auto-generates one day-column per calendar day
- Itinerary Builder at `/trips/[tripId]/itinerary` — full drag-and-drop with `@dnd-kit` (reorder within a day *and* move activities across days), persisted via a reorder API
- Activity form (modal): title/location/time/cost, category dropdown (defaults + user's custom categories), mood picker (😍😊😐😡), surprise-mode toggle (🎁, masks title/cost from the partner), and dynamic custom fields pulled from user preferences
- Instant Plan at `/instant` — mood + destination + days + budget → matches seeded `Template` docs (with a keyword heuristic for beach/mountain/city) and generates a ready-to-edit trip
- Full Trip/Activity API: `GET/POST /api/trips`, `GET/PUT/DELETE /api/trips/[tripId]`, `POST /api/trips/[tripId]/activities`, `PUT/DELETE /api/trips/[tripId]/activities/[activityId]`, `PUT /api/trips/[tripId]/activities/reorder`, `POST /api/trips/instant`
- Trip detail shell: header + tab navigation (Itinerary / Map / Budget / Journal) shared across all trip sub-pages
- `lib/seed.ts` — seeds default Instant Plan templates (`npm run seed`)
- **Bug fixes carried over from Step 1**: removed a duplicate root/dashboard route conflict (dashboard now correctly owns `/`), fixed Tailwind color-opacity utilities (`border-primary/20` etc.) which didn't work with the CSS-variable-based theme colors, split JWT verification into a Node version (API routes) and an Edge-safe version via `jose` (middleware)

## ✅ Step 3 of 3 — done in this delivery (project complete!)

- **Map** (`/trips/[tripId]/map`) — Mapbox GL markers (numbered, in itinerary order) + a dashed route polyline connecting them; the Activity form now has an optional "Map coordinates" section so any activity can be plotted. Falls back to a friendly message if `NEXT_PUBLIC_MAPBOX_TOKEN` isn't set or no activities have coordinates yet.
- **Budget** (`/trips/[tripId]/budget`) — Recharts pie chart (spend by category) + bar chart (spend by day), a budget/spent/remaining summary, and an expense settlement calculator (`lib/budget.ts`) that respects each activity's "who paid" and the trip's split rule (half/me/partner) to say exactly who owes whom.
- **Shared Journal** (`/trips/[tripId]/journal`) — post text + photo-URL entries, timestamped, both partners' posts shown together (`POST /api/trips/[tripId]/journal`).
- **Couple Admin Control Hub** (`/settings`) — theme customizer with live color preview (writes CSS variables at runtime via `ThemeInjector`, so no rebuild needed), custom category manager, custom activity field manager, packing template editor, partner link/accept UI, and default expense-split-rule selector. All backed by `GET/PUT /api/settings`.
- **PDF export** — an "Export PDF" button on the Itinerary tab captures the day-by-day board with `html2canvas` and paginates it into a downloadable PDF with `jsPDF` (chosen over a server-rendered PDF so it needs no extra backend service).
- Activity form also gained a "Who paid?" selector (Me / Partner) once a partner is linked — this is what powers the settlement math.

### Bugs found & fixed while verifying Step 3

- Fixed two implicit-`any` TypeScript errors in `lib/budget.ts` and the new trip sub-pages by giving `lib/serialize.ts` proper exported interfaces (`SerializedTrip`, `SerializedDay`, `SerializedActivity`) instead of relying on inferred `ReturnType<>`.
- Fixed a TS error importing `mapbox-gl/dist/mapbox-gl.css` as a dynamic `import()` (no type declarations for CSS) — switched to a plain side-effect import at the top of `MapView.tsx`.
- Verified `next build` end-to-end in this sandbox by temporarily swapping in system fonts (the sandbox itself can't reach `fonts.googleapis.com` — this is a sandbox network restriction only, not a code issue) — build completed cleanly with all 17 routes generated, then restored the real Google Fonts (`Poppins`/`Playfair Display`) config before packaging.

## 🆕 Post-launch fixes

- **Mobile nav**: the Sidebar was `hidden` below the `md` breakpoint with nothing replacing it — added a hamburger menu (`components/layout/MobileNav.tsx`) in the Navbar that slides in the same "My Trips / Instant Plan / Settings" links on mobile.
- **Countdown widget**: now ticks every ~47ms and shows Seconds and Milliseconds boxes alongside Days/Hours/Mins (`lib/utils.ts` → `getCountdownParts` extended, `CountdownWidget.tsx` updated). It also uses the nearest upcoming trip's cover photo as its background (dark gradient overlay for legibility), matching the `TripHeader` treatment — falls back to the love-gradient if no cover is set.
- **Trip cover photo**: the trip header (shared across Itinerary/Map/Budget/Journal tabs) is now a `TripHeader` banner that displays `coverImage` behind the title, with a "Change cover" button (paste an image URL) that saves via `PUT /api/trips/[tripId]`.

## 🆕 Round 3 — mobile fixes, dark mode, profile, trip editing

- **Mobile zoom bug (root cause fixed)**: `app/layout.tsx` had no `viewport` meta export at all, which is exactly why every page rendered pinch-zoomed on phones. Added a proper `viewport` export (`width: device-width, initialScale: 1`).
- **Dark / Light mode**: implemented app-wide, not just a few components.
  - `ink`, `blush`, `parchment` colors (and a new `surface` token that replaces hardcoded `bg-white` on cards/panels) are now CSS-variable-driven, with `.dark` class overrides in `globals.css`. Because nearly every component already used these semantic classes instead of raw colors, this flips the *entire* app to dark mode without needing `dark:` variants sprinkled everywhere.
  - `box-shadow` utilities (`shadow-soft`, `shadow-card`) now read from the same CSS variables too, so they adapt to dark mode and to your custom theme color.
  - A blocking inline script (`ThemeModeScript`, rendered in `<head>`) applies the saved preference *before paint* — no flash of the wrong theme on load.
  - `useThemeMode` hook + `ThemeModeToggle` (sun/moon button) — in the Navbar, and as a dedicated "Appearance" card on the new Profile page. Preference is saved per-device via `localStorage` (so each partner can pick their own).
  - Red error/danger text and backgrounds (`text-red-500`, `bg-red-50`) got explicit `dark:` variants so they stay legible on dark backgrounds.
- **Profile page** (`/profile`, new): cover banner + overlapping avatar (both set via pasted image URL, same UX pattern as trip covers), editable name + bio, password change form, and the Appearance card. Backed by new `User` model fields (`avatar`, `coverImage`, `bio`) and new API routes: `GET/PUT /api/profile`, `PUT /api/profile/password`. Linked from the Navbar (click your avatar/name) and from the mobile menu.
- **Trip ("tour") editing**: a new "Edit trip" button next to "Change cover" on every trip's header opens `TripEditModal` — edit name, destination, country, dates, timezone, currency, budget, and visibility, saved via the existing `PUT /api/trips/[tripId]`.
- **Responsive pass**: audited every multi-column grid across the Trip Wizard, Instant Plan form, Activity form, and Theme Customizer — anything that was a fixed 2/3-column grid now stacks to 1 column below the `sm` breakpoint. The trip tabs (Itinerary/Map/Budget/Journal) go icon-only on narrow screens instead of overflowing. The `Modal` component is now scrollable with a `max-h-[85vh]` cap so long forms (Activity form, Trip edit) don't get cut off on short mobile viewports.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in MONGODB_URI and JWT_SECRET at minimum
npm run seed                        # seeds Instant Plan templates (romantic/adventure/relax x beach/mountain/city)
npm run dev
```

Open http://localhost:3000 — you'll land on `/login`. After logging in, your trips dashboard is at `/` (the root URL, inside the `(dashboard)` route group). Register two accounts to test the partner-link flow via the **Settings page** (`/settings` → "Partner & expense splitting"):
1. Account A → click "Get my link code" and copy the `LOVE-XXXX` code shown.
2. Account B → paste that code into "Got a code from your partner?" and click "Link up".

Once linked, any trip either of you creates automatically includes the other as a collaborator.

## Environment variables

See `.env.local.example`. Required to run at all: `MONGODB_URI`, `JWT_SECRET`. Optional: `NEXT_PUBLIC_MAPBOX_TOKEN` (needed for the Map tab — get a free token at mapbox.com), Cloudinary keys (not wired up in the app yet — image fields currently accept any URL, e.g. from Cloudinary's own upload widget or any image host).
