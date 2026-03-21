# Phase 2: Memo Interaction - Research

**Researched:** 2026-03-21
**Domain:** @xyflow/react v12 custom nodes, controlled state management, keyboard event handling
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**メモカードの表示**

- D-01: 固定幅のカードレイアウト（付箋スタイル）— 統一感を重視
- D-02: 表示モードでは全文表示（高さ制限なし）— 内容が長ければカードが縦に伸びる
- D-03: 空メモ（内容なし）も残す — プレースホルダー的な表示で空カードとして存在
- D-04: Phase 2 のスタイルは最低限（白背景・黒テキスト・ボーダー程度）— Phase 4 でノワール調に仕上げる

**編集体験**

- D-05: テキストエリアは入力行数に応じて自動リサイズ（スクロールバーなし）
- D-06: プレースホルダーテキストあり（空のテキストエリアにヒント表示）
- D-07: 編集中と表示モードの視覚的区別は最低限 — テキストエリアの存在自体が区別になる
- D-08: 編集中はドラッグ無効 — テキスト選択・カーソル操作に専念

**新規メモ作成**

- D-09: ダブルクリック位置がメモの中心になるよう配置
- D-10: 作成時のアニメーションなし — 即座に表示、ゲーム中のテンポを妨げない
- D-11: 同じ場所に連続作成した場合は少しオフセットして配置 — 重なりを自動回避

**キーボード操作（既決事項）**

- D-12: Enter で改行、Shift+Enter で編集確定、Escape で編集キャンセル（新規メモの場合は破棄しない — 空メモとして残る）
- D-13: `deleteKeyCode={null}` でDelete/Backspaceキーの競合を回避
- D-14: テキストエリアでのキーイベントは `stopPropagation` でReactFlowへの伝播を防止

### Claude's Discretion

- メモカードの具体的な固定幅の値
- ID生成方法
- 状態管理アプローチ（useNodesState / Zustand等）
- テキストエリア自動リサイズの実装方法
- プレースホルダーの具体的な文言
- オフセット量とオフセット方向のロジック

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                    | Research Support                                                                                                                                                                     |
| ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MEMO-01 | キャンバス上をダブルクリックしてメモを追加できる               | `onDoubleClick` on `<ReactFlow>` (HTMLAttributes passthrough), filter by `.react-flow__pane` target class, convert to flow position via `screenToFlowPosition` from `useReactFlow()` |
| MEMO-02 | メモ生成と同時に編集状態になりテキスト入力にフォーカスが当たる | Set `isEditing: true` in node data on create; `useEffect` in MemoNode auto-focuses textarea ref when `isEditing` becomes true                                                        |
| MEMO-03 | Enter で改行できる                                             | Default textarea behavior — no custom handling needed (just don't suppress Enter)                                                                                                    |
| MEMO-04 | Shift+Enter で編集確定できる                                   | `onKeyDown` handler: `if (e.shiftKey && e.key === "Enter") { e.preventDefault(); commitEdit(); }`                                                                                    |
| MEMO-05 | Escape で編集をキャンセルできる（新規メモは破棄）              | `onKeyDown` handler: `if (e.key === "Escape") { cancelEdit(); }` — D-12 says new memos are NOT discarded on Escape, they remain as empty memos                                       |
| MEMO-06 | 既存メモをダブルクリックして再編集できる                       | `onNodeDoubleClick` on `<ReactFlow>` prop — sets `isEditing: true` via `updateNodeData` from `useReactFlow()`                                                                        |
| MEMO-07 | メモ外をクリックして編集を確定できる                           | `onBlur` on the textarea element inside MemoNode; alternatively `onPaneClick` on `<ReactFlow>`                                                                                       |
| MEMO-08 | メモをドラッグで自由移動できる                                 | `onNodesChange` handler wired to `<ReactFlow>` (default drag behavior); disable dragging when `isEditing: true` by setting `node.draggable = false` dynamically                      |

</phase_requirements>

## Summary

Phase 2 adds the core memo interaction layer on top of the Phase 1 canvas. The work centers on two concerns: (1) a `MemoNode` custom node component with local+shared edit state, and (2) canvas-level event handlers in `MemoCanvas.tsx` that create/reposition memos.

The @xyflow/react v12.10.1 API (already installed) provides everything needed. `ReactFlowProps` extends `HTMLAttributes<HTMLDivElement>`, so `onDoubleClick` can be passed directly to `<ReactFlow>`. The pane background renders with class `.react-flow__pane`, making it straightforward to filter background vs. node double-clicks. State management stays within `useNodesState` (built-in hook) — no additional library is needed for this phase since Phase 3 persistence will likely introduce a store abstraction.

The one confirmed gap is that ReactFlow has no `onPaneDoubleClick` prop (unlike `onPaneClick`). The correct approach is to use the native `onDoubleClick` on `<ReactFlow>` and check `event.target` for the `.react-flow__pane` class, or to use a wrapper `<div>` approach.

**Primary recommendation:** Use `useNodesState` for controlled node state in `MemoCanvas`, store edit state in `node.data.isEditing` (updated via `useReactFlow().updateNodeData`), and implement `MemoNode` as a pure component that reads from `data`.

## Standard Stack

### Core

| Library       | Version             | Purpose                             | Why Standard                        |
| ------------- | ------------------- | ----------------------------------- | ----------------------------------- |
| @xyflow/react | 12.10.1 (installed) | Canvas, node drag, state primitives | Project-mandated, already installed |
| React         | 19.2.4 (installed)  | Component model, hooks              | Project standard                    |
| Tailwind CSS  | 4.2.2 (installed)   | Styling MemoNode                    | Project standard                    |

### Supporting

| Library           | Version                                      | Purpose                  | When to Use                        |
| ----------------- | -------------------------------------------- | ------------------------ | ---------------------------------- |
| nanoid            | 3.3.11 (transitive dep, NOT in package.json) | Unique IDs for new memos | Only if added as direct dep        |
| crypto.randomUUID | Browser built-in                             | Unique IDs for new memos | Preferred — zero-dependency option |

### Alternatives Considered

| Instead of            | Could Use     | Tradeoff                                                                                                                                           |
| --------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useNodesState`       | Zustand store | Zustand is NOT in package.json (only transitive); `useNodesState` is sufficient for Phase 2; Phase 3 (persistence) may warrant introducing a store |
| `crypto.randomUUID()` | nanoid        | nanoid is only a transitive dep; `crypto.randomUUID()` is available in all modern browsers and needs no import                                     |

**Installation (no new packages required):**

All needed APIs are available from already-installed dependencies. Do NOT add zustand or nanoid as direct dependencies in this phase.

## Architecture Patterns

### Recommended Project Structure

```
src/features/canvas/
├── model/
│   ├── node-types.ts     # Register MemoNode here (exists, currently empty)
│   ├── memo-node.ts      # MemoNode type definition (Node<MemoNodeData, "memo">)
│   └── use-memo-store.ts # useNodesState wrapper + memo creation logic
├── ui/
│   ├── MemoCanvas.tsx    # Wire onDoubleClick, onNodesChange, deleteKeyCode={null}
│   └── MemoNode.tsx      # Custom node: display/edit modes, keyboard handling
└── index.ts              # Public API (already exists)
```

### Pattern 1: Custom Node Type Definition

**What:** Define a typed `MemoNode` extending `Node` with typed `data`.
**When to use:** Any time you need strongly-typed data in a custom node.
**Example:**

```typescript
// src/features/canvas/model/memo-node.ts
import type { Node } from "@xyflow/react";

export type MemoNodeData = {
  content: string;
  isEditing: boolean;
};

export type MemoNode = Node<MemoNodeData, "memo">;
```

### Pattern 2: useNodesState Controlled Flow

**What:** `useNodesState` returns `[nodes, setNodes, onNodesChange]`. Pass all three to `<ReactFlow>`.
**When to use:** Every controlled ReactFlow implementation.
**Example:**

```typescript
// src/features/canvas/ui/MemoCanvas.tsx
import { ReactFlow, useNodesState } from "@xyflow/react";
import { NODE_TYPES } from "../model/node-types";
import type { MemoNode } from "../model/memo-node";

export const MemoCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<MemoNode>([]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={[]}
      nodeTypes={NODE_TYPES}
      onNodesChange={onNodesChange}
      deleteKeyCode={null}
      zoomOnDoubleClick={false}
      onDoubleClick={handlePaneDoubleClick}
      onNodeDoubleClick={handleNodeDoubleClick}
    />
  );
};
```

### Pattern 3: Canvas Double-Click Creates Memo at Cursor Position

**What:** Attach `onDoubleClick` to `<ReactFlow>` (which wraps the outer div). Filter for pane class. Convert screen coords to flow coords via `screenToFlowPosition`.
**When to use:** Creating new nodes at click position.
**Example:**

```typescript
// Inside MemoCanvas — requires ReactFlowProvider wrapping (already in CanvasPage)
import { useReactFlow } from "@xyflow/react";

const { screenToFlowPosition } = useReactFlow();

const handleDoubleClick = (event: React.MouseEvent) => {
  // Only fire when clicking on the pane background, not on nodes
  const target = event.target as HTMLElement;
  if (!target.classList.contains("react-flow__pane")) return;

  const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
  // Offset so double-click position is at card center (subtract half card width/height)
  const newNode: MemoNode = {
    id: crypto.randomUUID(),
    type: "memo",
    position: { x: position.x - CARD_HALF_WIDTH, y: position.y - CARD_HALF_HEIGHT },
    data: { content: "", isEditing: true },
  };
  setNodes((nodes) => [...nodes, newNode]);
};
```

### Pattern 4: MemoNode Edit/Display Toggle

**What:** MemoNode reads `data.isEditing` to switch between a `<textarea>` (edit) and a `<p>` (display). Edit state is stored in node data, not local component state, so ReactFlow controls it.
**When to use:** Whenever node appearance depends on edit state that other handlers need to query.
**Example:**

```typescript
// src/features/canvas/ui/MemoNode.tsx
import { useCallback, useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { MemoNode } from "../model/memo-node";

export const MemoNode = ({ id, data }: NodeProps<MemoNode>) => {
  const { updateNodeData } = useReactFlow<MemoNode>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (data.isEditing) {
      textareaRef.current?.focus();
    }
  }, [data.isEditing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation(); // D-14: prevent ReactFlow from receiving key events

      if (e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        updateNodeData(id, { isEditing: false });
      } else if (e.key === "Escape") {
        updateNodeData(id, { isEditing: false }); // D-12: keep empty memo
      }
    },
    [id, updateNodeData],
  );

  const handleBlur = useCallback(() => {
    updateNodeData(id, { isEditing: false }); // MEMO-07: blur = confirm
  }, [id, updateNodeData]);

  if (data.isEditing) {
    return (
      <div className="nodrag w-48 rounded border border-black bg-white p-2">
        <textarea
          ref={textareaRef}
          value={data.content}
          placeholder="メモを入力..."
          className="w-full resize-none overflow-hidden bg-transparent text-black outline-none"
          onChange={(e) => updateNodeData(id, { content: e.target.value })}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          rows={1}
        />
      </div>
    );
  }

  return (
    <div className="w-48 rounded border border-black bg-white p-2">
      <p className="whitespace-pre-wrap text-black">{data.content || " "}</p>
    </div>
  );
};
```

### Pattern 5: Disable Drag While Editing

**What:** When `data.isEditing` is true, add class `nodrag` to the wrapper div so ReactFlow skips drag handling. This is more reliable than toggling `node.draggable` on the data object because it avoids needing a `setNodes` call on every edit toggle.
**When to use:** D-08 requirement — editing and dragging must not conflict.
**Note:** The alternative approach is to set `draggable: false` on the node object in state when editing. Either works; the `nodrag` class approach avoids extra `setNodes` calls.

### Pattern 6: Auto-Resize Textarea

**What:** Use a `useEffect` that sets `textarea.style.height = 'auto'` then `textarea.style.height = textarea.scrollHeight + 'px'` on every content change.
**When to use:** D-05 — no scrollbar, grows with content.
**Example:**

```typescript
// Inside MemoNode
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }
}, [data.content]);
```

### Pattern 7: Node Double-Click to Re-Enter Edit

**What:** `onNodeDoubleClick` on `<ReactFlow>` fires when any node is double-clicked. Use `updateNodeData` to set `isEditing: true`.
**When to use:** MEMO-06.
**Example:**

```typescript
const handleNodeDoubleClick = useCallback(
  (_: React.MouseEvent, node: MemoNode) => {
    updateNodeData(node.id, { isEditing: true });
  },
  [updateNodeData],
);
```

### Pattern 8: NODE_TYPES Registration

**What:** NODE_TYPES must be a module-scope constant (already established in Phase 1).
**When to use:** Add `MemoNode` to the existing constant.
**Example:**

```typescript
// src/features/canvas/model/node-types.ts
import type { NodeTypes } from "@xyflow/react";
import { MemoNode } from "../ui/MemoNode";

export const NODE_TYPES = {
  memo: MemoNode,
} satisfies NodeTypes;
```

### Anti-Patterns to Avoid

- **Inline NODE_TYPES object:** Defining `nodeTypes={{ memo: MemoNode }}` inline causes node re-mount on every render. Always use a module-scope constant (established in Phase 1, D-66).
- **Local `isEditing` state in MemoNode:** Storing edit state in `useState` inside MemoNode means external handlers (like `onNodeDoubleClick` in MemoCanvas) cannot set it. Store in `node.data.isEditing` and access via `useReactFlow().updateNodeData`.
- **Using `onPaneDoubleClick` prop:** This prop does NOT exist in @xyflow/react v12. Use `onDoubleClick` (via HTML attributes passthrough) and filter by `event.target.classList.contains("react-flow__pane")`.
- **Forgetting `zoomOnDoubleClick={false}`:** Without this, double-clicking the canvas will BOTH create a memo AND zoom in. Always set this to `false` when using canvas double-click for node creation.
- **Forgetting `deleteKeyCode={null}`:** Without this, pressing Delete/Backspace while a textarea is focused will delete the selected node instead of the character. This is D-13.
- **Not calling `stopPropagation` on textarea keydown:** Without this, arrow keys and backspace in the textarea bubble to ReactFlow and can trigger viewport pan or node deletion. This is D-14.
- **Using nanoid without adding it to package.json:** nanoid is a transitive dep via @xyflow/react. Do not rely on transitive deps. Use `crypto.randomUUID()` instead.

## Don't Hand-Roll

| Problem                                | Don't Build                           | Use Instead                                               | Why                                                |
| -------------------------------------- | ------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| Node drag repositioning                | Custom mouse event tracking           | `onNodesChange` + `useNodesState`                         | ReactFlow handles drag, snap, bounds automatically |
| Screen-to-canvas coordinate conversion | Manual viewport transform math        | `useReactFlow().screenToFlowPosition()`                   | Accounts for zoom, pan, viewport offset            |
| Node state updates                     | Direct array mutation or index lookup | `useReactFlow().updateNodeData()`                         | Type-safe, triggers correct re-render cycle        |
| Textarea auto-grow                     | ResizeObserver or custom measurement  | CSS `field-sizing: content` or the `scrollHeight` pattern | One-liner; no library needed                       |

**Key insight:** ReactFlow v12 has a rich instance API (`useReactFlow()`) that handles coordinate math, state updates, and drag. Manually re-implementing any of these creates subtle bugs with zoom/pan interactions.

## Common Pitfalls

### Pitfall 1: zoomOnDoubleClick Not Disabled

**What goes wrong:** Double-clicking the canvas creates a memo AND zooms in simultaneously, jarring UX.
**Why it happens:** `zoomOnDoubleClick` defaults to `true` in ReactFlow.
**How to avoid:** Always set `zoomOnDoubleClick={false}` when using `onDoubleClick` for memo creation.
**Warning signs:** Viewport jumps on canvas double-click.

### Pitfall 2: deleteKeyCode Not Nullified

**What goes wrong:** Pressing Backspace while typing in a memo textarea deletes the node instead of the character.
**Why it happens:** ReactFlow's default `deleteKeyCode` is `"Backspace"`. Key events bubble from textarea to ReactFlow.
**How to avoid:** Set `deleteKeyCode={null}` on `<ReactFlow>`. Also add `e.stopPropagation()` in textarea `onKeyDown` (D-14).
**Warning signs:** Memo disappears when pressing Backspace during text input.

### Pitfall 3: Edit State in Local Component State

**What goes wrong:** `onNodeDoubleClick` in MemoCanvas cannot trigger edit mode because the state lives in MemoNode's local `useState`.
**Why it happens:** ReactFlow renders nodes in isolation; parent handlers can't call child setters.
**How to avoid:** Store `isEditing` in `node.data.isEditing`. Use `updateNodeData(id, { isEditing: true })` from both MemoNode (self-trigger on double-click) and MemoCanvas (external trigger).
**Warning signs:** Double-clicking a node from MemoCanvas has no visible effect.

### Pitfall 4: Missing `nodrag` Class on Editing Wrapper

**What goes wrong:** While typing in the textarea, accidentally dragging selects text AND moves the node simultaneously.
**Why it happens:** ReactFlow treats any mousedown on the node as a potential drag start.
**How to avoid:** Add `nodrag` class to the wrapper div when `data.isEditing` is true (D-08). The default `noDragClassName` is `"nodrag"`.
**Warning signs:** Node moves while user tries to select text in the textarea.

### Pitfall 5: onDoubleClick Target Filtering

**What goes wrong:** Double-clicking a node triggers BOTH the node's `onNodeDoubleClick` AND the canvas `onDoubleClick`, creating a duplicate memo.
**Why it happens:** Events bubble from node up through ReactFlow wrapper div.
**How to avoid:** In the canvas `onDoubleClick` handler, check `event.target.classList.contains("react-flow__pane")` before creating a memo. If the click originated on a node, the target will NOT have this class.
**Warning signs:** Double-clicking an existing memo creates a new memo under it.

### Pitfall 6: useReactFlow Called Outside ReactFlowProvider

**What goes wrong:** `useReactFlow()` throws "Seems like you have not used zustand outside of the context of a ReactFlow component".
**Why it happens:** `useReactFlow` requires `ReactFlowProvider` in an ancestor.
**How to avoid:** `ReactFlowProvider` is already in `CanvasPage` (Phase 1 D-12). Any hook call inside `MemoCanvas` or `MemoNode` is safe. Do not move provider logic.
**Warning signs:** Error on first render of MemoCanvas.

### Pitfall 7: Overlap Detection on Consecutive Creation

**What goes wrong:** Two memos created at nearly the same spot are perfectly overlapped and visually appear as one memo.
**Why it happens:** D-11 requires slight offset for consecutive same-position creation.
**How to avoid:** Compare the new position against the last created memo's position. If within a threshold (e.g. 10px), add a small offset (e.g. +16px on both axes).
**Warning signs:** User creates two memos at the same spot; only one appears to exist.

## Code Examples

Verified patterns from official sources:

### useNodesState Signature (from installed package types)

```typescript
// node_modules/@xyflow/react/dist/esm/hooks/useNodesEdgesState.d.ts
declare function useNodesState<NodeType extends Node>(
  initialNodes: NodeType[],
): [NodeType[], Dispatch<SetStateAction<NodeType[]>>, (changes: NodeChange<NodeType>[]) => void];
```

### screenToFlowPosition Signature (from installed package types)

```typescript
// node_modules/@xyflow/react/dist/esm/types/general.d.ts
screenToFlowPosition: (clientPosition: XYPosition, options?: { snapToGrid: boolean }) => XYPosition;
```

### updateNodeData Signature (from installed package types)

```typescript
// node_modules/@xyflow/react/dist/esm/types/instance.d.ts
updateNodeData: (
  id: string,
  dataUpdate:
    | Partial<NodeType["data"]>
    | ((node: NodeType) => Partial<NodeType["data"]>),
  options?: { replace: boolean },
) => void;
```

### ReactFlowProps Extends HTMLAttributes

```typescript
// node_modules/@xyflow/react/dist/esm/types/component-props.d.ts
export interface ReactFlowProps<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
> extends Omit<HTMLAttributes<HTMLDivElement>, "onError"> {
  // ... all ReactFlow-specific props
  deleteKeyCode?: KeyCode | null;
  zoomOnDoubleClick?: boolean;
  onNodeDoubleClick?: NodeMouseHandler<NodeType>;
  onPaneClick?: (event: ReactMouseEvent) => void;
  // onDoubleClick comes from HTMLAttributes<HTMLDivElement>
}
```

### NodeBase.draggable Property (from installed package types)

```typescript
// node_modules/@xyflow/system/dist/esm/types/nodes.d.ts
type NodeBase = {
  draggable?: boolean; // per-node dragging control
  // ...
};
```

### Pane Class Name (verified from source)

The pane background element uses CSS class `react-flow__pane`. Verified in:
`node_modules/@xyflow/react/dist/esm/index.js` — the Pane component renders with `className: cc(['react-flow__pane', ...])`.

## State of the Art

| Old Approach                                     | Current Approach                                 | When Changed             | Impact                                                       |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------ | ------------------------------------------------------------ |
| `react-flow-renderer` package                    | `@xyflow/react` v12                              | 2023 (v11 → v12 rewrite) | New API; old tutorials on `react-flow-renderer` are obsolete |
| `useNodesState` with `applyNodeChanges` manually | `useNodesState` returns `onNodesChange` directly | v11+                     | `onNodesChange` can be passed directly to prop               |
| `project()` for coord transform                  | `screenToFlowPosition()`                         | v11                      | `project()` is removed; use `screenToFlowPosition()`         |

**Deprecated/outdated:**

- `project()`: Replaced by `screenToFlowPosition()` from `useReactFlow()` in v11+. Many blog posts use `project()` — this does not exist in v12.
- `onPaneDoubleClick`: This prop never existed. Use `onDoubleClick` (HTML passthrough) with target filtering.

## Open Questions

1. **Offset threshold for D-11 (consecutive same-position memo)**
   - What we know: D-11 requires a "small offset" for consecutive creation at same spot
   - What's unclear: Exact threshold (px distance to trigger) and offset amount
   - Recommendation: Use 20px proximity threshold and +20px x/y offset. Simple, sufficient for use case.

2. **Auto-resize textarea CSS approach**
   - What we know: D-05 requires auto-resize with no scrollbar
   - What's unclear: Whether `field-sizing: content` CSS (modern, no JS) is supported widely enough
   - Recommendation: Use the `scrollHeight` JavaScript approach (always works) — `field-sizing: content` is a newer CSS property not yet in all Tailwind versions.

3. **MemoNode card fixed width value (Claude's Discretion)**
   - What we know: D-01 says fixed-width card
   - Recommendation: Use `w-48` (192px) — large enough for typical game notes, narrow enough for multiple memos on screen.

## Sources

### Primary (HIGH confidence)

- Installed package types: `node_modules/@xyflow/react/dist/esm/types/` — verified all API signatures
- Installed package source: `node_modules/@xyflow/react/dist/esm/index.js` — verified pane class name, `screenToFlowPosition` implementation
- Installed package types: `node_modules/@xyflow/system/dist/esm/types/nodes.d.ts` — verified `NodeBase.draggable`, `NodeProps` shape
- `package.json` — verified no zustand/nanoid direct dep, @xyflow/react version
- Phase 1 codebase: `src/features/canvas/` — verified current file structure, MemoCanvas.tsx, node-types.ts

### Secondary (MEDIUM confidence)

- CONTEXT.md decisions D-01 through D-14 — locked design decisions from user discussion
- STATE.md Blockers/Concerns — confirmed `deleteKeyCode={null}` and `stopPropagation` requirements
- PROJECT.md — confirmed `Memo` type structure and color palette

### Tertiary (LOW confidence)

- None — all findings verified against installed package source

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — verified against installed package.json and node_modules
- Architecture: HIGH — verified against actual installed API types and existing codebase structure
- Pitfalls: HIGH — verified against installed source code (e.g., pane class name, `deleteKeyCode` prop, missing `onPaneDoubleClick`)

**Research date:** 2026-03-21
**Valid until:** 2026-09-21 (stable — @xyflow/react v12 is a major version, minor API changes unlikely)
