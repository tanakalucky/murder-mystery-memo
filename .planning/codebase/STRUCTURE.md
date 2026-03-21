# Codebase Structure

**Analysis Date:** 2026-03-21

## Directory Layout

```
murder-mystery-memo/
├── src/
│   ├── app/                    # Application layer - bootstrap & global setup
│   │   ├── providers/          # React context providers
│   │   │   ├── ErrorBoundary/  # Global error handling
│   │   │   └── index.ts        # Barrel export
│   │   ├── routes/             # Route configuration
│   │   │   └── routes.tsx      # Authentication-based routing
│   │   ├── styles/             # Global stylesheets
│   │   │   └── index.css       # Global CSS (Tailwind)
│   │   └── index.tsx           # React root entry point
│   │
│   ├── pages/                  # Page layer - full-screen components
│   │   └── home/               # Home page slice
│   │       ├── ui/             # Page component
│   │       │   └── HomePage.tsx
│   │       └── index.ts        # Barrel export
│   │
│   ├── widgets/                # Widget layer - large UI blocks
│   │   └── header/             # Application header
│   │       ├── ui/
│   │       │   └── Header.tsx  # Header component
│   │       └── index.ts        # Barrel export
│   │
│   ├── features/               # Feature layer - business functionality
│   │   └── todo/               # Todo management slice
│   │       ├── ui/             # UI components
│   │       │   ├── add-todo/
│   │       │   │   ├── AddTodo.tsx
│   │       │   │   └── AddTodo.browser.test.tsx
│   │       │   └── todo-item/
│   │       │       ├── TodoItem.tsx
│   │       │       └── TodoItem.browser.test.tsx
│   │       ├── lib/            # Custom hooks & utilities
│   │       │   ├── use-todo-query.ts
│   │       │   └── use-todo-mutation.ts
│   │       ├── model/          # Data models & types
│   │       │   ├── todo.ts
│   │       │   └── form-state.ts
│   │       └── index.ts        # Public API barrel export
│   │
│   ├── shared/                 # Shared layer - reusable code
│   │   ├── ui/                 # UI primitives
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   │   ├── Input.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Field/
│   │   │   │   ├── Field.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Label/
│   │   │   ├── Item/
│   │   │   ├── Separator/
│   │   │   └── Skeleton/
│   │   ├── api/                # API configuration
│   │   │   ├── convex/         # Convex backend functions
│   │   │   │   ├── _generated/ # Auto-generated types
│   │   │   │   ├── todos.ts    # Todo queries & mutations
│   │   │   │   ├── schema.ts   # Database schema
│   │   │   │   └── auth.config.ts
│   │   │   └── index.ts        # API barrel export
│   │   ├── lib/                # Library functions
│   │   │   ├── utils.ts        # Helper functions (cn)
│   │   │   └── index.ts
│   │   └── config/             # Configuration (if needed)
│   │
│   └── vite-env.d.ts           # Vite environment types
│
├── e2e/                        # Playwright end-to-end tests
├── scripts/                    # Build & utility scripts
├── public/                     # Static assets
│
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript root config
├── tsconfig.app.json          # Application TypeScript config
├── playwright.config.ts       # Playwright E2E config
│
└── package.json               # Project dependencies & scripts
```

## Directory Purposes

**app/:**

- Purpose: Bootstrap application, configure global providers and routing
- Contains: Entry point, React provider setup, authentication routing
- Key files: `app/index.tsx` (root), `app/routes/routes.tsx` (auth routing), `app/providers/ErrorBoundary/` (error handling)

**pages/:**

- Purpose: Full-screen page components that compose features
- Contains: HomePage (the only page in current implementation)
- Key files: `pages/home/ui/HomePage.tsx`

**widgets/:**

- Purpose: Large self-contained UI blocks (header, sidebar, etc.)
- Contains: Header component integrating Clerk UserButton
- Key files: `widgets/header/ui/Header.tsx`

**features/:**

- Purpose: Encapsulate business domain features with their UI and logic
- Contains: Todo feature with add/edit/delete functionality
- Key files: `features/todo/ui/` (UI components), `features/todo/lib/` (hooks), `features/todo/model/` (types/interfaces)

**shared/ui/:**

- Purpose: Reusable UI primitives with consistent styling
- Contains: Base UI components (Button, Input, Field, etc.)
- Key files: Each component in its own subdirectory with index.ts

**shared/api/:**

- Purpose: Backend API configuration and data operations
- Contains: Convex backend schema, queries, mutations
- Key files: `shared/api/convex/schema.ts` (database schema), `shared/api/convex/todos.ts` (operations)

**shared/lib/:**

- Purpose: Shared utility functions
- Contains: Helper functions for common operations
- Key files: `shared/lib/utils.ts` (cn function for class merging)

## Key File Locations

**Entry Points:**

- `src/app/index.tsx`: React application root - sets up Clerk & Convex providers
- `src/app/routes/routes.tsx`: Route configuration - handles auth-based navigation
- `public/index.html`: HTML entry point (external to this structure)

**Authentication:**

- `src/app/index.tsx`: Provider hierarchy setup with Clerk
- `src/app/routes/routes.tsx`: Auth state checking and conditional rendering

**Data Access:**

- `src/shared/api/convex/todos.ts`: Backend queries and mutations
- `src/features/todo/lib/use-todo-query.ts`: Frontend query hook
- `src/features/todo/lib/use-todo-mutation.ts`: Frontend mutation hook

**Core Logic:**

- `src/features/todo/lib/`: Query and mutation hooks
- `src/features/todo/model/`: Data models and form state types

**Testing:**

- `src/features/todo/ui/add-todo/AddTodo.browser.test.tsx`: Browser tests for AddTodo
- `src/features/todo/ui/todo-item/TodoItem.browser.test.tsx`: Browser tests for TodoItem
- `e2e/`: Playwright end-to-end test files

## Naming Conventions

**Files:**

- Components: PascalCase (e.g., `HomePage.tsx`, `AddTodo.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `use-todo-query.ts`, `use-todo-mutation.ts`)
- Models/types: camelCase (e.g., `form-state.ts`, `todo.ts`)
- Tests: Component name + test type (e.g., `AddTodo.browser.test.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)

**Directories:**

- Slices (features/pages/widgets): kebab-case or snake_case for multi-word names
- Segments (ui/lib/model/api): lowercase standard names
- Generated code: underscore prefix (e.g., `_generated/`)

**Imports:**

- Use `@/` alias for all cross-layer imports (e.g., `import { Button } from "@/shared/ui/Button"`)
- Within same slice use relative imports (e.g., `import { FormState } from "../model/form-state"`)

## Where to Add New Code

**New Feature:**

- Primary code: `src/features/{feature-name}/`
  - Create subdirectories: `ui/`, `lib/`, `model/`
  - Create `index.ts` barrel file exporting public API
- Tests: `src/features/{feature-name}/ui/{component-name}/{component-name}.browser.test.tsx`
- Example: `src/features/todo/` for todo functionality

**New Page:**

- Implementation: `src/pages/{page-name}/ui/{PageName}.tsx`
- Export: `src/pages/{page-name}/index.ts`
- Register: Add route in `src/app/routes/routes.tsx`

**New UI Component:**

- Shared (reusable): `src/shared/ui/{ComponentName}/`
  - Create `{ComponentName}.tsx` and `index.ts`
  - Use CVA (class-variance-authority) for variant styling
- Feature-specific: `src/features/{feature-name}/ui/{component-name}/{component-name}.tsx`

**New Utility/Helper:**

- General: `src/shared/lib/utils.ts` or create new file `src/shared/lib/{purpose}.ts`
- Feature-specific: `src/features/{feature-name}/lib/{hook-name}.ts`

**New Widget:**

- Implementation: `src/widgets/{widget-name}/ui/{WidgetName}.tsx`
- Export: `src/widgets/{widget-name}/index.ts`

**API Operations:**

- Backend: `src/shared/api/convex/todos.ts` (add to existing module or create new)
- Schema: Update `src/shared/api/convex/schema.ts`
- Frontend: Create hooks in `src/features/{feature}/lib/use-{operation}.ts`

## Special Directories

**src/app/styles/:**

- Purpose: Global CSS (Tailwind directives, reset, design tokens)
- Generated: No (hand-written)
- Committed: Yes

**src/shared/api/convex/\_generated/:**

- Purpose: Auto-generated Convex API types
- Generated: Yes (by Convex CLI `convex run`)
- Committed: No (generated from .convexrc and schema.ts)

**e2e/:**

- Purpose: Playwright end-to-end tests
- Generated: No (hand-written)
- Committed: Yes

**scripts/:**

- Purpose: Development and build helper scripts
- Files: shadcn-add.ts (component installation), organize-ui.ts (UI structure)
- Committed: Yes

---

_Structure analysis: 2026-03-21_
