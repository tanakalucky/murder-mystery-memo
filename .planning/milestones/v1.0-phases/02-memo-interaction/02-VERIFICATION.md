---
phase: 02-memo-interaction
verified: 2026-03-21T07:30:00Z
status: human_needed
score: 14/15 must-haves verified
human_verification:
  - test: "MEMO-05: Escape on a new empty memo"
    expected: "REQUIREMENTS.md says the new memo should be discarded; implementation keeps it as an empty memo (D-12 design decision). Confirm which behavior is correct."
    why_human: "Requirements text and design decision (D-12 in CONTEXT) contradict each other. Code deliberately keeps the empty memo. Human must decide if REQUIREMENTS.md needs to be updated or if the code needs to implement discard."
  - test: "Double-click canvas creates memo at cursor position"
    expected: "A white card memo appears centered on where the user double-clicked, immediately in edit mode with textarea focused"
    why_human: "Spatial placement and auto-focus behavior cannot be verified programmatically from static analysis alone"
  - test: "Textarea auto-resizes as content grows"
    expected: "Typing multi-line text causes the memo card to grow vertically; no scrollbar appears inside the card"
    why_human: "Requires rendered DOM environment to verify scrollHeight behavior"
  - test: "Drag repositioning works freely"
    expected: "Memo card can be dragged to any position on the canvas; position persists after releasing drag"
    why_human: "Drag interaction requires visual browser testing"
---

# Phase 2: Memo Interaction Verification Report

**Phase Goal:** Memo interaction — MemoNode custom node with display/edit modes, double-click-to-create, keyboard shortcuts, drag repositioning
**Verified:** 2026-03-21T07:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                      | Status   | Evidence                                                                                                                                                                                                                     |
| --- | -------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | MemoNode displays content as plain text in display mode                    | VERIFIED | MemoNode.tsx lines 70-75: `<p className="whitespace-pre-wrap text-black">` renders data.content                                                                                                                              |
| 2   | MemoNode shows a textarea in edit mode with auto-focus                     | VERIFIED | MemoNode.tsx lines 12-18: useEffect focuses textareaRef when data.isEditing is true                                                                                                                                          |
| 3   | Enter key inserts a newline in the textarea                                | VERIFIED | MemoNode.tsx lines 30-44: handleKeyDown only intercepts Shift+Enter and Escape; plain Enter falls through to browser default                                                                                                 |
| 4   | Shift+Enter confirms the edit and exits edit mode                          | VERIFIED | MemoNode.tsx lines 34-37: `e.shiftKey && e.key === "Enter"` → updateNodeData isEditing: false                                                                                                                                |
| 5   | Escape cancels the edit and exits edit mode (keeping the memo)             | PARTIAL  | Code exits edit mode on Escape (line 40) but keeps the memo — REQUIREMENTS.md MEMO-05 says new memos should be discarded; D-12 in CONTEXT overrides this saying empty memos should not be discarded. See human_verification. |
| 6   | Clicking outside the textarea (blur) confirms the edit                     | VERIFIED | MemoNode.tsx lines 48-50, 63: handleBlur calls updateNodeData isEditing: false; onBlur={handleBlur} wired to textarea                                                                                                        |
| 7   | Dragging is disabled while editing (nodrag class applied)                  | VERIFIED | MemoNode.tsx line 55: `<div className="nodrag w-48 ...">` in edit mode branch                                                                                                                                                |
| 8   | Textarea auto-resizes to fit content without scrollbar                     | VERIFIED | MemoNode.tsx lines 22-27: scrollHeight pattern; deps include data.content and data.isEditing (fix from ebad950)                                                                                                              |
| 9   | Double-clicking the canvas background creates a new memo at click position | VERIFIED | MemoCanvas.tsx lines 19-60: handlePaneDoubleClick checks react-flow\_\_pane class, converts via screenToFlowPosition, creates MemoNode with isEditing: true                                                                  |
| 10  | New memo is immediately in edit mode with textarea focused                 | VERIFIED | New node created with data: { content: "", isEditing: true }; MemoNode auto-focus useEffect triggers immediately                                                                                                             |
| 11  | Double-clicking an existing memo re-enters edit mode                       | VERIFIED | MemoCanvas.tsx lines 62-67: handleNodeDoubleClick → updateNodeData(node.id, { isEditing: true })                                                                                                                             |
| 12  | Memos can be dragged to reposition freely on the canvas                    | VERIFIED | MemoCanvas.tsx line 74: onNodesChange={onNodesChange} wired to ReactFlow; position changes handled by ReactFlow                                                                                                              |
| 13  | Double-clicking does not zoom the canvas                                   | VERIFIED | MemoCanvas.tsx line 76: zoomOnDoubleClick={false}                                                                                                                                                                            |
| 14  | Delete/Backspace keys do not remove nodes while editing                    | VERIFIED | MemoCanvas.tsx line 75: deleteKeyCode={null} disables all keyboard deletion of nodes                                                                                                                                         |
| 15  | Consecutive memos created at the same position are offset                  | VERIFIED | MemoCanvas.tsx lines 37-46: lastCreatedPosition ref + OVERLAP_THRESHOLD (20px) + OVERLAP_OFFSET (20px)                                                                                                                       |

**Score:** 14/15 truths verified (1 PARTIAL — MEMO-05 requirements ambiguity)

### Required Artifacts

| Artifact                                  | Expected                                     | Status   | Details                                                                                        |
| ----------------------------------------- | -------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `src/features/canvas/model/memo-node.ts`  | MemoNodeData type and MemoNode type          | VERIFIED | Exports `MemoNodeData` (type with index signature) and `MemoNode = Node<MemoNodeData, "memo">` |
| `src/features/canvas/ui/MemoNode.tsx`     | MemoNode custom node component               | VERIFIED | 77 lines; full display/edit rendering, keyboard handlers, blur, auto-resize                    |
| `src/features/canvas/model/node-types.ts` | NODE_TYPES with memo registration            | VERIFIED | `{ memo: MemoNode } satisfies NodeTypes` at module scope                                       |
| `src/features/canvas/ui/MemoCanvas.tsx`   | Controlled ReactFlow with interaction wiring | VERIFIED | 84 lines; useNodesState, useReactFlow, double-click handlers, drag support                     |

### Key Link Verification

| From                  | To                    | Via                                        | Status | Details                                                                       |
| --------------------- | --------------------- | ------------------------------------------ | ------ | ----------------------------------------------------------------------------- |
| `MemoNode.tsx`        | `model/memo-node.ts`  | `import type { MemoNode as MemoNodeType }` | WIRED  | Line 5: `import type { MemoNode as MemoNodeType } from "../model/memo-node"`  |
| `model/node-types.ts` | `ui/MemoNode.tsx`     | `memo: MemoNode`                           | WIRED  | Line 3: `import { MemoNode } from "../ui/MemoNode"`; line 7: `memo: MemoNode` |
| `MemoCanvas.tsx`      | `model/memo-node.ts`  | `import type { MemoNode }`                 | WIRED  | Line 4: `import type { MemoNode } from "../model/memo-node"`                  |
| `MemoCanvas.tsx`      | `@xyflow/react`       | `useNodesState, useReactFlow`              | WIRED  | Line 1: both imported; lines 13-14: both used in component body               |
| `MemoCanvas.tsx`      | `model/node-types.ts` | `NODE_TYPES` prop on ReactFlow             | WIRED  | Line 5: `import { NODE_TYPES }`; line 73: `nodeTypes={NODE_TYPES}`            |

### Requirements Coverage

| Requirement | Source Plan  | Description                                                    | Status    | Evidence                                                                                                                                                                                     |
| ----------- | ------------ | -------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MEMO-01     | 02-02        | キャンバス上をダブルクリックしてメモを追加できる               | SATISFIED | handlePaneDoubleClick creates new MemoNode on react-flow\_\_pane double-click                                                                                                                |
| MEMO-02     | 02-01, 02-02 | メモ生成と同時に編集状態になりテキスト入力にフォーカスが当たる | SATISFIED | New nodes created with isEditing: true; MemoNode useEffect auto-focuses textarea                                                                                                             |
| MEMO-03     | 02-01        | Enter で改行できる                                             | SATISFIED | handleKeyDown: plain Enter falls through to browser default (newline in textarea)                                                                                                            |
| MEMO-04     | 02-01        | Shift+Enter で編集を確定できる                                 | SATISFIED | handleKeyDown: shiftKey + Enter → updateNodeData isEditing: false                                                                                                                            |
| MEMO-05     | 02-01        | Escape で編集をキャンセルできる（新規メモは破棄）              | DIVERGED  | Escape exits edit mode but does NOT discard the memo. D-12 in CONTEXT.md explicitly decided empty memos should not be discarded. REQUIREMENTS.md needs updating or code needs discard logic. |
| MEMO-06     | 02-01, 02-02 | 既存メモをダブルクリックして再編集できる                       | SATISFIED | handleNodeDoubleClick → updateNodeData(node.id, { isEditing: true })                                                                                                                         |
| MEMO-07     | 02-01        | メモ外をクリックして編集を確定できる                           | SATISFIED | handleBlur → updateNodeData isEditing: false; wired via onBlur={handleBlur}                                                                                                                  |
| MEMO-08     | 02-02        | メモをドラッグで自由移動できる                                 | SATISFIED | onNodesChange={onNodesChange} handles position changes; nodrag class only applied in edit mode                                                                                               |

**Orphaned requirements check:** All MEMO-01 through MEMO-08 are claimed by plans in this phase. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern                                        | Severity | Impact |
| ---- | ---- | ---------------------------------------------- | -------- | ------ |
| None | —    | No TODO/FIXME/placeholder comments found       | —        | —      |
| None | —    | No empty implementations or stub returns found | —        | —      |

No anti-patterns detected in `src/features/canvas/` files modified in this phase.

### Human Verification Required

#### 1. MEMO-05: Escape behavior for new empty memos

**Test:** Create a new memo via double-click (do not type anything), then press Escape.
**Expected per REQUIREMENTS.md:** The new empty memo should be discarded (removed from canvas).
**Actual behavior:** The memo remains on canvas as an empty card (exits edit mode only).
**Why human:** REQUIREMENTS.md text ("新規メモは破棄") and D-12 design decision in CONTEXT.md ("空メモは破棄しない") contradict each other. The plan's must_haves (02-01-PLAN.md truth #5) also says "keeping the memo" — matching the code. A human must decide: update REQUIREMENTS.md to match the implemented behavior, or implement discard logic for new empty memos.

#### 2. Double-click to create memo at cursor position

**Test:** Open http://localhost:5173, double-click the canvas background at different positions.
**Expected:** White memo card appears centered on the double-click location, textarea is immediately focused and ready for input.
**Why human:** Spatial accuracy of screenToFlowPosition conversion and auto-focus timing cannot be verified from static code analysis.

#### 3. Textarea auto-resize behavior

**Test:** Create a memo and type several lines of text.
**Expected:** The memo card height grows to fit all text; no scrollbar appears inside the textarea.
**Why human:** The scrollHeight CSS pattern requires a rendered DOM to verify.

#### 4. Drag repositioning

**Test:** Click and drag a memo card to a new position on the canvas.
**Expected:** Memo follows the cursor and is placed at the released position; it does not move while in edit mode.
**Why human:** Drag interaction requires live browser testing.

### Commits Verified

| Commit  | Description                                        | Files Changed              |
| ------- | -------------------------------------------------- | -------------------------- |
| 44e89dd | feat(02-01): create MemoNode component             | memo-node.ts, MemoNode.tsx |
| 0052d6c | feat(02-01): register MemoNode in NODE_TYPES       | node-types.ts              |
| 9e7cfde | feat(02-02): wire MemoCanvas with controlled state | MemoCanvas.tsx             |
| ebad950 | fix(02-02): auto-resize textarea on edit re-entry  | MemoNode.tsx               |

All 4 commits exist in git history and contain substantive changes matching their descriptions.

### FSD Architecture Compliance

- `src/features/canvas/` — correct features layer placement
- Internal imports use relative paths (e.g., `"../model/memo-node"`, `"../model/node-types"`)
- Public API via `src/features/canvas/index.ts` exports only `MemoCanvas`
- No cross-slice imports within same layer detected
- Module-scope `NODE_TYPES` constant maintained (prevents ReactFlow node re-mount anti-pattern)

### Summary

The phase goal is substantially achieved. All 4 required files exist with substantive implementations. All 8 MEMO requirements have code supporting them. The one gap requiring human attention is MEMO-05: the REQUIREMENTS.md specifies that new memos should be discarded on Escape, but the design decision in CONTEXT.md (D-12) and the actual code implementation intentionally preserve empty memos. This is a documentation/decision conflict requiring human resolution — either update REQUIREMENTS.md to match the implemented behavior, or implement discard logic for new memos that have no content when Escape is pressed.

All automated checks pass:

- `bun run typecheck` — exits 0
- `bun run lint` — exits 0 (no errors)

---

_Verified: 2026-03-21T07:30:00Z_
_Verifier: Claude (gsd-verifier)_
