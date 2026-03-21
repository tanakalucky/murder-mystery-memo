---
phase: 03-persistence
plan: 01
subsystem: storage
tags: [localStorage, valibot, react, xyflow, persistence]

# Dependency graph
requires:
  - phase: 02-memo-interaction
    provides: MemoCanvas with useNodesState, MemoNode type, drag/edit interaction
provides:
  - localStorage persistence for memo data (id, content, position)
  - valibot schema validation on restore with corrupt-data resilience
  - saveMemos / loadMemos storage module in features/canvas/model/
affects:
  - 04-ui-polish (reads from same localStorage key)
  - any future phase that modifies MemoNode shape or canvas state

# Tech tracking
tech-stack:
  added: []
  patterns:
    - valibot safeParse for localStorage validation boundary
    - useNodesState seeded synchronously from loadMemos() to prevent empty-state flash
    - useEffect([nodes]) with dragging guard for save-on-change (D-02, D-03)
    - onNodeDragStop with allNodes third parameter for drag-complete save

key-files:
  created:
    - src/features/canvas/model/storage.ts
    - src/features/canvas/model/storage.unit.test.ts
  modified:
    - src/features/canvas/ui/MemoCanvas.tsx

key-decisions:
  - "Used strict equality n.dragging === true in useEffect guard to handle undefined safely"
  - "saveMemos maps to minimal { id, content, position } before JSON.stringify — never serialize full ReactFlow node"
  - "loadMemos called synchronously in useNodesState initial value, not inside useEffect, to avoid first-render empty flash"

patterns-established:
  - "Pattern: valibot safeParse as trust boundary for any localStorage data restore"
  - "Pattern: map to minimal shape before persist; inject runtime fields on restore"

requirements-completed: [PERS-01, PERS-02]

# Metrics
duration: 3min
completed: 2026-03-21
---

# Phase 3 Plan 1: localStorage Persistence Summary

**valibot-validated localStorage persistence for memo nodes — save on change with drag guard, restore on mount with isEditing:false injection**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T07:25:26Z
- **Completed:** 2026-03-21T07:28:37Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `storage.ts` with `loadMemos`/`saveMemos` using valibot schema validation to safely restore corrupt localStorage data
- Wired `MemoCanvas.tsx` to seed initial state from `loadMemos()` synchronously on mount — no empty canvas flash
- Save guard prevents localStorage writes during active drag (useEffect checks `n.dragging === true`); `onNodeDragStop` finalizes position save

## Task Commits

Each task was committed atomically:

1. **Test (TDD RED): Failing tests for storage** - `b974ff0` (test)
2. **Task 1: storage.ts implementation** - `38b2d9f` (feat)
3. **Task 2: Wire storage into MemoCanvas** - `51249c5` (feat)

## Files Created/Modified

- `src/features/canvas/model/storage.ts` - loadMemos/saveMemos with valibot SavedMemosSchema, STORAGE_KEY constant, error handling
- `src/features/canvas/model/storage.unit.test.ts` - 14 unit tests covering all behavior cases (valid restore, corrupt JSON, schema failure, field exclusion, QuotaExceededError)
- `src/features/canvas/ui/MemoCanvas.tsx` - Added useEffect save-on-change with drag guard, handleNodeDragStop callback, loadMemos() as initial state

## Decisions Made

- Used `n.dragging === true` strict equality in useEffect guard (not `n.dragging`) to handle undefined field safely — addresses Research Open Question 2
- `onNodeDragStop` receives `allNodes` as third parameter (not the single dragged node) to save full state — avoids Pitfall 5
- `loadMemos()` passed directly to `useNodesState(loadMemos())` rather than inside `useEffect` — prevents empty-canvas flash per Research Pitfall 4

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- localStorage persistence complete; memos survive page reload with correct content and positions
- Storage key `murder-mystery-memo:memos` is established — future phases can rely on this
- Phase 04 (UI Polish) can proceed without any storage changes

---

## Self-Check: PASSED

All created files verified present on disk. All task commits verified in git history.

_Phase: 03-persistence_
_Completed: 2026-03-21_
