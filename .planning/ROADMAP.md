# Roadmap: Murder Mystery Memo

## Overview

The project replaces an existing Todo/Convex/Clerk SPA with a canvas-based memo app for murder mystery games. Four phases deliver a complete, shippable product: first the canvas foundation (dependency cleanup + @xyflow/react setup), then the core memo interaction loop, then localStorage persistence, and finally the reset feature and full noir visual design. Each phase delivers a coherent, verifiable capability before the next begins.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Canvas Foundation** - Remove dead dependencies and establish a full-viewport @xyflow/react canvas (completed 2026-03-21)
- [ ] **Phase 2: Memo Interaction** - Add, edit, drag, and keyboard-control memos on the canvas
- [ ] **Phase 3: Persistence** - Survive page reload with localStorage save and restore
- [ ] **Phase 4: Reset and Visual Design** - Reset-all confirmation and complete noir aesthetic

## Phase Details

### Phase 1: Canvas Foundation

**Goal**: A full-viewport canvas is running with the correct architecture in place
**Depends on**: Nothing (first phase)
**Requirements**: CANVAS-01, CANVAS-02, CANVAS-03
**Success Criteria** (what must be TRUE):

1. The app opens to a full-viewport dark canvas with no visible old Todo UI
2. User can click-drag the canvas background to pan the view
3. User can scroll to zoom in and out on the canvas
4. No console errors from dead Convex/Clerk/Cloudflare packages

**Plans**: 2 plans

Plans:

- [x] 01-01: Remove dead dependencies (Convex, Clerk, Cloudflare, next-themes) and clean up entry points
- [x] 01-02: Install @xyflow/react and font packages; set up ReactFlowProvider and stable nodeTypes; render full-viewport canvas

### Phase 2: Memo Interaction

**Goal**: Users can create, edit, and reposition memos on the canvas
**Depends on**: Phase 1
**Requirements**: MEMO-01, MEMO-02, MEMO-03, MEMO-04, MEMO-05, MEMO-06, MEMO-07, MEMO-08
**Success Criteria** (what must be TRUE):

1. Double-clicking the canvas background creates a new memo at that position and immediately focuses the text input
2. User can type freely; Enter inserts a newline, Shift+Enter confirms the edit, Escape cancels and discards a new memo
3. Double-clicking an existing memo re-enters edit mode; clicking outside the memo confirms the edit
4. User can drag any memo to reposition it freely on the canvas

**Plans**: 2 plans

Plans:

- [ ] 02-01-PLAN.md — Create MemoNode type definitions, MemoNode component (display/edit modes, keyboard handling, auto-resize), and register in NODE_TYPES
- [ ] 02-02-PLAN.md — Wire MemoCanvas with useNodesState, double-click-to-create handler, node double-click re-edit, drag repositioning, and browser verification

### Phase 3: Persistence

**Goal**: Memo data survives page reload
**Depends on**: Phase 2
**Requirements**: PERS-01, PERS-02
**Success Criteria** (what must be TRUE):

1. After adding and repositioning memos, a page reload restores all memos with their correct content and positions
2. If localStorage data is corrupt or missing, the app loads with an empty canvas instead of crashing

**Plans**: TBD

Plans:

- [ ] 03-01: Implement storage.ts (loadMemos/saveMemos with valibot schema validation and try/catch); wire useEffect([nodes]) sync in useMemoStore; seed initial state from loadMemos on mount

### Phase 4: Reset and Visual Design

**Goal**: Users can reset all memos and the app looks and feels like a murder mystery detective's notebook
**Depends on**: Phase 3
**Requirements**: RESET-01, RESET-02, VIS-01, VIS-02, VIS-03
**Success Criteria** (what must be TRUE):

1. A reset button is fixed in the upper-right corner of the screen at all times
2. Clicking reset shows a confirmation dialog before deleting; cancelling leaves memos intact
3. Confirming reset clears all memos from the canvas and from localStorage
4. The canvas background, memo cards, fonts, and UI text all match the specified noir color palette and typography (Playfair Display, Noto Serif JP, Noto Sans JP)

**Plans**: TBD

Plans:

- [ ] 04-01: Implement ResetButton feature (shadcn AlertDialog confirmation + setNodes([]) + localStorage clear) with fixed-position layout
- [ ] 04-02: Apply full noir color palette to canvas, MemoNode, and UI chrome; integrate Playfair Display and Noto Serif JP fonts; verify visual output matches design spec

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase                | Plans Complete | Status      | Completed  |
| -------------------- | -------------- | ----------- | ---------- |
| 1. Canvas Foundation | 2/2            | Complete    | 2026-03-21 |
| 2. Memo Interaction  | 0/2            | Not started | -          |
| 3. Persistence       | 0/1            | Not started | -          |
| 4. Reset and Visual  | 0/2            | Not started | -          |
