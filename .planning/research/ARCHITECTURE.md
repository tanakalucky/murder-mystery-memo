# Architecture Research

**Domain:** Canvas-based memo app — @xyflow/react integrated with Feature-Sliced Design
**Researched:** 2026-03-21
**Confidence:** HIGH (existing codebase + FSD rules directly readable; @xyflow/react patterns based on library design)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ app/                                                            │
│   StrictMode → ErrorBoundary → ReactFlowProvider → Routes      │
├─────────────────────────────────────────────────────────────────┤
│ pages/                                                          │
│   ┌────────────────────────────────────────────────────┐       │
│   │ CanvasPage  (full-viewport container)              │       │
│   │   <ReactFlow>                                      │       │
│   │     nodeTypes={ memo: MemoNode }                   │       │
│   │     nodes={nodes}  onNodesChange={onNodesChange}   │       │
│   │     onDoubleClick={handleAddMemo}                  │       │
│   │   </ReactFlow>                                     │       │
│   │   <CanvasToolbar />   (reset button)               │       │
│   └────────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│ features/                                                       │
│   ┌──────────────────────┐  ┌─────────────────────────┐        │
│   │ memo-canvas          │  │ memo-reset              │        │
│   │  ui/ MemoNode.tsx    │  │  ui/ ResetButton.tsx    │        │
│   │  model/ useMemoStore │  │  model/ useResetMemo    │        │
│   └──────────────────────┘  └─────────────────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│ entities/                                                       │
│   ┌──────────────────────────────────┐                         │
│   │ memo                             │                         │
│   │  model/ types.ts  (Memo type)    │                         │
│   └──────────────────────────────────┘                         │
├─────────────────────────────────────────────────────────────────┤
│ shared/                                                         │
│   ┌────────────┐  ┌────────────┐  ┌────────────────────────┐   │
│   │ lib/       │  │ ui/        │  │ config/                │   │
│   │ storage.ts │  │ Dialog/    │  │ canvas-defaults.ts     │   │
│   │ memo-id.ts │  │ Button/    │  │ (nodeTypes registry,   │   │
│   └────────────┘  └────────────┘  │  default viewport)     │   │
│                                   └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component                            | Responsibility                                    | Typical Implementation                              |
| ------------------------------------ | ------------------------------------------------- | --------------------------------------------------- |
| `ReactFlow` (app-level provider)     | Canvas engine, pan/zoom, node rendering, drag     | `<ReactFlow>` with `ReactFlowProvider` wrapping app |
| `CanvasPage` (pages layer)           | Full-viewport layout, mount point for canvas      | `pages/canvas/ui/CanvasPage.tsx`                    |
| `MemoNode` (features layer)          | Custom node: display, inline editing, keyboard UX | `features/memo-canvas/ui/MemoNode.tsx`              |
| `useMemoStore` (features model)      | Node state, add/update/delete, localStorage sync  | Custom hook using `useNodesState` from xyflow       |
| `ResetButton` (features layer)       | Confirmation dialog + wipe all memos              | `features/memo-reset/ui/ResetButton.tsx`            |
| `Memo` entity type (entities layer)  | Pure data shape: id, content, position            | `entities/memo/model/types.ts`                      |
| `storage` (shared/lib)               | Serialize/deserialize Memo[] to localStorage      | `shared/lib/storage.ts`                             |
| `nodeTypes` registry (shared/config) | Map `"memo"` string to `MemoNode` component       | `shared/config/canvas-defaults.ts`                  |

## Recommended Project Structure

```
src/
├── app/
│   ├── providers/
│   │   ├── ErrorBoundary/
│   │   └── index.ts          # compose providers incl. ReactFlowProvider
│   ├── routes/
│   │   └── routes.tsx        # single route → CanvasPage
│   ├── styles/
│   │   └── index.css         # Tailwind + custom CSS vars for noir palette
│   └── index.tsx             # entry: StrictMode + providers
│
├── pages/
│   └── canvas/
│       ├── ui/
│       │   └── CanvasPage.tsx # full-viewport ReactFlow mount
│       └── index.ts
│
├── features/
│   ├── memo-canvas/           # primary feature: add/edit/drag memos
│   │   ├── ui/
│   │   │   └── MemoNode.tsx   # custom ReactFlow node (editing, styling)
│   │   ├── model/
│   │   │   └── useMemoStore.ts # nodes state + localStorage persistence
│   │   └── index.ts
│   └── memo-reset/            # secondary feature: reset all memos
│       ├── ui/
│       │   └── ResetButton.tsx # confirmation dialog + reset action
│       ├── model/
│       │   └── useResetMemo.ts
│       └── index.ts
│
├── entities/
│   └── memo/
│       ├── model/
│       │   └── types.ts       # Memo type; Node<MemoData> extension
│       └── index.ts
│
└── shared/
    ├── lib/
    │   ├── storage.ts         # localStorage read/write helpers
    │   └── memo-id.ts         # crypto.randomUUID() wrapper
    ├── config/
    │   └── canvas-defaults.ts # nodeTypes map, defaultViewport
    └── ui/
        ├── Button/
        └── Dialog/            # shadcn/ui confirmation dialog
```

### Structure Rationale

- **entities/memo/**: Pure `Memo` type lives here; features and pages depend on it but not vice versa. Keeps data shape separate from behaviour.
- **features/memo-canvas/**: Owns all canvas interaction — adding nodes on double-click, inline editing, drag position updates. This is the largest feature slice.
- **features/memo-reset/**: Deliberately separate from memo-canvas; it has its own UI (confirmation dialog) and mutates the full memo list at once. Keeping it separate avoids memo-canvas growing too large and keeps reset testable in isolation.
- **shared/config/canvas-defaults.ts**: `nodeTypes` must be defined outside the component that renders `<ReactFlow>` and must be stable across renders (object reference must not change). A shared constant is the correct home.
- **shared/lib/storage.ts**: localStorage logic is reused by `useMemoStore` (load on mount, save on change). Putting it in shared prevents duplication if a second feature ever needs persistence.
- **app/providers/**: `ReactFlowProvider` is wrapped here alongside `ErrorBoundary`. ReactFlowProvider is required if `useReactFlow()` hooks are needed outside the `<ReactFlow>` component itself — a common need for features that trigger pan/zoom or programmatic node changes.

## Architectural Patterns

### Pattern 1: Stable `nodeTypes` Registry

**What:** Define the custom node type map as a constant outside any component — never inline it as a prop expression like `nodeTypes={{ memo: MemoNode }}` inside JSX.
**When to use:** Always with @xyflow/react custom nodes.
**Trade-offs:** Required by xyflow to prevent unnecessary remounts. Defining it in `shared/config` keeps it importable by both `CanvasPage` and tests.

**Example:**

```typescript
// shared/config/canvas-defaults.ts
import type { NodeTypes } from "@xyflow/react";
import { MemoNode } from "@/features/memo-canvas";

export const nodeTypes: NodeTypes = {
  memo: MemoNode,
};

// pages/canvas/ui/CanvasPage.tsx
import { nodeTypes } from "@/shared/config/canvas-defaults";

<ReactFlow nodeTypes={nodeTypes} ... />
```

### Pattern 2: `useNodesState` as the Single Source of Truth

**What:** Use xyflow's `useNodesState` hook inside `useMemoStore` to manage nodes. Sync to localStorage on every `nodes` change via `useEffect`. Load from localStorage as the initial state.
**When to use:** For this app's simple single-source persistence model.
**Trade-offs:** `useNodesState` handles drag position updates automatically via `onNodesChange` — this eliminates manual position tracking. The hook lives in `features/memo-canvas/model/` and is the only place that reads/writes localStorage for memos.

**Example:**

```typescript
// features/memo-canvas/model/useMemoStore.ts
import { useNodesState } from "@xyflow/react";
import { loadMemos, saveMemos } from "@/shared/lib/storage";
import type { MemoNode } from "@/entities/memo";

export function useMemoStore() {
  const [nodes, setNodes, onNodesChange] = useNodesState<MemoNode>(loadMemos());

  useEffect(() => {
    saveMemos(nodes);
  }, [nodes]);

  const addMemo = useCallback(
    (position: { x: number; y: number }) => {
      const newNode: MemoNode = {
        id: crypto.randomUUID(),
        type: "memo",
        position,
        data: { content: "" },
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [setNodes],
  );

  return { nodes, onNodesChange, addMemo };
}
```

### Pattern 3: Custom Node as Self-Contained Edit Widget

**What:** `MemoNode` receives `data` and `selected` props from xyflow. Local `isEditing` state controls textarea visibility. Double-click enters edit mode; Shift+Enter or blur commits; Escape cancels.
**When to use:** When the node must support both read mode (styled memo card) and write mode (textarea) without external edit state.
**Trade-offs:** Edit state stays local to the node — simpler than lifting it to the store. Node must call `updateNodeData` from `useReactFlow()` to persist content changes back to the nodes state.

**Example:**

```typescript
// features/memo-canvas/ui/MemoNode.tsx
import { useReactFlow } from "@xyflow/react";

export function MemoNode({ id, data }: NodeProps<MemoNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(data.content);
  const { updateNodeData } = useReactFlow();

  const commitEdit = () => {
    updateNodeData(id, { content: draft });
    setIsEditing(false);
  };

  return (
    <div onDoubleClick={() => setIsEditing(true)}>
      {isEditing
        ? <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.shiftKey && e.key === "Enter") commitEdit(); }}
            onBlur={commitEdit} />
        : <p>{data.content}</p>
      }
    </div>
  );
}
```

## Data Flow

### Request Flow

```
User double-clicks canvas background
    ↓
CanvasPage.onDoubleClick → computes position via screenToFlowPosition()
    ↓
useMemoStore.addMemo(position) → setNodes([...prev, newNode])
    ↓
useEffect [nodes] → saveMemos(nodes) → localStorage.setItem(...)
    ↓
ReactFlow re-renders MemoNode at position (isEditing = true on new node)
```

```
User drags MemoNode to new position
    ↓
ReactFlow fires onNodesChange with position delta
    ↓
onNodesChange (from useNodesState) applies change → updates nodes state
    ↓
useEffect [nodes] → saveMemos(nodes) → localStorage.setItem(...)
```

```
User edits MemoNode content (double-click → type → Shift+Enter)
    ↓
MemoNode local state: isEditing=true, draft updated
    ↓
On commit: updateNodeData(id, { content: draft })
    ↓
xyflow triggers onNodesChange → nodes state updated
    ↓
useEffect [nodes] → saveMemos(nodes) → localStorage.setItem(...)
```

```
App initializes
    ↓
useMemoStore calls loadMemos() → localStorage.getItem(STORAGE_KEY) → JSON.parse
    ↓
useNodesState(initialNodes) seeded with persisted nodes
    ↓
ReactFlow renders existing memos at saved positions
```

### State Management

```
localStorage (persisted)
    ↓ (loadMemos on mount)
useNodesState [nodes] ← setNodes, onNodesChange
    ↓ (subscribe via useEffect)
saveMemos(nodes) → localStorage
    ↑
updateNodeData(id, data)   ← MemoNode content commit
addMemo(position)          ← CanvasPage double-click
resetMemos()               ← ResetButton confirmation
```

### Key Data Flows

1. **Add memo:** Canvas double-click → `screenToFlowPosition` converts screen coords → `addMemo` appends node → `useEffect` saves.
2. **Edit memo content:** MemoNode local draft → `updateNodeData` on commit → xyflow state update → `useEffect` saves.
3. **Drag memo:** xyflow's built-in drag → `onNodesChange` position delta → `useEffect` saves.
4. **Reset all:** `useResetMemo.reset()` calls `setNodes([])` → `useEffect` saves empty array.
5. **Restore on load:** `loadMemos()` reads localStorage on first render, seeds `useNodesState`.

## Scaling Considerations

| Scale                            | Architecture Adjustments                                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single user, browser-only        | Current localStorage model is the correct fit. No changes needed.                                                                                              |
| Multi-tab support (same browser) | Add `storage` event listener in `useMemoStore` to sync across tabs. One-day addition.                                                                          |
| Persistent cloud sync (future)   | Replace `shared/lib/storage.ts` with API client; swap `useEffect` sink to mutation call. FSD boundaries make this swap surgical — only `useMemoStore` changes. |
| Many memos (200+)                | xyflow handles this without concern. Performance issue would be localStorage serialization; could debounce `saveMemos`.                                        |

### Scaling Priorities

1. **First bottleneck:** None for this scope. localStorage + xyflow handles all requirements with no scaling concern.
2. **If scope expands to multi-user:** The `entities/memo/model/types.ts` type and `shared/lib/storage.ts` interface are the isolation points. Swap storage without touching feature layer UI.

## Anti-Patterns

### Anti-Pattern 1: Inline `nodeTypes` in JSX

**What people do:** `<ReactFlow nodeTypes={{ memo: MemoNode }} />`
**Why it's wrong:** Creates a new object on every render, causing xyflow to remount all custom nodes — visible as flicker, lost edit state, broken performance.
**Do this instead:** Define `nodeTypes` as a module-level constant in `shared/config/canvas-defaults.ts` and import it.

### Anti-Pattern 2: Managing Memo State Outside `useNodesState`

**What people do:** Keep a separate `useState<Memo[]>` and manually synchronize it with `useNodesState`.
**Why it's wrong:** xyflow's drag, zoom, and selection all mutate `nodes` via `onNodesChange`. Maintaining a shadow array causes desync, especially for positions.
**Do this instead:** Use `useNodesState` as the single source of truth. Store business data (`content`) inside node `data` field. Access it via `useReactFlow().getNode(id)` when needed outside a node component.

### Anti-Pattern 3: Putting `ReactFlowProvider` Inside a Feature Slice

**What people do:** Wrap `<ReactFlow>` inside a feature component that also provides context.
**Why it's wrong:** `useReactFlow()` and `useNodes()` hooks must be called inside a `ReactFlowProvider`. If the provider is too deep (inside a feature), sibling features cannot access the flow instance.
**Do this instead:** Mount `ReactFlowProvider` in `app/providers/` so the entire app tree can use `useReactFlow()` hooks. The `<ReactFlow>` render target lives in `pages/canvas/`, but the provider context is available to all features.

### Anti-Pattern 4: FSD Layer Violation — Feature Depending on Page

**What people do:** `MemoNode` imports from `pages/canvas/` to access canvas state.
**Why it's wrong:** FSD prohibits upward dependencies. Features cannot import from pages.
**Do this instead:** All shared canvas state is owned by `features/memo-canvas/model/useMemoStore`. The page imports the hook, not vice versa. `MemoNode` uses `useReactFlow()` for any flow instance access it needs.

### Anti-Pattern 5: Storing Derived Display State in localStorage

**What people do:** Serialize xyflow's full node object including internal fields (`selected`, `dragging`, `measured`) into localStorage.
**Why it's wrong:** These fields are xyflow runtime state, not application data. Restoring them causes subtle bugs (nodes loading as `selected: true`, etc.).
**Do this instead:** Map to the minimal `Memo` shape before saving — only `id`, `content`, and `position`. Reconstruct full node objects on load with defaults for xyflow-internal fields.

## Integration Points

### External Services

| Service         | Integration Pattern                                                                                                  | Notes                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `@xyflow/react` | `<ReactFlow>` component in pages layer; `useReactFlow()` in feature components; `ReactFlowProvider` in app providers | nodeTypes registry must be defined outside render; import from `@xyflow/react` directly |
| `localStorage`  | Abstracted behind `shared/lib/storage.ts` helpers                                                                    | Use `JSON.stringify`/`JSON.parse`; guard against null on first load                     |

### Internal Boundaries

| Boundary                                                  | Communication                                                                                                     | Notes                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `pages/canvas` to `features/memo-canvas`                  | Imports `useMemoStore`, `MemoNode`; passes `nodes`, `onNodesChange`, `addMemo` as props/handlers to `<ReactFlow>` | Page orchestrates; feature owns logic                             |
| `pages/canvas` to `features/memo-reset`                   | Imports `ResetButton` component                                                                                   | Fully encapsulated — page just places it                          |
| `features/memo-canvas` to `entities/memo`                 | Imports `Memo` type and `MemoNode` node type definition                                                           | Downward FSD dependency — correct                                 |
| `features/memo-canvas` to `shared/lib/storage`            | Calls `loadMemos()` / `saveMemos()`                                                                               | Downward FSD dependency — correct                                 |
| `features/memo-canvas` to `shared/config/canvas-defaults` | Reads `defaultViewport`; does NOT import `nodeTypes` (that would create a circular dep with MemoNode)             | CanvasPage imports both nodeTypes and useMemoStore directly       |
| `MemoNode` to `useReactFlow()`                            | Direct xyflow hook call inside MemoNode for `updateNodeData`                                                      | Valid — xyflow context provided by ReactFlowProvider in app layer |

## Sources

- Existing codebase FSD rules: `.claude/rules/fsd-architecture.md` (HIGH confidence — project-specific)
- Existing codebase architecture: `.planning/codebase/ARCHITECTURE.md` (HIGH confidence — current state)
- @xyflow/react API design: Library patterns derived from xyflow v12 architecture (MEDIUM confidence — based on documented API surface)
- FSD official spec: https://feature-sliced.design/docs/reference/layers (HIGH confidence)

---

_Architecture research for: murder-mystery-memo canvas integration_
_Researched: 2026-03-21_
