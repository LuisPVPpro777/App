# Protocole Summer Build — PRD

## Original Problem Statement
User requested a personal website to clearly and cleanly display his daily objectives ("Protocole Summer Build"), with small checklist animations that reset every day, organized in categories. Includes inviolable rules (sleep, nutrition, sport chain, hair, posture), a 15-min home workout (V-Shape), and a timed daily checklist (09:30 wakeup → 00:30 lights-out).

## User Choices
- Storage: **Local (localStorage only)** — no backend, no login
- Tracking: **History + statistics** (streak, weekly %)
- Design: Agent's choice — chose Performance Pro + Luxury (dark, Volt Yellow #CCFF00, Oswald + IBM Plex Sans)
- Visual time-based notifications: **Yes** (active task highlighted in real time)
- Auth: **None** (personal site)

## Architecture
- Pure frontend (React 19, Tailwind, Shadcn UI primitives present but using custom surfaces)
- State: custom hook `useProtocolStore` backed by `localStorage` key `protocole-summer-build:v1`
- Real-time clock + active-task computation (`computeActiveTaskId`)
- Midnight reset on app load: archives previous day to history, increments/zeroes streak
- Celebration: `canvas-confetti` + `sonner` toast at 100% completion
- Backend (FastAPI) untouched — not needed for this app

## Core Requirements (static)
- Daily checklist with 7 time-stamped tasks (categorized by part of day)
- 5 inviolable rules panel
- 15-min V-Shape workout panel with countdown timer
- Stats: current streak, best streak, today %, weekly avg %, last-7-days bar chart
- Active task auto-highlight based on current system time
- Midnight reset of checkboxes; streak logic at midnight transition

## What's Been Implemented (2026-05-31)
- `pages/Dashboard.jsx` — 12-col layout: header + 7-col checklist/rules / 5-col stats/workout
- `components/CommandHeader.jsx` — live clock (HH:MM:SS), date FR, progress ring, streak & weekly badges
- `components/DailyChecklist.jsx` — 7 tasks, scaled checkbox animation, active highlight (volt left border + pulse), strikethrough on completion, confetti at 100%, reset button
- `components/InvariantRules.jsx` — 5 rules with codes 01-05
- `components/WorkoutPanel.jsx` — countdown timer with Start/Pause/Reset + 3 blocks
- `components/StatsPanel.jsx` — 4 stat cells + last-7-days bars (dashed border for empty days)
- `hooks/useProtocolStore.js` — load/save, midnight reset, streak logic, weekly avg
- `hooks/useNow.js` — ticking clock
- `lib/protocolData.js` — checklist, rules, workout config, `computeActiveTaskId`
- Fonts: Oswald + IBM Plex Sans + JetBrains Mono via Google Fonts in `index.html`
- Tested at 100% via testing_agent_v3 (iteration_1.json)

## Prioritized Backlog
### P1 (next)
- Auto-reset when tab stays open across midnight (currently only on reload)
- Optional notification sound or browser Notification API when a task's time arrives
- Calendar/history view: clickable past days showing which tasks were done

### P2
- Customizable checklist (add/edit/remove tasks)
- Export/import localStorage data (JSON download)
- PWA / installable on mobile + offline support
- Optional cloud sync if user later wants multi-device (would require backend + auth)

## Test Credentials
N/A — no auth, no backend.
