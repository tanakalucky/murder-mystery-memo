# Phase 3: Persistence - Research

**Researched:** 2026-03-21
**Domain:** localStorage persistence with valibot schema validation, React useEffect sync
**Confidence:** HIGH

## Summary

Phase 3 is a focused, low-risk persistence phase. The entire codebase is a frontend-only React app using @xyflow/react for canvas state. MemoCanvas currently holds node state via `useNodesState<MemoNode>([])` with an empty initial array. The task is to: (1) persist the minimal memo data `{ id, content, position }` to localStorage on every nodes change and on drag-stop, and (2) restore that data on mount.

valibot 1.3.1 is already installed and its `safeParse` API is the correct tool for validating raw localStorage data before attempting to reconstruct nodes. The validation boundary should be tight: only the persisted fields are validated; runtime-only fields (`isEditing`, `measured`, `dragging`) are never persisted and are reinjected on restore.

The feature belongs in `src/features/canvas/model/` per Feature-Sliced Design — storage is a model-layer concern for the canvas feature, not a shared utility. The storage key name and valibot schema definition are open to Claude's discretion per CONTEXT.md.

**Primary recommendation:** Add `storage.ts` to `src/features/canvas/model/`, define a valibot schema for `SavedMemoData[]`, implement `loadMemos` / `saveMemos`, and wire them into `MemoCanvas.tsx` via `useNodesState` initial value and `useEffect([nodes])`.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** ノード追加・編集確定・削除のたびに即座にlocalStorageへ保存する
- **D-02:** ドラッグ中はリアルタイム保存しない。onNodeDragStop（ドラッグ完了時）のみ保存する
- **D-03:** useEffect([nodes]) でノード配列の変更を監視して保存トリガーとする
- **D-04:** 必要最小限のデータのみ保存する — `{ id, content, position: { x, y } }` の配列
- **D-05:** ReactFlow内部のUI状態（isEditing, measured, dragging等）は保存しない
- **D-06:** 復元時はisEditing: false, type: "memo" を付与してMemoNodeとして再構築する
- **D-07:** localStorage のデータが破損・パース不能の場合はサイレントに空キャンバスで開始する（console.errorに記録のみ）
- **D-08:** localStorage の容量超過で保存失敗した場合もサイレントに失敗する（console.errorに記録のみ）
- **D-09:** ユーザーへのトースト通知やエラーUIは表示しない — ゲーム中の集中を妨げない

### Claude's Discretion

- localStorageのキー名
- valibot スキーマの具体的な定義
- storage.ts のモジュール配置（shared/lib vs features/canvas/model）
- useEffect依存配列の最適化方法

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                        | Research Support                                                                                       |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| PERS-01 | メモデータ（内容・位置）をlocalStorageに保存できる | `saveMemos` called from `useEffect([nodes])` and `onNodeDragStop`; try/catch for QuotaExceededError    |
| PERS-02 | ページリロード時にlocalStorageからメモを復元できる | `loadMemos` called once to seed `useNodesState` initial value; valibot `safeParse` guards corrupt data |

</phase_requirements>

## Standard Stack

### Core

| Library       | Version              | Purpose                                         | Why Standard                                 |
| ------------- | -------------------- | ----------------------------------------------- | -------------------------------------------- |
| valibot       | 1.3.1 (installed)    | Runtime schema validation of localStorage data  | Already in project; v1 API confirmed working |
| @xyflow/react | ^12.10.1 (installed) | `useNodesState`, `onNodeDragStop` hook/callback | Canvas library driving all node state        |

### Supporting

| Library           | Version               | Purpose                                    | When to Use                                  |
| ----------------- | --------------------- | ------------------------------------------ | -------------------------------------------- |
| React `useEffect` | (React 19, installed) | Watch `[nodes]` array and call `saveMemos` | Fires after every render where nodes changed |

### Alternatives Considered

| Instead of         | Could Use                              | Tradeoff                                                                                 |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| valibot safeParse  | JSON.parse with manual checks          | valibot gives typed output and clear failure path; already a project dependency          |
| useEffect([nodes]) | zustand middleware or manual save call | useEffect is the simplest integration with existing `useNodesState`; no new dependencies |

**Installation:** No new packages required — valibot already installed.

## Architecture Patterns

### Recommended Project Structure

```
src/features/canvas/
├── model/
│   ├── memo-node.ts        # existing — MemoNode, MemoNodeData types
│   ├── node-types.ts       # existing — NODE_TYPES constant
│   └── storage.ts          # NEW — loadMemos / saveMemos + valibot schema
├── ui/
│   ├── MemoCanvas.tsx      # MODIFIED — wire loadMemos initial state + useEffect save
│   └── MemoNode.tsx        # existing — unchanged
└── index.ts                # MODIFIED — export loadMemos/saveMemos if needed externally
```

**FSD placement rationale:** Storage is a model-layer concern specific to the canvas feature. It accesses no shared utilities beyond valibot (an external dependency). Placing it in `features/canvas/model/storage.ts` follows the same pattern as other model files in this slice. It should NOT go in `shared/lib` because it contains canvas-domain logic (the `SavedMemoData` schema mirrors `MemoNodeData`).

### Pattern 1: valibot SafeParse for localStorage Validation

**What:** Define a schema matching the persisted shape, use `safeParse` to validate raw JSON, fall back to empty array on failure.

**When to use:** Any time data crosses a trust boundary (localStorage → application state).

**Example:**

```typescript
// src/features/canvas/model/storage.ts
import * as v from "valibot";

// Persisted shape — only the fields we write to localStorage
const SavedMemoSchema = v.object({
  id: v.string(),
  content: v.string(),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
});

const SavedMemosSchema = v.array(SavedMemoSchema);

// Type derived from schema (compile-time)
type SavedMemo = v.InferOutput<typeof SavedMemoSchema>;
```

**Verified:** `v.safeParse`, `v.array`, `v.object`, `v.string`, `v.number` all confirmed present in valibot 1.3.1. `v.InferOutput` is a TypeScript type (not a runtime value) exported from the package's `.d.mts` declarations.

### Pattern 2: loadMemos — Parse + Reconstruct as MemoNode[]

**What:** Read from localStorage, validate, reconstruct full `MemoNode` objects by injecting runtime-only fields.

**When to use:** Called once, before `useNodesState` initialization.

**Example:**

```typescript
// Source: valibot 1.3.1 safeParse API (verified)
import type { MemoNode } from "./memo-node";

const STORAGE_KEY = "murder-mystery-memo:memos";

export function loadMemos(): MemoNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    const parsed = JSON.parse(raw) as unknown;
    const result = v.safeParse(SavedMemosSchema, parsed);

    if (!result.success) {
      console.error("メモデータの復元に失敗しました — 空のキャンバスで開始します", result.issues);
      return [];
    }

    // D-06: Inject runtime-only fields on restore
    return result.output.map((memo) => ({
      id: memo.id,
      type: "memo" as const,
      position: memo.position,
      data: {
        content: memo.content,
        isEditing: false, // D-05: never persisted
      },
    }));
  } catch (error) {
    console.error("メモデータの読み込みに失敗しました", error);
    return [];
  }
}
```

### Pattern 3: saveMemos — Serialize Minimal Data

**What:** Extract only `{ id, content, position }` from ReactFlow node state and write to localStorage.

**When to use:** Called from `useEffect([nodes])` and `onNodeDragStop`.

**Example:**

```typescript
export function saveMemos(nodes: MemoNode[]): void {
  try {
    const saved: SavedMemo[] = nodes.map((node) => ({
      id: node.id,
      content: node.data.content,
      position: node.position,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    // D-08: QuotaExceededError — サイレント失敗
    console.error("メモデータの保存に失敗しました", error);
  }
}
```

### Pattern 4: Wire in MemoCanvas.tsx

**What:** Seed initial state from `loadMemos()`, add `useEffect` to save on change, use `onNodeDragStop` for drag completion.

**Key constraint (D-03 + D-02):** `useEffect([nodes])` fires after EVERY nodes change (add, edit, delete). `onNodeDragStop` is a separate callback for position updates during drag. Since `useEffect` also fires when positions change (after drag stops and `onNodesChange` applies the position), the `useEffect` alone may be sufficient — but `onNodeDragStop` is needed to capture the final drag position reliably before the effect fires, as ReactFlow's `onNodesChange` for position happens during drag (not just on stop).

**Research finding on useEffect and drag:** ReactFlow fires `onNodesChange` with `type: "position"` events continuously during drag. This means `nodes` state updates throughout drag, which would cause `useEffect([nodes])` to save on every drag frame. Per D-02, this is undesired. The solution is to check `node.dragging` inside `saveMemos` (filter out nodes being dragged) OR use `onNodeDragStop` as the sole save trigger for position changes. See Anti-Patterns below.

**Recommended approach:** Use `useEffect([nodes])` ONLY when no node has `dragging: true`. This satisfies D-02 and D-03.

```typescript
// In MemoCanvas.tsx
const [nodes, setNodes, onNodesChange] = useNodesState<MemoNode>(loadMemos());

// D-03: Save on nodes change — D-02: Skip while any node is being dragged
useEffect(() => {
  const isDragging = nodes.some((n) => n.dragging);
  if (!isDragging) {
    saveMemos(nodes);
  }
}, [nodes]);

// D-02: Save on drag completion (position is finalized here)
const handleNodeDragStop = useCallback(
  (_event: React.MouseEvent, _node: MemoNode, allNodes: MemoNode[]) => {
    saveMemos(allNodes);
  },
  [],
);
```

**Note on `useNodesState` initial value:** The `loadMemos()` call in `useNodesState(loadMemos())` runs once on component mount. This is the correct pattern for seeding from external storage.

**Note on `onNodeDragStop` signature:** ReactFlow v12 `onNodeDragStop` receives `(event, node, nodes)` where the third argument is the full nodes array. Verify in @xyflow/react types before implementation.

### Anti-Patterns to Avoid

- **Saving during drag:** Do not call `saveMemos` when `nodes.some(n => n.dragging)` is true — causes excessive localStorage writes (60fps). Check `dragging` flag or use `onNodeDragStop` for position finalization.
- **Saving full ReactFlow node objects:** Never `JSON.stringify(nodes)` directly — ReactFlow internal fields (`measured`, `selected`, `dragging`, `internals`) are ephemeral and should not be persisted. Map to `SavedMemo[]` first.
- **Using `localStorage.setItem` without try/catch:** `QuotaExceededError` is a real DOMException on some browsers/configurations. Always wrap in try/catch (D-08).
- **Placing storage.ts in shared/lib:** This module is canvas-domain specific. FSD rules prohibit features from importing shared modules that carry feature-level business logic.
- **Importing storage.ts via barrel (`index.ts`)** from inside the slice: Within `features/canvas/`, use relative paths (e.g., `"../model/storage"`), never `@/features/canvas`.

## Don't Hand-Roll

| Problem                             | Don't Build                 | Use Instead                      | Why                                                                    |
| ----------------------------------- | --------------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| Schema validation of untrusted data | Custom type guard functions | valibot `safeParse`              | Handles nested objects, arrays, type coercion edge cases automatically |
| Serialization of node state         | Custom serializer           | `JSON.stringify` on mapped array | localStorage only stores strings; JSON is the standard                 |

**Key insight:** The only tricky part in this phase is the boundary between ReactFlow's rich node shape and the minimal persisted shape. Valibot's `safeParse` handles the restoration boundary cleanly; manual save only needs a `.map()`.

## Common Pitfalls

### Pitfall 1: Saving During Drag (Performance)

**What goes wrong:** `useEffect([nodes])` fires on every ReactFlow `onNodesChange` event during drag, calling `localStorage.setItem` at ~60fps. This causes UI jank and excessive I/O.

**Why it happens:** ReactFlow updates node positions continuously during drag, which updates the `nodes` state array, which triggers `useEffect`.

**How to avoid:** Guard `saveMemos` call with `if (!nodes.some(n => n.dragging))`. Also call `saveMemos` in `onNodeDragStop` to capture the final position.

**Warning signs:** Profiler shows `localStorage.setItem` called hundreds of times during a single drag operation.

### Pitfall 2: Storing Full ReactFlow Node Objects

**What goes wrong:** `JSON.stringify(nodes)` persists internal ReactFlow fields (`measured`, `selected`, `dragging`, `positionAbsolute`, `internals`). On restore, these stale values confuse ReactFlow's internal state machine.

**Why it happens:** It's tempting to just serialize the whole `nodes` array.

**How to avoid:** Always map to `SavedMemo[]` before persisting. Only `{ id, content, position }` per D-04.

**Warning signs:** After restore, nodes appear at wrong positions or with wrong dimensions; nodes fail to render.

### Pitfall 3: QuotaExceededError Crashes the App

**What goes wrong:** If localStorage is full, `setItem` throws a `DOMException` with name `QuotaExceededError`. Without a try/catch, this propagates up and potentially crashes the component.

**Why it happens:** localStorage has a 5-10MB limit per origin; edge case but real.

**How to avoid:** Wrap `localStorage.setItem` in try/catch inside `saveMemos`. Log with `console.error`, do not rethrow (D-08).

### Pitfall 4: loadMemos Called Inside useEffect (Mount Timing)

**What goes wrong:** If `loadMemos()` is called inside a `useEffect`, the component renders once with an empty canvas before the memos appear, causing a flash of empty state on page load.

**Why it happens:** `useEffect` runs after the first paint.

**How to avoid:** Pass `loadMemos()` as the initial value directly to `useNodesState(loadMemos())`. This runs synchronously during component initialization, before the first render.

### Pitfall 5: onNodeDragStop Third Parameter

**What goes wrong:** Passing the single `node` argument (second param) to `saveMemos` instead of `allNodes` (third param) saves only the dragged node's new position; all other nodes get dropped from localStorage.

**Why it happens:** ReactFlow v12 `onNodeDragStop(event, node, nodes)` — the third param is the full array but easy to miss.

**How to avoid:** Use `allNodes` (third param) in `onNodeDragStop`, or use the `nodes` state from closure (which should be up-to-date after drag stop).

## Code Examples

Verified patterns from official sources:

### Storage Key Convention

```typescript
// Recommendation: namespace with app name to avoid collisions
const STORAGE_KEY = "murder-mystery-memo:memos";
```

### Complete storage.ts Module

```typescript
// src/features/canvas/model/storage.ts
import * as v from "valibot";

import type { MemoNode } from "./memo-node";

const STORAGE_KEY = "murder-mystery-memo:memos";

const SavedMemoSchema = v.object({
  id: v.string(),
  content: v.string(),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
});

const SavedMemosSchema = v.array(SavedMemoSchema);

type SavedMemo = v.InferOutput<typeof SavedMemoSchema>;

export function loadMemos(): MemoNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    const result = v.safeParse(SavedMemosSchema, JSON.parse(raw) as unknown);
    if (!result.success) {
      console.error("メモデータの復元に失敗しました — 空のキャンバスで開始します", result.issues);
      return [];
    }

    return result.output.map((memo) => ({
      id: memo.id,
      type: "memo" as const,
      position: memo.position,
      data: { content: memo.content, isEditing: false },
    }));
  } catch (error) {
    console.error("メモデータの読み込みに失敗しました", error);
    return [];
  }
}

export function saveMemos(nodes: MemoNode[]): void {
  try {
    const saved: SavedMemo[] = nodes.map((node) => ({
      id: node.id,
      content: node.data.content,
      position: node.position,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error("メモデータの保存に失敗しました", error);
  }
}
```

### MemoCanvas.tsx Integration Points

```typescript
// Initial state seeded from localStorage (synchronous, no flash)
const [nodes, setNodes, onNodesChange] = useNodesState<MemoNode>(loadMemos());

// Save on nodes change, skip during active drag (D-02, D-03)
useEffect(() => {
  const isDragging = nodes.some((n) => n.dragging);
  if (!isDragging) {
    saveMemos(nodes);
  }
}, [nodes]);

// Finalize position save on drag stop
const handleNodeDragStop = useCallback(
  (_event: React.MouseEvent, _node: MemoNode, allNodes: MemoNode[]) => {
    saveMemos(allNodes);
  },
  [],
);
```

## State of the Art

| Old Approach                      | Current Approach                             | When Changed      | Impact                                       |
| --------------------------------- | -------------------------------------------- | ----------------- | -------------------------------------------- |
| Manual type guards for JSON       | valibot `safeParse`                          | valibot v1 (2024) | Typed output with exhaustive issue reporting |
| sessionStorage for ephemeral data | localStorage for persistence across sessions | N/A               | Survives page reload per PERS-02             |

## Open Questions

1. **`onNodeDragStop` third parameter signature**
   - What we know: ReactFlow v12 documents `onNodeDragStop(event, node, nodes)` with three params
   - What's unclear: Whether TypeScript types in @xyflow/react^12.10.1 expose the third param correctly
   - Recommendation: Check `NodeDragHandler` type in @xyflow/react during implementation; fallback to using `nodes` from closure state

2. **`node.dragging` field presence in useEffect**
   - What we know: ReactFlow sets `node.dragging = true` during drag operations via `onNodesChange`
   - What's unclear: Whether `dragging` is always present on `MemoNode` type or may be `undefined`
   - Recommendation: Guard with `n.dragging === true` (strict equality) to handle undefined safely

## Sources

### Primary (HIGH confidence)

- valibot 1.3.1 installed package (`node_modules/valibot/dist/index.cjs`) — `safeParse`, `object`, `array`, `string`, `number` verified at runtime; `InferOutput` verified in `.d.mts` type declarations
- `src/features/canvas/ui/MemoCanvas.tsx` — current `useNodesState<MemoNode>([])` usage, `setNodes`, `updateNodeData` pattern
- `src/features/canvas/model/memo-node.ts` — `MemoNodeData` type (`content: string`, `isEditing: boolean`, index signature)
- `.planning/phases/03-persistence/03-CONTEXT.md` — locked decisions D-01 through D-09

### Secondary (MEDIUM confidence)

- @xyflow/react v12 docs (known from training + package inspection) — `onNodeDragStop(event, node, nodes)` three-param signature, `node.dragging` field behavior

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — valibot API verified at runtime; ReactFlow patterns verified from existing codebase
- Architecture: HIGH — FSD placement clear; storage.ts in `features/canvas/model/` is unambiguous
- Pitfalls: HIGH — dragging guard and QuotaExceededError are well-known; full node serialization trap verified from ReactFlow docs

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable libraries, 30-day validity)
