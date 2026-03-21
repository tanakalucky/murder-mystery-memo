# Project Research Summary

**Project:** murder-mystery-memo
**Domain:** Canvas-based memo app — @xyflow/react SPA with noir aesthetic
**Researched:** 2026-03-21
**Confidence:** HIGH

## Executive Summary

This project adds a draggable, persistent canvas memo feature to an existing React 19 + Vite + Tailwind CSS v4 + Feature-Sliced Design SPA. The approach is additive: a single new core dependency (`@xyflow/react` v12) plus two font packages covers all implementation needs. No backend, no auth, no cloud sync — localStorage is the correct persistence layer for this single-device, single-user use case, and the existing stack handles everything else. The canvas replaces the old Convex/Clerk/Cloudflare infrastructure, which must be removed before or alongside the new feature.

The recommended architecture is a Feature-Sliced Design structure where `features/memo-canvas` owns all canvas interaction (add, edit, drag, persist), `features/memo-reset` encapsulates destructive reset logic, and `entities/memo` holds the pure data type. The `ReactFlowProvider` lives in `app/providers/` so `useReactFlow()` hooks are available to all feature-layer components without violating FSD layer rules. The `nodeTypes` registry is a stable module-level constant in `shared/config/` — this is the single most important architectural decision to get right from day one.

The biggest implementation risks are all well-documented @xyflow/react gotchas: inline `nodeTypes` causing constant remounts, keyboard shortcuts (Delete, Backspace, arrow keys) conflicting with textarea editing, and localStorage diverging from canvas state if `onNodesChange` is not wired correctly. All three have clear, low-cost prevention strategies. The product's "aesthetic IS the differentiator" — the noir visual design (Playfair Display, Noto Serif JP, dark parchment color palette) should be built into the custom node from the start, not added later.

## Key Findings

### Recommended Stack

The existing stack (React 19, Vite 8, Tailwind CSS v4, shadcn/ui, TypeScript, Vitest, Playwright) requires only three additions: `@xyflow/react` (canvas engine), `@fontsource-variable/playfair-display` (Latin serif font), and `@fontsource/noto-serif-jp` (Japanese serif font). The old Convex, Clerk, Cloudflare, and next-themes packages must be removed — they are unused infrastructure from a previous architecture and create noise. No state management library (Zustand, Redux, etc.) is needed; `useNodesState` from @xyflow/react is the single source of truth for canvas state.

**Core technologies:**

- `@xyflow/react` v12.10.1: canvas engine, draggable nodes, pan/zoom — spec-mandated, React 19 compatible, MIT
- `@fontsource-variable/playfair-display` v5.x: self-hosted Latin serif font — design spec requirement, no CDN dependency
- `@fontsource/noto-serif-jp` v5.x: self-hosted Japanese serif font — design spec requirement (static, no variable font available)
- `localStorage` (browser native): persistence — sufficient for single-user, single-device use; no library needed
- `valibot` (already in project): schema validation for localStorage deserialization — prevents parse-failure crashes

**Removals required:**

- `convex`, `@clerk/react`, `@clerk/testing` — cloud backend no longer needed
- `wrangler`, `@cloudflare/vite-plugin` — Cloudflare deploy removed from scope
- `next-themes` — dark/light toggle irrelevant; app is fixed noir dark

### Expected Features

All core features are table stakes for a canvas app and are well-supported by @xyflow/react's built-in capabilities. The differentiators are specific to the murder-mystery context and require intentional design choices that run counter to typical conventions (Enter = newline rather than confirm).

**Must have (table stakes):**

- Full-viewport canvas with pan and zoom — `@xyflow/react` provides this by default
- Add memo by double-clicking canvas background — standard canvas-app interaction (Miro, FigJam, Excalidraw)
- Inline text editing with immediate auto-focus on creation — a memo that cannot be immediately written is not a memo
- Drag memo to reposition — core spatial organization; built into @xyflow/react
- localStorage persistence of content and position — data must survive page reload
- Dark noir visual design (color palette, serif fonts) — the aesthetic is the product
- Reset all memos with confirmation dialog — clean-slate between game scenarios

**Should have (competitive):**

- Enter for newline / Shift+Enter to confirm — inverts standard convention, optimized for game-session note-taking speed
- Escape to cancel edit (no partial save) — accidental edits in a timed game must be recoverable
- Confirm edit on click-outside — expected UI behavior
- Memo count display — implicit progress indicator (P2 priority; add post-MVP)

**Defer (v2+):**

- Per-memo delete — requires design solution that preserves noir atmosphere; excluded from v1 per spec
- Undo/redo stack — complex state management; not needed for v1 editable-in-place approach
- Connections/edges between memos — massive UX complexity; spatial proximity communicates relationships
- Export / print — requires layout work outside canvas scope

### Architecture Approach

The app follows Feature-Sliced Design with a clear dependency hierarchy: `pages/canvas` orchestrates, `features/memo-canvas` owns canvas interaction and localStorage sync, `features/memo-reset` owns destructive reset, `entities/memo` owns the pure data type, and `shared/` provides stable configuration, storage utilities, and UI primitives. The `ReactFlowProvider` wraps the entire app in `app/providers/` to make `useReactFlow()` hooks available to all feature components. All data flows through `useNodesState` as the single source of truth; `useEffect` watching `nodes` triggers `saveMemos()` to keep localStorage synchronized.

**Major components:**

1. `CanvasPage` (pages/canvas) — full-viewport layout, mounts `<ReactFlow>`, wires `useMemoStore` and event handlers
2. `MemoNode` (features/memo-canvas/ui) — custom node: parchment-styled card, local `isEditing` state, textarea with keyboard shortcuts, calls `updateNodeData` on commit
3. `useMemoStore` (features/memo-canvas/model) — `useNodesState` wrapper, `addMemo`, `localStorage` sync via `useEffect`
4. `ResetButton` (features/memo-reset/ui) — shadcn `AlertDialog` confirmation + `setNodes([])` action
5. `storage.ts` (shared/lib) — `loadMemos()` / `saveMemos()` with try/catch and valibot schema validation
6. `canvas-defaults.ts` (shared/config) — stable `nodeTypes` constant and `defaultViewport`
7. `types.ts` (entities/memo) — `Memo` type and `MemoNode` as `Node<MemoData>` extension

### Critical Pitfalls

1. **Inline `nodeTypes` object on `<ReactFlow>`** — causes all custom nodes to remount on every parent render, losing textarea focus and edit state. Define `nodeTypes` as a module-level constant in `shared/config/canvas-defaults.ts`. This is the single most dangerous gotcha.

2. **Keyboard shortcuts conflict (Delete/Backspace/arrow keys)** — @xyflow/react intercepts these at the wrapper level; pressing Backspace while typing deletes the node. Fix with `deleteKeyCode={null}` on `<ReactFlow>` and `e.stopPropagation()` in the textarea's `onKeyDown` handler.

3. **localStorage diverging from canvas state** — drag positions are lost on reload if `onNodesChange` is not wired through `applyNodeChanges`. Use `useNodesState` (which handles this correctly), sync via `useEffect([nodes])`, not ad hoc saves.

4. **Double-click collision (canvas vs. node)** — double-clicking an existing node fires both the node's edit handler and the canvas's add-memo handler, creating a duplicate node. The `MemoNode` double-click handler must call `e.stopPropagation()` before entering edit mode.

5. **Missing `@xyflow/react/dist/style.css` import** — without it, nodes render stacked at position (0,0) and edges are invisible. Import in `main.tsx` or the canvas entry point before any custom styles.

## Implications for Roadmap

Based on research, the implementation has clear dependency ordering: the canvas foundation must exist before any interaction features, interaction features must be working before persistence can be validated, and visual design is best layered in with the custom node (not added after). The feature set is narrow and well-defined — this milestone does not require discovery phases.

### Phase 1: Dependency Cleanup and Canvas Foundation

**Rationale:** Existing dead dependencies (Convex, Clerk, Cloudflare, next-themes) must be removed to avoid conflicts and confusion. The canvas foundation — installing @xyflow/react, importing base CSS, setting up `ReactFlowProvider`, rendering a full-viewport `<ReactFlow>` with stable `nodeTypes` — must be working before any feature work begins. Getting the canvas setup wrong (missing CSS, inline nodeTypes, wrong provider placement) causes all downstream work to exhibit confusing bugs.

**Delivers:** A running full-viewport canvas with the `MemoNode` custom component registered. No memo creation yet, but the shell is correct.

**Addresses:** Full-viewport canvas layout (table stakes)

**Avoids:** Missing CSS import (Pitfall 8), inline nodeTypes (Pitfall 1), ReactFlowProvider inside feature slice (Anti-Pattern 3)

### Phase 2: Core Memo Interaction

**Rationale:** With the canvas shell correct, add the primary interaction loop: double-click to create, drag to reposition, double-click existing node to edit, keyboard shortcuts (Enter/Shift+Enter/Escape), click-outside to confirm. These features are tightly coupled (add and edit live in the same `MemoNode` component) and must be built together. Edit state belongs in `MemoNode` local state, not in the xyflow node data — this design decision is load-bearing and must be made here.

**Delivers:** A working add-edit-drag interaction cycle. Memos are not yet persisted across reload.

**Addresses:** Add memo, inline editing, keyboard shortcuts, drag to reposition, immediate auto-focus on creation

**Avoids:** Keyboard shortcut conflict (Pitfall 2), double-click collision (Pitfall 4), edit state in node data (Pitfall 6)

### Phase 3: localStorage Persistence

**Rationale:** Persistence is a separate concern from interaction and requires its own careful implementation. `loadMemos()` must use valibot schema validation inside try/catch to prevent parse-failure crashes. `saveMemos()` must be triggered via `useEffect([nodes])` — not directly in event handlers — to ensure all state changes (drag, edit, add) are captured uniformly. Debouncing writes during drag is a performance consideration but not required for MVP.

**Delivers:** Memos survive page reload with correct content and positions.

**Addresses:** localStorage persistence (table stakes)

**Avoids:** localStorage state diverge (Pitfall 3), parse failure crash (Pitfall 7), storing xyflow internal fields (Anti-Pattern 5)

### Phase 4: Reset Feature

**Rationale:** Reset is architecturally separate from memo-canvas (different feature slice, different mutation pattern — wipes all nodes at once rather than updating one). It requires `shadcn AlertDialog` for confirmation, which is a distinct UI component. Building it after persistence is validated ensures the reset-and-restore cycle can be tested end-to-end.

**Delivers:** "Reset all" button with confirmation dialog that clears all memos.

**Addresses:** Reset all with confirmation (table stakes per spec)

**Avoids:** Destructive action without confirmation (UX pitfall)

### Phase 5: Noir Visual Design and Typography

**Rationale:** The custom `MemoNode` component is the primary visual surface. Installing the fonts (`@fontsource-variable/playfair-display`, `@fontsource/noto-serif-jp`) and applying the noir color palette (Noir Black canvas, Old Paper parchment nodes, Brass accents, Crimson reset button) should be applied once the interaction and persistence behavior is verified, so visual changes do not obscure functional bugs. That said, basic styling of the node can be done in Phase 2 — this phase is for the complete noir polish.

**Delivers:** The full murder-mystery aesthetic: parchment memo cards, dark canvas, serif fonts, atmospheric color palette.

**Addresses:** Dark noir atmosphere (differentiator); Playfair Display + Noto Serif JP typography

**Avoids:** Adding visual complexity before functional validation

### Phase Ordering Rationale

- **Dependency cleanup first:** Removes false signals from dead code before building anything new.
- **Canvas foundation before features:** The nodeTypes stability pattern and ReactFlowProvider placement affect every subsequent feature — getting this wrong in Phase 1 creates cascading bugs.
- **Interaction before persistence:** Verifying drag-edit-add works correctly before adding a persistence layer prevents the common mistake of conflating interaction bugs with persistence bugs.
- **Reset after persistence:** The reset-restore cycle can only be validated once persistence exists.
- **Visual polish last (except basics):** Functional correctness is easier to assess without visual noise; noir design can be layered in without breaking existing behavior.

### Research Flags

Phases with standard, well-documented patterns (research-phase can be skipped):

- **Phase 1 (Cleanup + Canvas Foundation):** Package removal and @xyflow/react setup are mechanical steps with official docs and clear guidance from STACK.md.
- **Phase 3 (localStorage Persistence):** The pattern is explicitly documented in ARCHITECTURE.md with code examples; valibot integration is standard.
- **Phase 4 (Reset Feature):** shadcn AlertDialog is well-documented; the reset logic is a single `setNodes([])` call.

Phases that may benefit from per-phase review before implementation:

- **Phase 2 (Core Memo Interaction):** The custom node's interaction model (local edit state, keyboard event handling, stopPropagation strategy) is the most complex part of the implementation. Recommend reviewing the PITFALLS.md "Looks Done But Isn't" checklist before marking this phase complete.
- **Phase 5 (Visual Design):** @fontsource integration with Tailwind v4 and @xyflow/react's CSS specificity interactions may need verification — the base CSS import order matters.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                              |
| ------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | Versions verified via `bun info` against live npm registry; existing stack confirmed from package.json                                             |
| Features     | MEDIUM     | Project spec defines scope directly; UX patterns from training data (stable conventions)                                                           |
| Architecture | HIGH       | Existing codebase FSD rules read directly; @xyflow/react patterns based on documented v12 API                                                      |
| Pitfalls     | MEDIUM     | nodeTypes stability, keyboard conflict, and localStorage patterns are well-documented; React 19 + xyflow interaction details are MEDIUM confidence |

**Overall confidence:** HIGH

### Gaps to Address

- **React 19 concurrent mode + @xyflow/react interaction:** Double-invocation of effects in StrictMode may cause duplicate node creation. Prevention: check for duplicate IDs in `addMemo` before appending. Verify in Phase 2.
- **Tailwind v4 + @xyflow/react CSS specificity:** `@xyflow/react/dist/base.css` (not the full themed CSS) is recommended to avoid conflicts with Tailwind's preflight. Validate the import order produces the expected visual result in Phase 1.
- **`@fontsource/noto-serif-jp` bundle size:** Noto Serif JP is a large font family. Subsetting or loading only required weights should be considered in Phase 5 to avoid significant bundle size impact.
- **Debouncing localStorage writes during drag:** The research flags writing on every `onNodesChange` during drag as a performance trap (fires ~60x/sec). For MVP this is acceptable; add debounce if lag is observed with 20+ memos.

## Sources

### Primary (HIGH confidence)

- `bun info @xyflow/react` — version 12.10.1, peer deps, MIT license confirmed 2026-03-21
- Existing `package.json` — current stack versions confirmed
- `.claude/rules/fsd-architecture.md` — project-specific FSD rules
- `.planning/codebase/ARCHITECTURE.md` — current codebase state

### Secondary (MEDIUM confidence)

- @xyflow/react official documentation (training data, v11-v12 API surface)
- React Flow GitHub issue tracker — keyboard handling and nodeTypes stability issues
- React Flow "Common issues" troubleshooting page — nodeTypes stability warning documented officially
- Project spec `PROJECT.md` — scope constraints and feature requirements
- Miro, FigJam, Excalidraw feature analysis — canvas app UX conventions

### Tertiary (training data, verified by convention)

- valibot documentation — `safeParse` vs `parse` behavior
- Feature-Sliced Design official spec (feature-sliced.design) — layer dependency rules
- General React performance patterns — `useCallback`, `useMemo` for stable references

---

_Research completed: 2026-03-21_
_Ready for roadmap: yes_
