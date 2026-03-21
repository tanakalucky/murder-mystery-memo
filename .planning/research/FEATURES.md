# Feature Research

**Domain:** Canvas-based memo/note app with draggable nodes (@xyflow/react)
**Researched:** 2026-03-21
**Confidence:** MEDIUM (training data + project spec; web search unavailable)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature                               | Why Expected                                                                                   | Complexity | Notes                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| Add memo by double-clicking canvas    | Standard canvas-app interaction pattern (Miro, FigJam, Excalidraw all use double-click-to-add) | LOW        | @xyflow/react `onPaneClick`/`onDoubleClick` callback; position derived from event coordinates             |
| Inline text editing on double-click   | Universal expectation: click existing item to edit in place                                    | MEDIUM     | Requires custom node with contenteditable or textarea; @xyflow/react does not provide this out of the box |
| Drag memo to reposition               | Core value of a canvas app — spatial organization of information                               | LOW        | @xyflow/react handles drag natively; just enable `draggable` prop on nodes                                |
| Immediate focus + edit mode on create | Creating a memo that can't be typed into immediately is frustrating                            | LOW        | Trigger edit state in node after `addNode` with `useEffect` or node `data.editing` flag                   |
| Confirm edit on click-outside         | Standard text editor behavior                                                                  | LOW        | Detect focus-out on the editing textarea; straightforward DOM event                                       |
| Persistent state across page refresh  | Any data tool must survive a page reload                                                       | MEDIUM     | localStorage serialization of node positions + content; need debounced write                              |
| Full-viewport canvas layout           | Canvas apps must fill the screen — not be a boxed widget                                       | LOW        | @xyflow/react renders full-width/height via CSS; set `width: 100vw; height: 100vh`                        |
| Canvas pan (click-drag on background) | Standard navigation in any canvas-based tool                                                   | LOW        | Built into @xyflow/react by default                                                                       |
| Canvas zoom (mouse wheel)             | Standard navigation in any canvas-based tool                                                   | LOW        | Built into @xyflow/react by default                                                                       |
| Dark / thematic visual design         | Murder mystery context demands atmosphere; plain white breaks immersion                        | MEDIUM     | Custom node styles with Old Paper background, Noir Black canvas, serif fonts                              |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature                                      | Value Proposition                                                                                 | Complexity | Notes                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Dark noir atmosphere (color palette + fonts) | Generic tools feel wrong in a murder mystery context; the aesthetic IS the product                | MEDIUM     | Tailwind CSS custom tokens for Noir Black, Old Paper, Brass; Playfair Display + Noto Serif JP fonts via @fontsource |
| Enter for newline / Shift+Enter to confirm   | Optimized for note-taking speed during a timed game session; opposite of typical "Enter = submit" | LOW        | Keyboard event handler in custom node edit mode; invert standard convention deliberately                            |
| Escape to cancel (no partial save)           | During a game, accidental edits must be reversible cleanly                                        | LOW        | Store original content before edit; restore on Escape keydown                                                       |
| Reset all with confirmation dialog           | Supports start-of-new-scenario workflow; accidental resets would be catastrophic                  | LOW        | shadcn AlertDialog for destructive confirmation                                                                     |
| Memo count as play-progress indicator        | Implicit feedback on how much information has been gathered                                       | LOW        | Display memo count badge on canvas, zero-state encouragement                                                        |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature                           | Why Requested                                   | Why Problematic                                                                                                                    | Alternative                                                                        |
| --------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Per-memo delete button            | Seems obvious; user may want to remove one note | Clutters memo UI (visible delete icon on every card breaks atmosphere); accidental deletion during game is high-cost with no undo  | Rely on reset-all only per project spec; the constraint is intentional for this v1 |
| Resize handles on memos           | Power users want variable-size cards            | Significant complexity: @xyflow/react NodeResizer add-on needed; resize persistence in data model; increases data model complexity | Fixed-size memos with textarea auto-height is simpler and sufficient               |
| Connections/edges between memos   | Looks useful for linking suspects to clues      | Adds massive UX complexity (edge creation mode, edge deletion, curved line rendering); out of scope for this tool's purpose        | Spatial proximity of memos communicates relationship visually                      |
| Toolbar / sidebar controls        | Looks professional                              | Wastes screen real estate; violates "minimal UI" constraint; distracts from game content                                           | Single floating reset button in a corner                                           |
| Undo/redo stack                   | Users expect Ctrl+Z                             | Complex state management (requires history stack, localStorage still needs to be consistent); significant scope increase           | Not needed for v1; memos are editable in place                                     |
| Export / share                    | Natural progression for a notes tool            | Backend required for meaningful sharing; even PDF export adds complexity beyond scope                                              | localStorage is sufficient for single-session, single-device use                   |
| Auto-save indicator / sync status | Users want confidence their data is saved       | Adds visual noise; localStorage is synchronous so data is always saved immediately                                                 | No indicator needed; writes are synchronous                                        |
| Tag / label / color-code memos    | Organization feature                            | Adds data model fields, filtering UI, color picker; far beyond the memo canvas concept                                             | Spatial arrangement is the organization method                                     |
| Markdown rendering in memos       | Technical users want formatting                 | Breaks the hand-written note aesthetic; adds parse complexity                                                                      | Plain text preserves the detective-note feel                                       |

## Feature Dependencies

```
[Canvas layout (full viewport)]
└──requires──> [Canvas pan + zoom]           (built into @xyflow/react)
└──required by──> [Add memo by double-click]

[Add memo by double-click]
└──requires──> [Canvas layout]
└──requires──> [Immediate focus on create]
└──requires──> [Inline text editing]

[Inline text editing]
└──requires──> [Keyboard shortcuts (Enter/Shift+Enter/Escape)]
└──requires──> [Confirm on click-outside]

[Persistent state]
└──requires──> [Add memo] (something to persist)
└──requires──> [Drag to reposition] (position must be persisted, not just content)

[Reset all]
└──requires──> [Confirmation dialog]
└──requires──> [Persistent state] (otherwise reset is meaningless)

[Dark noir aesthetic]
└──enhances──> [Inline text editing]    (custom node styling)
└──enhances──> [Canvas layout]          (canvas background color)
└──enhances──> [Reset button]           (Crimson color for destructive action)

[Memo count indicator]
└──enhances──> [Add memo]
└──conflicts──> [Minimal UI constraint] (borderline — keep only if zero-state is empty enough)
```

### Dependency Notes

- **[Add memo] requires [Inline text editing]:** A memo that cannot be immediately written into is not a memo — they are inseparable in this context.
- **[Persistent state] requires [Drag to reposition]:** Position is part of the `Memo` data type; drag updates position so persistence must capture it.
- **[Reset all] requires [Confirmation dialog]:** Destructive action on all content with no undo requires confirmation; @xyflow/react has no built-in undo.
- **[Dark noir aesthetic] enhances [Inline text editing]:** The custom node component is the primary visual surface; styling and editing behavior live in the same component.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Full-viewport @xyflow/react canvas — foundation everything else builds on
- [ ] Double-click canvas to add memo — core interaction
- [ ] Immediate edit mode + focus on memo creation — without this, creation feels broken
- [ ] Inline text editing with Enter (newline) / Shift+Enter (confirm) / Escape (cancel) — murder-mystery-optimized keyboard UX
- [ ] Confirm edit on click-outside — expected behavior
- [ ] Drag memo to reposition — primary spatial organization mechanism
- [ ] localStorage persistence of content + position — data must survive page reload
- [ ] Reset all with confirmation dialog — clean-slate between scenarios
- [ ] Dark noir visual design (color palette + Playfair Display / Noto Serif JP) — the aesthetic IS the differentiator

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Memo count display — adds a sense of progress; add if zero-state feels too empty
- [ ] Mini-map (built into @xyflow/react) — useful if users accumulate many memos spread across a large canvas

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Per-memo delete — requires design solution that preserves atmospheric UI
- [ ] Undo/redo — requires history stack implementation
- [ ] Export (print/PDF) — requires layout considerations outside canvas

## Feature Prioritization Matrix

| Feature                                       | User Value | Implementation Cost | Priority |
| --------------------------------------------- | ---------- | ------------------- | -------- |
| Full-viewport canvas                          | HIGH       | LOW                 | P1       |
| Add memo by double-click                      | HIGH       | LOW                 | P1       |
| Inline text editing                           | HIGH       | MEDIUM              | P1       |
| Keyboard shortcuts (Enter/Shift+Enter/Escape) | HIGH       | LOW                 | P1       |
| Drag to reposition                            | HIGH       | LOW                 | P1       |
| localStorage persistence                      | HIGH       | MEDIUM              | P1       |
| Dark noir aesthetic                           | HIGH       | MEDIUM              | P1       |
| Reset all + confirmation                      | MEDIUM     | LOW                 | P1       |
| Click-outside to confirm edit                 | MEDIUM     | LOW                 | P1       |
| Memo count display                            | LOW        | LOW                 | P2       |
| Mini-map                                      | LOW        | LOW                 | P2       |
| Per-memo delete                               | MEDIUM     | MEDIUM              | P3       |
| Undo/redo                                     | MEDIUM     | HIGH                | P3       |
| Resize handles                                | LOW        | HIGH                | P3       |
| Connections/edges                             | LOW        | HIGH                | P3       |

**Priority key:**

- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature                   | Miro / FigJam                    | Excalidraw                       | Our Approach                            |
| ------------------------- | -------------------------------- | -------------------------------- | --------------------------------------- |
| Add node by double-click  | Yes (double-click to add sticky) | Yes (double-click text or shape) | Yes — core interaction                  |
| Inline text editing       | Yes                              | Yes                              | Yes — custom node with textarea         |
| Drag to reposition        | Yes                              | Yes                              | Yes — @xyflow/react built-in            |
| Per-item delete           | Yes (Delete key)                 | Yes                              | No — reset-all only per spec            |
| Connections between nodes | Yes                              | Yes                              | No — out of scope                       |
| Toolbar                   | Yes (rich)                       | Yes (minimal)                    | No — single reset button only           |
| Dark theme                | Optional                         | Optional                         | Yes — mandatory, the core aesthetic     |
| localStorage persistence  | No (cloud)                       | Yes (local + shareable URL)      | Yes — localStorage only                 |
| Fonts / atmosphere        | Generic                          | Handwritten                      | Noir serif — deliberate differentiation |

## Sources

- @xyflow/react official documentation (training data, HIGH confidence for API shape; MEDIUM for exact v12 surface)
- Project spec (`PROJECT.md`) — defines scope constraints directly
- Miro, FigJam, Excalidraw feature analysis (training data, MEDIUM confidence)
- General canvas app UX patterns (training data, HIGH confidence — these patterns are stable)

---

_Feature research for: murder-mystery-memo canvas app_
_Researched: 2026-03-21_
