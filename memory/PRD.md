# Protocole Summer Build — PRD

## Original Problem Statement
Personal website to display daily objectives ("Protocole Summer Build"), with checklist animations that reset daily, organized in categories. Includes inviolable rules, V-Shape home workout, time-based daily checklist, weekly agenda, and cross-device sync.

## User Choices (cumulative)
- **Storage**: started localStorage-only → upgraded to **MongoDB cloud sync** (singleton singletons via `/api/sync/{protocol|agenda}`)
- **Auth**: None (personal preview URL)
- **Style**: Performance Pro + Luxury — dark + Volt Yellow #CCFF00 + Oswald/IBM Plex/JetBrains Mono
- **Auto theme**: Light 09:40→18:00, dark otherwise

## Architecture
- React 19 + Tailwind + Shadcn primitives, all client routes under `/`
- FastAPI backend with MongoDB (`sync_state` collection, `_id` ∈ {"protocol","agenda"})
- Cross-device sync: debounced PUT (350ms) + GET poll every 5s; `skipNextSave` ref prevents feedback loops
- Modals (WorkoutSession, GymAlert, ShareWeekModal) use `createPortal(document.body)` to escape stacking contexts
- Body scroll-lock + Escape key on every fullscreen modal

## Sections Implemented (chronological)
### v1 — MVP (2026-05-31)
- Daily checklist with 7 tasks + active-task highlight + confetti at 100%
- Invariant rules panel (5 rules)
- Stats panel (streak/best/today/weekly + last-7-days bars)
- Workout panel (15-min V-Shape with countdown timer)
- Auto midnight reset, streak logic
- Score: 14/14 tests ✅

### v2 — Light mode + Agenda + Focus Mode + GymAlert (2026-05-31)
- Auto light theme 09:40→18:00 (`useAutoTheme`)
- WorkoutSession fullscreen focus modal with ascending chrono, target overshoot (red), rest countdown, tutorial images
- Agenda grid (7d × 30-min slots), CrossFit click-to-add, Maison auto-computed
- GymAlert when current time within scheduled CrossFit
- Score: 14/14 tests ✅

### v3 — Z-index fix + UI polish + 3 features (2026-05-31)
- WorkoutSession + GymAlert wrapped in createPortal (fix: agenda no longer visible when scrolling behind modal)
- Body scroll-lock + Escape key
- Audio beeps (Web Audio API) + mute button in workout session
- TodayMission card (Crossfit/Maison/Repos status + week dots)
- Agenda quick-add form (day buttons + time presets + time input)
- Redesigned CrossFit/Maison blocks with time labels
- Score: 38/38 tests ✅

### v5 — Rollback cloud sync → 100% LOCAL (2026-06-01)
- USER DECISION: removed all cloud sync per request — wants strict local-per-device with offline support
- Reverted `useProtocolStore.js` and `useAgenda.js` to localStorage-only (same behavior as v1/v2)
- Removed `/app/frontend/src/lib/syncApi.js`
- Footer indicator now shows "Stockage local · sans wifi" (HardDrive icon) instead of cloud sync status
- Backend `/api/sync/{key}` endpoints remain in server.py but are no longer called (dead code, harmless)
- Removed @fontsource packages that had been added for prior request (cleanup)
- Each device keeps its own streak/agenda/checks via `localStorage`

## Known Minor Items
- During PNG export, html-to-image emits 4 non-blocking SecurityError warnings reading Google Fonts CSS rules (CORS). PNG still downloads. Could be suppressed via `skipFonts: true` (then text falls back to system fonts) or by self-hosting fonts.

## Prioritized Backlog
### P1
- Auto-reset (checklist & agenda) when tab stays open across midnight / Monday 00:00
- PWA installable + browser Notification API for task times

### P2
- Drag-to-create on agenda grid
- Monthly calendar view of past 30 days
- Self-host Oswald/IBM Plex fonts to make PNG exports pixel-perfect across devices
- Sync conflict UI (show "device X updated 12s ago")

## Test Credentials
N/A — no auth. State is a singleton on `sync_state` collection.
