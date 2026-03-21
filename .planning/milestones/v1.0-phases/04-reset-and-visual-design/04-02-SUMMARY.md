---
phase: 04-reset-and-visual-design
plan: 02
subsystem: ui
tags: [tailwind, css, fonts, noir, react-flow, visual-design]

# Dependency graph
requires:
  - phase: 04-01
    provides: ResetButton, AlertDialog, MemoCanvas reset capability, CanvasPage overlay layout
  - phase: 01-canvas-foundation
    provides: ReactFlow canvas, MemoNode, MemoCanvas structure
provides:
  - Noir color palette as Tailwind CSS custom tokens (11 colors)
  - Playfair Display + Noto Serif JP variable fonts for memo body
  - Noto Sans JP variable font for UI text
  - MemoNode styled with Old Paper background, Aged Wood border, Ink Black serif text
  - CanvasPage background in Noir Black
  - ReactFlow handles hidden via CSS and nodesConnectable={false}
  - ResetButton and AlertDialog styled in noir palette
affects: [future UI phases, visual refinement work]

# Tech tracking
tech-stack:
  added:
    - "@fontsource-variable/playfair-display"
    - "@fontsource-variable/noto-serif-jp"
    - "@fontsource-variable/noto-sans-jp"
  patterns:
    - "Tailwind CSS @theme inline block for custom color tokens using --color-* prefix"
    - "Variable font imports via @fontsource-variable packages"
    - "ReactFlow handle suppression via CSS display:none + nodesConnectable={false}"

key-files:
  created: []
  modified:
    - src/app/styles/index.css
    - src/features/canvas/ui/MemoNode.tsx
    - src/features/canvas/ui/MemoCanvas.tsx
    - src/pages/canvas/ui/CanvasPage.tsx
    - src/features/reset/ui/ResetButton.tsx

key-decisions:
  - "Variable fonts installed via @fontsource-variable packages, imported in index.css after tailwind imports"
  - "ReactFlow handle hidden with both CSS (.react-flow__handle display:none) and nodesConnectable={false} for belt-and-suspenders approach"
  - "Noir color tokens defined as --color-noir-* in @theme inline block for Tailwind utility class generation"

patterns-established:
  - "Custom Tailwind colors: defined in @theme inline as --color-noir-* for bg-noir-*, text-noir-*, border-noir-* utility generation"
  - "Font families: --font-sans and --font-serif in @theme inline, applied via Tailwind font-sans/font-serif utilities"

requirements-completed: [VIS-01, VIS-02, VIS-03]

# Metrics
duration: 3min
completed: 2026-03-21
---

# Phase 4 Plan 2: Noir Visual Design Summary

**Noir color palette (11 tokens), Playfair Display + Noto Serif JP fonts, and full dark detective-notebook aesthetic applied to MemoNode, canvas, and ResetButton/AlertDialog**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T08:07:48Z
- **Completed:** 2026-03-21T08:10:45Z
- **Tasks:** 2
- **Files modified:** 5 (plus package.json, bun.lock)

## Accomplishments

- Installed 3 variable font packages and imported them in index.css; defined 11 noir color tokens as Tailwind custom colors in `@theme inline`
- MemoNode memo cards now render with cream Old Paper background (#f5ede0), Aged Wood border (#3d2e1e), and Ink Black serif text (Playfair Display / Noto Serif JP)
- Canvas background changed from neutral-950 to Noir Black (#1a1108); ReactFlow handles hidden via CSS + `nodesConnectable={false}`; ResetButton/AlertDialog styled in noir palette (dusty-ash trigger, dark-walnut dialog, crimson delete action)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install fonts, define noir palette and font families in index.css, hide ReactFlow chrome** - `4bd3032` (feat)
2. **Task 2: Apply noir styling to MemoNode, MemoCanvas, CanvasPage, and ResetButton** - `5083e62` (feat)

**Plan metadata:** `ea6088a` (docs: complete plan)

## Files Created/Modified

- `src/app/styles/index.css` - Added font imports, 11 noir color tokens, font-serif definition, ReactFlow handle CSS overrides
- `src/features/canvas/ui/MemoNode.tsx` - Styled with noir colors (bg-noir-old-paper, border-noir-aged-wood, text-noir-ink-black) and font-serif
- `src/features/canvas/ui/MemoCanvas.tsx` - Added nodesConnectable={false} and nodesFocusable={false}
- `src/pages/canvas/ui/CanvasPage.tsx` - Changed background from bg-neutral-950 to bg-noir-black
- `src/features/reset/ui/ResetButton.tsx` - Styled trigger button, AlertDialogContent, Cancel, and Action in noir palette
- `package.json` / `bun.lock` - Added 3 @fontsource-variable packages

## Decisions Made

- Used `@fontsource-variable` packages for variable font support — supports font-weight ranges without multiple files
- Applied handle suppression both via CSS (`display: none`) and props (`nodesConnectable={false}`, `nodesFocusable={false}`) for belt-and-suspenders approach
- Defined noir colors in `@theme inline` block (not `:root`) to generate Tailwind utilities like `bg-noir-black`, `text-noir-ink-black`, `border-noir-aged-wood`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing Playwright E2E test failure: `e2e/global.setup.ts` still imports `@clerk/testing` from the removed Clerk stack. This is an orphaned file from before Phase 01 cleanup. Not caused by this plan's changes. Unit tests and browser tests all pass (14/14).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Complete noir visual design applied — the app now looks like a detective's murder board notebook
- All three VIS requirements satisfied: dark palette (VIS-01), serif fonts (VIS-02), noir-styled UI elements (VIS-03)
- Phase 04 is the final planned phase — the MVP feature set (canvas, memos, persistence, reset, noir design) is complete
- Remaining deferred item: `e2e/global.setup.ts` should be deleted or rewritten for the current app (no Clerk auth)

---

_Phase: 04-reset-and-visual-design_
_Completed: 2026-03-21_
