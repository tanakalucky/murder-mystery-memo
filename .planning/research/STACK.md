# Stack Research

**Domain:** Canvas-based memo app (React SPA + @xyflow/react)
**Researched:** 2026-03-21
**Confidence:** HIGH (version numbers verified via `bun info` against live npm registry)

## Context: What's Already in Place

The following are **existing** and must NOT be changed:

| Technology            | Version       | Role                        |
| --------------------- | ------------- | --------------------------- |
| React                 | 19.2.4        | UI framework                |
| Vite                  | 8.0.1         | Build tool                  |
| Tailwind CSS          | v4 (`^4.2.2`) | Styling                     |
| shadcn/ui             | `^4.1.0`      | Component primitives        |
| TypeScript            | 5.9.3         | Type safety                 |
| Vitest                | `^4.1.0`      | Unit/browser testing        |
| Playwright            | `^1.58.2`     | E2E testing                 |
| oxlint / oxfmt        | latest        | Linting / formatting        |
| bun                   | —             | Package manager (mandatory) |
| Feature-Sliced Design | —             | Directory architecture      |

This research covers only **what needs to be added**.

---

## Recommended Stack (New Additions)

### Core Technologies

| Technology    | Version    | Purpose                           | Why Recommended                                                                                                                                                                |
| ------------- | ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| @xyflow/react | `^12.10.1` | Canvas, draggable nodes, pan/zoom | Spec-mandated; v12 is the current React-native API (renamed from react-flow-renderer). Supports React 19. 3 direct deps only (zustand, classcat, @xyflow/system). MIT license. |

That is the only net-new core dependency. @xyflow/react bundles its own zustand (v4 range internally) and does not conflict with a project-level zustand installation.

### Supporting Libraries

No additional supporting libraries are needed beyond @xyflow/react.

- **localStorage persistence**: handled with the browser native API — no library needed for `Memo[]` serialization of this size
- **Fonts (Playfair Display, Noto Serif JP)**: use `@fontsource-variable/*` packages — `@fontsource-variable/noto-sans` is already installed; add the two missing fonts below

| Library                               | Version | Purpose                                         | When to Use                                                             |
| ------------------------------------- | ------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| @fontsource-variable/playfair-display | `^5.x`  | Self-hosted variable font for memo body (Latin) | Required — design spec mandates Playfair Display for memo text          |
| @fontsource/noto-serif-jp             | `^5.x`  | Self-hosted font for memo body (Japanese)       | Required — design spec mandates Noto Serif JP for Japanese memo content |

Note: Noto Serif JP does not have a variable font package on fontsource; use the static `@fontsource/noto-serif-jp`.

### Development Tools

No new dev tools needed. Existing oxlint, oxfmt, Vitest, and Playwright cover the additions.

---

## Installation

```bash
# Core canvas library
bun add @xyflow/react

# Fonts (design spec requirement)
bun add @fontsource-variable/playfair-display @fontsource/noto-serif-jp
```

---

## Removals (also part of this milestone)

Remove before or alongside adding @xyflow/react:

```bash
bun remove convex @clerk/react @clerk/testing
```

Also remove from `package.json` / config:

- `wrangler`, `@cloudflare/vite-plugin` (Cloudflare deploy no longer needed)
- `next-themes` (dark/light theme toggle is irrelevant — app is fixed dark noir)

---

## Alternatives Considered

| Recommended          | Alternative                   | When to Use Alternative                                                                                                                            |
| -------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| @xyflow/react v12    | react-flow-renderer (v10/v11) | Never — v10/v11 are the old package name, unmaintained. v12 is the only supported version.                                                         |
| @xyflow/react        | Konva / react-konva           | If you need pixel-level canvas rendering (games, image editing). Overkill for text note positioning; @xyflow/react gives drag, pan, zoom for free. |
| @xyflow/react        | interact.js                   | If you need drag-drop without a full canvas abstraction. Lower-level; requires more manual work for pan/zoom.                                      |
| @fontsource packages | Google Fonts CDN              | If CDN latency is acceptable and offline use not needed. Fontsource keeps fonts bundled locally, no third-party network request.                   |

---

## What NOT to Use

| Avoid                                    | Why                                                                                                      | Use Instead                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `react-flow-renderer`                    | Old package name (v10/v11), no longer published or maintained                                            | `@xyflow/react`                                                      |
| `react-flow` (npm)                       | Squatted/unmaintained package unrelated to xyflow                                                        | `@xyflow/react`                                                      |
| `dnd-kit` or `react-dnd`                 | @xyflow/react provides built-in node drag natively — adding a separate DnD library creates conflicts     | Use @xyflow/react's `onNodeDragStop` + `useNodesState`               |
| Zustand (project-level) for canvas state | @xyflow/react manages its own internal Zustand store; sharing state via external Zustand adds complexity | Use `useNodesState` / `useReactFlow` hooks provided by @xyflow/react |
| IndexedDB / localForage                  | Overkill for a small `Memo[]` array; adds bundle weight                                                  | `localStorage` with `JSON.stringify` / `JSON.parse`                  |

---

## Stack Patterns by Variant

**For custom node rendering (memo card appearance):**

- Use `nodeTypes` prop on `<ReactFlow>` to register a custom React component
- The custom node component receives `data` prop — put `content` there
- Because: default nodes are plain boxes; the Old Paper parchment style requires a fully custom node component

**For localStorage sync:**

- Persist on `onNodesChange` (debounced ~300ms) — not on every render
- Restore via `initialNodes` prop populated from `localStorage.getItem` at mount
- Because: @xyflow/react manages node positions internally; syncing via `onNodesChange` is the canonical pattern

**For double-click to add memo:**

- Use `onPaneClick` (single) / `onPaneDoubleClick` is not a direct prop — use `onDoubleClick` on the `<ReactFlow>` wrapper div or intercept via `onNodeDoubleClick`
- Actually use a `<div onDoubleClick>` wrapper around `<ReactFlow>` and call `screenToFlowPosition` (from `useReactFlow`) to convert screen coords to canvas coords
- Because: @xyflow/react v12 exposes `screenToFlowPosition` for coordinate conversion

---

## Version Compatibility

| Package                        | Version  | Compatible With         | Notes                                                                                                                                           |
| ------------------------------ | -------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| @xyflow/react                  | 12.10.1  | React `>=17` (peer dep) | Confirmed compatible with React 19.2.4                                                                                                          |
| @xyflow/react                  | 12.10.1  | Tailwind CSS v4         | No integration needed — @xyflow/react ships its own CSS; import `@xyflow/react/dist/style.css`, then override with Tailwind classes or CSS vars |
| @xyflow/react                  | 12.10.1  | Vite 8                  | Standard ESM package, no Vite plugin needed                                                                                                     |
| @xyflow/react internal zustand | `^4.4.0` | Project has no zustand  | No conflict. If project later adds zustand, use v5 — bun will deduplicate correctly                                                             |

**CSS import required:**

```typescript
// in main.tsx or canvas feature entry point
import "@xyflow/react/dist/style.css";
```

Without this import, edges and handles render unstyled (common gotcha).

---

## Sources

- `bun info @xyflow/react` — version 12.10.1 confirmed latest as of 2026-03-21 (HIGH confidence)
- `bun view @xyflow/react peerDependencies` — React `>=17` confirmed (HIGH confidence)
- `bun info zustand` — v5.0.12 latest; @xyflow/react uses `^4.4.0` internally (HIGH confidence)
- npm registry metadata — dependency count, MIT license confirmed (HIGH confidence)
- Existing `package.json` — existing stack versions confirmed (HIGH confidence)

---

_Stack research for: @xyflow/react canvas memo app (additive milestone on existing React+Vite+Tailwind SPA)_
_Researched: 2026-03-21_
