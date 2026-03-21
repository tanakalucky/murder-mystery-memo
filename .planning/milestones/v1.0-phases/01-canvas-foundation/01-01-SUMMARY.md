---
phase: 01-canvas-foundation
plan: 01
subsystem: infra
tags: [vite, react, xyflow, cleanup, refactor]

# Dependency graph
requires: []
provides:
  - Clean codebase without Convex/Clerk/Cloudflare/wouter dead imports
  - "@xyflow/react installed and available"
  - pages/canvas with CanvasPage placeholder component
  - Simplified app entry point with no auth/backend providers
  - Buildable, type-checked project foundation for canvas work
affects: [02-canvas-foundation]

# Tech tracking
tech-stack:
  added:
    - "@xyflow/react@12.10.1 — canvas library for node-based UI"
  patterns:
    - "Entry point: StrictMode > ErrorBoundary > Routes > CanvasPage (no auth providers)"
    - "Explicit null check on document.getElementById instead of non-null assertion"

key-files:
  created:
    - src/pages/canvas/ui/CanvasPage.tsx
    - src/pages/canvas/index.ts
  modified:
    - package.json
    - vite.config.ts
    - index.html
    - src/app/index.tsx
    - src/app/routes/routes.tsx
    - src/app/styles/index.css

key-decisions:
  - "Removed all dead packages (Convex, Clerk, Cloudflare, wouter, dotenvx, next-themes, fontsource-noto-sans) to establish clean foundation"
  - "CanvasPage is a placeholder div — Plan 01-02 will add ReactFlow"
  - "font-sans temporarily set to sans-serif — Phase 4 will add proper Noto Sans JP + Playfair Display"
  - "Explicit null check on root element: `if (rootElement === null) throw new Error(...)` instead of non-null assertion"

patterns-established:
  - "App entry: no auth providers, just ErrorBoundary wrapping Routes"
  - "Routes renders single CanvasPage directly without auth guard"

requirements-completed: [CANVAS-01]

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 1 Plan 1: Canvas Foundation — Dependency Cleanup Summary

**Removed Convex/Clerk/Cloudflare/wouter dead stack, installed @xyflow/react, and wired CanvasPage as the sole app entry point**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-21T06:55:06Z
- **Completed:** 2026-03-21T06:57:13Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Removed 9 dead packages (convex, @clerk/react, @clerk/testing, @cloudflare/vite-plugin, wrangler, @dotenvx/dotenvx, next-themes, wouter, @fontsource-variable/noto-sans) from package.json and lock file
- Installed @xyflow/react@12.10.1 — the core canvas library for the app
- Deleted all dead source code: src/features/todo/, src/shared/api/convex/, src/widgets/header/, e2e/todo.spec.ts, convex.json, wrangler.jsonc, .env.\* files
- Rewired entry point: src/app/index.tsx now renders ErrorBoundary > Routes > CanvasPage with no Clerk/Convex providers
- Renamed pages/home to pages/canvas, introduced CanvasPage placeholder component

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove dead packages and clean package.json/vite.config.ts/scripts** — `5f81f40` (chore)
2. **Task 2: Remove dead source code and rewire entry points** — `fe79876` (feat)

## Files Created/Modified

- `package.json` — Renamed to murder-mystery-memo, removed 9 dead packages, added @xyflow/react, cleaned scripts
- `bun.lock` — Updated lockfile
- `vite.config.ts` — Removed @cloudflare/vite-plugin import and cloudflare() from plugins array
- `index.html` — Updated title from "Todoアプリ" to "Murder Mystery Memo"
- `src/app/index.tsx` — Rewrote: no Clerk/Convex providers, explicit null check on root element
- `src/app/routes/routes.tsx` — Rewrote: no auth logic, renders CanvasPage directly
- `src/app/styles/index.css` — Removed @fontsource-variable/noto-sans import, simplified font-sans to sans-serif
- `src/pages/canvas/ui/CanvasPage.tsx` — New placeholder component (was HomePage.tsx)
- `src/pages/canvas/index.ts` — Exports CanvasPage (was exporting HomePage)

## Decisions Made

- Used explicit `if (rootElement === null) throw new Error(...)` pattern instead of non-null assertion `!` for safer error messaging at app startup
- CanvasPage is a temporary placeholder (`<div className="h-full w-full bg-neutral-950">Canvas placeholder</div>`) — Plan 01-02 will add ReactFlow with proper canvas setup
- font-sans temporarily set to generic `sans-serif` — Phase 4 will apply the full design system (Noto Sans JP, Playfair Display, Noto Serif JP)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Foundation is clean: typecheck passes, build succeeds, zero dead imports in src/
- @xyflow/react@12.10.1 is installed and ready for Plan 01-02
- CanvasPage placeholder is in place at the correct FSD location (src/pages/canvas/)
- No blockers

---

_Phase: 01-canvas-foundation_
_Completed: 2026-03-21_
