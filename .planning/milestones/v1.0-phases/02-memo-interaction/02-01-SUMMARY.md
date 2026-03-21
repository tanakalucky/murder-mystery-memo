---
phase: 02-memo-interaction
plan: 01
subsystem: ui
tags: [xyflow, react, custom-node, textarea, keyboard-handling]

# Dependency graph
requires:
  - phase: 01-canvas-foundation
    provides: ReactFlow canvas with NODE_TYPES module-scope constant pattern, ReactFlowProvider in CanvasPage
provides:
  - MemoNodeData type and MemoNode node type (Node<MemoNodeData, "memo">)
  - MemoNode custom node component with display/edit mode toggle
  - NODE_TYPES registered with memo key pointing to MemoNode
affects: [02-02, 03-persistence, 04-styling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MemoNode type aliased on import to avoid naming conflict with component export (import type { MemoNode as MemoNodeType })"
    - "MemoNodeData uses type alias with index signature ([key: string]: unknown) to satisfy ReactFlow Record<string, unknown> constraint"
    - "Edit state stored in node.data.isEditing (not local useState) so external handlers can control it via updateNodeData"
    - "nodrag class on wrapper div disables drag while editing (D-08) — more efficient than toggling node.draggable in state"
    - "scrollHeight pattern for textarea auto-resize (D-05) — set height to auto then scrollHeight"

key-files:
  created:
    - src/features/canvas/model/memo-node.ts
    - src/features/canvas/ui/MemoNode.tsx
  modified:
    - src/features/canvas/model/node-types.ts

key-decisions:
  - "MemoNodeData defined as type (not interface) with index signature to satisfy ReactFlow's Record<string, unknown> constraint"
  - "MemoNode type import aliased as MemoNodeType in MemoNode.tsx to avoid naming conflict with the component export"

patterns-established:
  - "Pattern: Custom node types must extend Record<string, unknown> — use type alias with [key: string]: unknown"
  - "Pattern: Import type alias when type name conflicts with component export name"

requirements-completed: [MEMO-02, MEMO-03, MEMO-04, MEMO-05, MEMO-06, MEMO-07, MEMO-08]

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 2 Plan 01: MemoNode Component Summary

**MemoNode custom node with display/edit mode toggle, keyboard shortcuts (Shift+Enter/Escape), textarea auto-resize, and auto-focus — registered as "memo" in NODE_TYPES**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-21T06:48:36Z
- **Completed:** 2026-03-21T06:50:19Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created MemoNodeData type and MemoNode node type satisfying ReactFlow's generic constraints
- Built MemoNode component with display mode (plain text) and edit mode (textarea) toggle via data.isEditing
- Implemented keyboard handling: Shift+Enter confirms, Escape cancels (keeping memo per D-12), Enter inserts newline naturally
- Auto-focus textarea with cursor at end when entering edit mode (MEMO-02)
- Auto-resize textarea via scrollHeight pattern without scrollbar (D-05)
- Disabled drag via nodrag class while editing (D-08) and stopPropagation on keydown (D-14)
- onBlur handler confirms edit on click-outside (MEMO-07)
- Registered MemoNode as "memo" in module-scope NODE_TYPES constant

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MemoNode type definition and MemoNode component** - `44e89dd` (feat)
2. **Task 2: Register MemoNode in NODE_TYPES** - `0052d6c` (feat)

**Plan metadata:** (to be committed with docs commit)

## Files Created/Modified

- `src/features/canvas/model/memo-node.ts` - MemoNodeData type and MemoNode node type definition
- `src/features/canvas/ui/MemoNode.tsx` - Custom node with display/edit modes, keyboard handling, auto-resize
- `src/features/canvas/model/node-types.ts` - NODE_TYPES now registers memo: MemoNode

## Decisions Made

- `MemoNodeData` defined as a `type` alias (not `interface`) with `[key: string]: unknown` index signature to satisfy ReactFlow's `Record<string, unknown>` constraint. The TypeScript compiler (bun tsgo) enforced this — `interface` without an index signature fails the constraint check.
- The `MemoNode` type import in `MemoNode.tsx` is aliased as `MemoNodeType` because the component is exported as `MemoNode`. Without the alias, TypeScript reports a merged declaration conflict (TS2395).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed MemoNodeData interface to satisfy Record<string, unknown> constraint**

- **Found during:** Task 1 (MemoNode type definition)
- **Issue:** Plan specified `export interface MemoNodeData` but TypeScript's `bun tsgo` strict mode rejected it — interface lacks index signature, causing TS2344 constraint violation on the `Node<MemoNodeData, "memo">` generic
- **Fix:** Changed `interface MemoNodeData` to `type MemoNodeData` and added `[key: string]: unknown` index signature
- **Files modified:** src/features/canvas/model/memo-node.ts
- **Verification:** `bun run typecheck` exits 0
- **Committed in:** 44e89dd (Task 1 commit)

**2. [Rule 1 - Bug] Aliased MemoNode type import to resolve naming conflict**

- **Found during:** Task 1 (MemoNode component creation)
- **Issue:** Importing `MemoNode` type and exporting `MemoNode` component in the same file causes TS2395 merged declaration error
- **Fix:** Changed import to `import type { MemoNode as MemoNodeType }` and used `MemoNodeType` in the component's generic parameters
- **Files modified:** src/features/canvas/ui/MemoNode.tsx
- **Verification:** `bun run typecheck` exits 0
- **Committed in:** 44e89dd (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes were required for TypeScript correctness with bun tsgo strict mode. No scope creep, no behavior change.

## Issues Encountered

None beyond the type-level fixes documented as deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- MemoNode is complete and registered. MemoCanvas can render memo nodes for any `{ type: "memo" }` node in state.
- Plan 02-02 can now wire canvas-level creation (double-click on pane) and useNodesState controlled state management.
- No blockers.

---

_Phase: 02-memo-interaction_
_Completed: 2026-03-21_
