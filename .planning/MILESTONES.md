# Milestones

## v1.0 MVP (Shipped: 2026-03-21)

**Phases completed:** 4 phases, 7 plans, 14 tasks

**Key accomplishments:**

- Removed Convex/Clerk/Cloudflare/wouter dead stack, installed @xyflow/react, and wired CanvasPage as the sole app entry point
- @xyflow/react ReactFlow canvas with pan/zoom, module-level nodeTypes, and local ReactFlowProvider in full-viewport dark layout
- MemoNode custom node with display/edit mode toggle, keyboard shortcuts (Shift+Enter/Escape), textarea auto-resize, and auto-focus — registered as "memo" in NODE_TYPES
- Controlled ReactFlow canvas with double-click memo creation at cursor position, node re-edit on double-click, drag repositioning, and overlap offset for consecutive memos
- valibot-validated localStorage persistence for memo nodes — save on change with drag guard, restore on mount with isEditing:false injection
- ResetButton with AlertDialog confirmation wired to MemoCanvas via forwardRef/useImperativeHandle, fixed-position upper-right overlay using pointer-events-none pattern
- Noir color palette (11 tokens), Playfair Display + Noto Serif JP fonts, and full dark detective-notebook aesthetic applied to MemoNode, canvas, and ResetButton/AlertDialog

---
