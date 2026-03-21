# Pitfalls Research

**Domain:** Canvas-based memo app with @xyflow/react
**Researched:** 2026-03-21
**Confidence:** MEDIUM (training data + library API knowledge; WebSearch unavailable for external verification)

## Critical Pitfalls

### Pitfall 1: nodeTypes Object Recreated Every Render

**What goes wrong:**
Defining the `nodeTypes` map inside a React component body causes React Flow to warn and re-render every node on every parent render. All custom node instances remount, losing local state (edit mode, focused textarea, etc.).

**Why it happens:**
React Flow does a referential equality check on the `nodeTypes` prop. When `nodeTypes` is an object literal inside the component, a new object reference is created each render, triggering the warning "It looks like you created a new nodeTypes or edgeTypes object" and forcing a full node re-render cycle.

**How to avoid:**
Define `nodeTypes` outside the component or at module level:

```typescript
// module level — stable reference
const nodeTypes: NodeTypes = {
  memoNode: MemoNode,
};

export function Canvas() {
  return <ReactFlow nodeTypes={nodeTypes} ... />;
}
```

Alternatively, use `useMemo` with no dependencies. Never use an inline object literal.

**Warning signs:**

- React Flow console warning: "It looks like you created a new nodeTypes or edgeTypes object"
- Custom node loses edit state when unrelated parent state changes
- Textarea focus lost unexpectedly during editing

**Phase to address:**
Canvas setup phase (when ReactFlow component and custom MemoNode are first wired together)

---

### Pitfall 2: Keyboard Shortcuts Conflict with Text Editing

**What goes wrong:**
React Flow listens globally for `Delete` and `Backspace` keys to delete selected nodes. When a user is typing in a memo's textarea and presses `Backspace`, the node itself gets deleted instead of (or in addition to) deleting a character.

Also, React Flow intercepts arrow keys for canvas panning, which prevents cursor movement inside a textarea.

**Why it happens:**
React Flow attaches key handlers at the wrapper level. These fire before textarea key events bubble and do not check whether focus is currently inside an editable element.

**How to avoid:**
Two approaches (use both together):

1. Set `deleteKeyCode={null}` on `<ReactFlow>` to disable the built-in delete behavior entirely (since the project uses a reset button, not per-node delete).
2. Inside the custom node's textarea, call `event.stopPropagation()` on `onKeyDown` to prevent React Flow from receiving keyboard events while the textarea has focus:

```typescript
<textarea
  onKeyDown={(e) => {
    e.stopPropagation(); // prevent ReactFlow delete/pan shortcuts
    if (e.key === 'Escape') { handleCancel(); }
    if (e.key === 'Enter' && e.shiftKey) { handleConfirm(); }
  }}
/>
```

**Warning signs:**

- Pressing Backspace while editing text deletes the node
- Arrow keys move the node instead of moving the cursor in the textarea
- Shift+Enter triggers React Flow's built-in behavior instead of the custom confirm handler

**Phase to address:**
Custom node editing phase (inline editing interaction implementation)

---

### Pitfall 3: localStorage State and React Flow Node State Diverge

**What goes wrong:**
Nodes rendered by React Flow carry their own internal position state that React Flow manages via `onNodesChange`. If the app saves to localStorage at the wrong time (e.g., only on explicit save, not on drag end), the persisted positions diverge from what is displayed. On reload, nodes jump to their old positions.

**Why it happens:**
React Flow uses `applyNodeChanges` to apply position deltas to the node array. Developers often:

- Call `setNodes(nodes)` without applying changes (losing drag updates)
- Save to localStorage before `onNodesChange` fires with the final `position` type change
- Restore from localStorage and pass positions, but React Flow's internal state has already initialized from a different source

**How to avoid:**

- Always implement `onNodesChange` using `applyNodeChanges`:

```typescript
const onNodesChange = useCallback((changes: NodeChange[]) => {
  setNodes((nds) => applyNodeChanges(changes, nds));
}, []);
```

- Persist to localStorage inside this callback (or in a `useEffect` watching `nodes`), so the persisted state always reflects the current positions.
- On initialization, load from localStorage before the first render — pass loaded nodes as the `initialNodes` or `nodes` prop. Do not load asynchronously after mount.

**Warning signs:**

- Nodes snap back to previous positions on page reload
- `onNodesChange` called with `type: 'position'` changes but localStorage doesn't update
- Console warning about controlled vs uncontrolled nodes

**Phase to address:**
localStorage persistence phase

---

### Pitfall 4: Double-Click on Canvas vs. Double-Click on Node Collision

**What goes wrong:**
The requirement is "double-click on canvas to add memo" AND "double-click on existing node to re-enter edit mode". React Flow propagates double-click events up, so a double-click on a node also fires the canvas's `onDoubleClick` handler, potentially creating a new node on top of the existing one while also entering edit mode.

**Why it happens:**
DOM events bubble. The `<ReactFlow>` component's `onDoubleClick` prop fires for double-clicks anywhere inside the canvas, including on child nodes, unless the node's handler stops propagation.

**How to avoid:**
In the custom node component, stop propagation on the double-click event before it reaches the canvas handler:

```typescript
<div
  onDoubleClick={(e) => {
    e.stopPropagation(); // prevent canvas onDoubleClick from firing
    enterEditMode();
  }}
>
```

The canvas `onDoubleClick` should only fire when the target is the canvas pane itself, which `stopPropagation` ensures.

**Warning signs:**

- Double-clicking a node both opens edit mode AND creates a new node at that position
- Two nodes appear at the same coordinates
- Re-editing a node immediately shows it in edit mode but with blank content (new node was created and focused)

**Phase to address:**
Canvas interaction phase (double-click to add + double-click to edit implementation)

---

### Pitfall 5: ReactFlow Container Must Have Explicit Dimensions

**What goes wrong:**
If the `<ReactFlow>` component's parent container has `height: 0` or no explicit height (e.g., inside a flex container that hasn't been sized), the canvas renders as invisible. Nodes technically exist in state but nothing is visible.

**Why it happens:**
React Flow uses `100%` width/height to fill its parent. If the parent has no intrinsic height (common with `div` elements in flex/grid layouts), the canvas collapses to zero height.

**How to avoid:**
Ensure the container has an explicit height — typically `height: 100vh` for a full-screen canvas:

```tsx
<div style={{ width: '100vw', height: '100vh' }}>
  <ReactFlow ... />
</div>
```

Or use `className="w-screen h-screen"` with Tailwind.

**Warning signs:**

- Blank page; no canvas visible
- Nodes appear in React DevTools state but not on screen
- `<ReactFlow>` wrapper has zero computed height in browser dev tools

**Phase to address:**
Canvas setup phase (initial layout implementation)

---

### Pitfall 6: Edit Mode State Stored in Node data Causes Full Re-Render on Every Node

**What goes wrong:**
Storing `isEditing: boolean` inside the React Flow node's `data` object means calling `setNodes` to toggle edit mode triggers a re-render of every node in the canvas. At scale this causes jank; at any scale it resets unrelated node state.

**Why it happens:**
React Flow passes `nodes` as a single array. When `setNodes` is called (even with only one node changed), React reconciles all node components. If `nodeTypes` is not stable (see Pitfall 1), this also causes remounts.

**How to avoid:**
Keep edit state local to the custom node component using `useState`. The node component receives `selected` and `data` props from React Flow; manage `isEditing` internally and only write back to React Flow's node data when content is confirmed:

```typescript
function MemoNode({ data }: NodeProps<MemoNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(data.content);
  // confirm writes back via updateNodeData from useReactFlow()
}
```

**Warning signs:**

- Noticeable lag when entering/exiting edit mode as number of nodes grows
- Other nodes briefly flash or re-render when one node enters edit mode
- Textarea loses focus when edit state is toggled

**Phase to address:**
Custom node component phase (data model and state management design)

---

### Pitfall 7: localStorage Parse Failure Crashes the App

**What goes wrong:**
If localStorage contains malformed JSON (corrupted, manually edited, from a different app version), `JSON.parse()` throws an exception. Without error handling, the entire React tree unmounts.

**Why it happens:**
Developers treat localStorage as a trusted source and skip parse error handling. localStorage contents can be corrupted by browser bugs, storage quotas, or manual developer tool edits.

**How to avoid:**
Always wrap localStorage reads in try/catch and validate the shape with a schema:

```typescript
function loadMemos(): Memo[] {
  try {
    const raw = localStorage.getItem("murder-mystery-memos");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // validate with valibot (already in project deps)
    return parse(MemoArraySchema, parsed);
  } catch {
    return []; // graceful fallback
  }
}
```

The project already uses `valibot` — use it here. Note: valibot `parse` throws on invalid data, so the outer try/catch covers both JSON.parse and schema validation failures.

**Warning signs:**

- App crashes on load with JSON parse errors in console
- App crashes after browser storage is cleared or storage quota exceeded
- Users report blank white screen after previously working

**Phase to address:**
localStorage persistence phase

---

### Pitfall 8: React Flow Default Styles Not Imported

**What goes wrong:**
React Flow's internal layout (node positioning, edge rendering, minimap) depends on CSS that ships with the package. Without importing it, nodes render in the top-left corner stacked on each other, and edges are invisible.

**Why it happens:**
The library does not auto-inject styles. Developers miss the import or expect a CSS-in-JS solution.

**How to avoid:**
Import the base styles in the app entry point or the canvas component:

```typescript
import "@xyflow/react/dist/style.css";
```

For Tailwind-heavy projects, import the base style only and override selectors as needed. Avoid importing the full themed CSS if a custom dark theme is being applied.

**Warning signs:**

- All nodes render at position (0,0) stacked on top of each other
- Edges don't appear even though they're in state
- Controls and minimap render without styling

**Phase to address:**
Canvas setup phase (initial ReactFlow integration)

---

## Technical Debt Patterns

| Shortcut                                                       | Immediate Benefit   | Long-term Cost                                                                  | When Acceptable                                                                           |
| -------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Saving all nodes to localStorage on every `onNodesChange` call | Always in sync      | Excessive writes during drag (fires ~60×/sec); can cause noticeable lag on drag | Never — debounce writes on `dragStop` type changes, write immediately for content changes |
| Hardcoding `deleteKeyCode={null}` without explanation          | Silences the bug    | Future developers re-enable it, breaking text editing                           | Acceptable but document the reason in a comment                                           |
| Using `id: Date.now().toString()` for new node IDs             | Simple              | Collisions possible if two nodes created in the same millisecond                | Acceptable for single-user local app, but prefer `crypto.randomUUID()`                    |
| Inline `nodeTypes` object on `<ReactFlow>`                     | Faster to write     | Constant re-render warning; potential lost focus bugs                           | Never                                                                                     |
| Storing `isEditing` in node `data`                             | Simpler state model | Re-renders all nodes on toggle                                                  | Never for this use case — keep it local                                                   |

## Integration Gotchas

| Integration                           | Common Mistake                                                                                                                | Correct Approach                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| @xyflow/react + React 19              | React 19's `use` hook and concurrent mode can cause double-invocation of effects                                              | Ensure node creation only fires once by checking for duplicate IDs; use stable callbacks                                               |
| @xyflow/react + Tailwind CSS v4       | React Flow's `.react-flow__node` class CSS conflicts with Tailwind's reset/preflight                                          | Scope React Flow styles carefully; import `@xyflow/react/dist/base.css` (not the full themed CSS) to avoid conflicts                   |
| @xyflow/react + Feature-Sliced Design | Placing ReactFlow's global store logic in a "page" layer creates import cycle when a "feature" needs to call `useReactFlow()` | Wrap ReactFlow instance at the widget/page boundary; use `useReactFlow()` only inside components rendered within `<ReactFlowProvider>` |
| valibot + localStorage                | Using `parse` (throws) when loading startup data                                                                              | Use `safeParse` or wrap in try/catch; failing fast on startup is worse than silently resetting to empty state                          |

## Performance Traps

| Trap                                                 | Symptoms                                                  | Prevention                                                                                               | When It Breaks                            |
| ---------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Writing to localStorage on every `onNodesChange`     | Drag becomes laggy; browser freezes briefly on fast drags | Debounce storage writes; only write on `type === 'position'` changes after drag ends (`dragging: false`) | Noticeable at ~20+ nodes being dragged    |
| Not memoizing node update callbacks passed as `data` | Every node re-renders when any node's data changes        | Use `useCallback` for callbacks; pass stable function references via node `data`                         | Noticeable at ~10+ nodes                  |
| Reading localStorage synchronously in render         | Blocks initial paint                                      | Read once at module initialization and pass as `initialNodes`                                            | Any page load — always do it once at init |

## Security Mistakes

| Mistake                                                                 | Risk                                                                  | Prevention                                                                                       |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Storing user content without sanitization before rendering in innerHTML | XSS if content is ever rendered as HTML                               | This app uses textarea/text content only — never use `dangerouslySetInnerHTML` with memo content |
| Using `localStorage` key without namespace                              | Content collision if another app on the same origin uses the same key | Use a unique key like `murder-mystery-memo:memos`                                                |

## UX Pitfalls

| Pitfall                                                                   | User Impact                                                                               | Better Approach                                                                                                         |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Not auto-focusing the textarea when a new memo is created                 | User must click again after double-click to start typing — breaks the "add and type" flow | Call `textarea.focus()` in a `useEffect` triggered when `isEditing` becomes true and node is newly created              |
| Confirming edit on any outside click including canvas scroll/pan          | User accidentally confirms half-written memo while panning                                | Only confirm on `onBlur` of the textarea, not on canvas `onClick`                                                       |
| Not preserving Enter-as-newline while also supporting Shift+Enter confirm | Users cannot add line breaks in memos                                                     | Ensure `onKeyDown` handler only intercepts `Shift+Enter` for confirm, letting plain `Enter` default through to textarea |
| Reset button without confirmation dialog                                  | One mis-click destroys all memos with no recovery                                         | Always show a confirmation dialog (specified in requirements — do not skip)                                             |
| Canvas panning blocked while editing                                      | Users can't scroll to see other memos while editing                                       | Allow panning to continue; only prevent node-delete and arrow-key shortcuts while editing                               |

## "Looks Done But Isn't" Checklist

- [ ] **Custom node editing:** Textarea actually receives keyboard events — verify Backspace deletes characters, not the node
- [ ] **Enter key handling:** Plain Enter creates a newline; Shift+Enter confirms — test both in the actual textarea
- [ ] **localStorage restore:** Reload the page and confirm node positions and content are exactly preserved
- [ ] **New memo auto-focus:** Double-click canvas → new memo appears → cursor is immediately in textarea without additional clicks
- [ ] **Double-click node re-edit:** Double-clicking an existing memo opens it for editing without creating a second node at that position
- [ ] **Reset confirmation:** Reset button shows dialog; cancelling does not delete memos; confirming clears all
- [ ] **CSS import:** Canvas is not a blank white or black box — React Flow base styles are imported
- [ ] **nodeTypes stability:** Open React DevTools console; confirm no "nodeTypes object" warning on render

## Recovery Strategies

| Pitfall                                                               | Recovery Cost | Recovery Steps                                                                                       |
| --------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| nodeTypes defined inline (discovered late)                            | LOW           | Move `nodeTypes` object outside component; all node state resets cleanly                             |
| Keyboard shortcuts conflict discovered after UX testing               | LOW           | Add `deleteKeyCode={null}` to ReactFlow props + `stopPropagation` in textarea handler                |
| localStorage positions diverge (discovered late in persistence phase) | MEDIUM        | Audit `onNodesChange` wiring; ensure `applyNodeChanges` is called; re-test drag-persist-reload cycle |
| Edit state in node data (discovered after performance issues)         | HIGH          | Refactor to local state in node component; remove `isEditing` from node data; re-wire all callbacks  |
| Missing CSS (discovered immediately on first render)                  | LOW           | Add import line; no logic changes needed                                                             |

## Pitfall-to-Phase Mapping

| Pitfall                                  | Prevention Phase                     | Verification                                                                                    |
| ---------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| nodeTypes recreated on render            | Canvas setup (ReactFlow integration) | No console warning about nodeTypes; edit mode is not lost when parent state changes             |
| Keyboard shortcuts conflict              | Custom node editing                  | Backspace deletes characters in textarea; Delete key does nothing (or is intentionally handled) |
| localStorage state diverges              | localStorage persistence             | Drag node, reload page — node is in the same position                                           |
| Double-click collision (canvas vs. node) | Canvas interaction                   | Double-clicking existing node does not create a new node at that location                       |
| Container has no dimensions              | Canvas setup                         | Canvas is visible and fills the viewport on first load                                          |
| Edit state in node data                  | Custom node component design         | Toggling edit mode does not cause console re-render warnings for other nodes                    |
| localStorage parse failure               | localStorage persistence             | Manually corrupting localStorage value → app shows empty canvas instead of crashing             |
| Missing base CSS import                  | Canvas setup                         | All nodes render at their correct positions, not stacked at origin                              |

## Sources

- @xyflow/react official documentation (reactflow.dev) — training data, library version 12.x
- React Flow GitHub issue tracker — known issues with keyboard handling and custom nodes (training data)
- React Flow "Common issues" troubleshooting page — nodeTypes stability warning documented officially
- valibot documentation — safeParse vs parse for non-throwing validation (training data)
- General React performance patterns — memoization for stable callbacks (training data)

Note: WebSearch and WebFetch were unavailable during this research. Findings are based on training data through August 2025 covering @xyflow/react v11-v12 API. The nodeTypes stability pitfall, keyboard shortcut interception, and localStorage patterns are well-documented and HIGH confidence. The React 19 interaction details are MEDIUM confidence and should be verified against current xyflow release notes when implementing.

---

_Pitfalls research for: @xyflow/react canvas memo app_
_Researched: 2026-03-21_
