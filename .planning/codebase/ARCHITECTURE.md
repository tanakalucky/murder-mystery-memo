# Architecture

**Analysis Date:** 2026-03-21

## Pattern Overview

**Overall:** Feature-Sliced Design (FSD)

**Key Characteristics:**

- Layered architecture with 7 layers ordered by responsibility (app → pages → widgets → features → entities → shared)
- Business domain slicing within each layer
- Strict dependency flow enforced (upper layers depend only on lower layers)
- Public API pattern via `index.ts` for controlled exports
- Cross-slice dependencies prohibited within same layer

## Layers

**app:**

- Purpose: Application bootstrap, global configuration, and entry point
- Location: `src/app/`
- Contains: React root setup, provider hierarchy, routing configuration, global styles, error boundaries
- Depends on: All other layers (pages, features, shared, providers)
- Used by: Browser via DOM element with id "root"

**pages:**

- Purpose: Full-screen page components that compose features and widgets
- Location: `src/pages/`
- Contains: Route-level components (HomePage), page-specific layout
- Depends on: features, widgets, shared
- Used by: Routes (app/routes/routes.tsx)

**widgets:**

- Purpose: Large self-contained UI blocks combining multiple features
- Location: `src/widgets/`
- Contains: Header component (integrates UserButton from Clerk)
- Depends on: shared, features (via composition)
- Used by: Pages

**features:**

- Purpose: Concrete user-executable business functions (CRUD operations, form submission)
- Location: `src/features/`
- Contains: Business logic, mutations, queries, UI components, models
- Depends on: entities, shared, API services
- Used by: Pages, widgets

**shared:**

- Purpose: Project-wide reusable utilities, components, and API configuration
- Location: `src/shared/`
- Contains: UI primitives (Button, Input, Field), library functions (cn utility), API setup
- Depends on: Only external dependencies
- Used by: All layers above

## Data Flow

**Todo List Display Flow:**

1. User navigates to HomePage (`src/pages/home/ui/HomePage.tsx`)
2. HomePage calls `useTodoQuery(userId)` hook from features layer
3. Hook invokes `convexApi.todos.getTodos` (Convex backend query)
4. Convex backend queries database via schema definition (`src/shared/api/convex/schema.ts`)
5. Results returned and mapped to Todo interface (`src/features/todo/model/todo.ts`)
6. HomePage renders TodoItem components in list with loading skeleton
7. User interactions (edit/delete) trigger mutations via useTodoMutation hook
8. Mutations call Convex API (addTodo, updateTodo, deleteTodo) which update database
9. Convex real-time subscription automatically refetches and updates UI

**State Management:**

- **Component State**: Local React state via `useState` for UI-only state (isEditing, form errors)
- **Server State**: Convex provides automatic sync via `useQuery` and `useMutation` hooks
- **Form State**: Server-side validation via React's `useActionState` hook with FormState interface
- **Auth State**: Clerk manages user authentication state, propagated via `useAuth()` hook

## Key Abstractions

**Todo Feature Slice:**

- Purpose: Encapsulates all todo-related functionality (query, mutations, UI)
- Examples: `src/features/todo/`
- Pattern: Feature exports AddTodo and TodoItem UI components via barrel file

**Convex API Abstraction:**

- Purpose: Centralized backend data operations with type-safe schema
- Examples: `src/shared/api/convex/todos.ts`, `src/shared/api/convex/schema.ts`
- Pattern: Convex queries and mutations define backend operations; auto-generated types in `_generated/`

**Form Handling:**

- Purpose: Server-side validation using React 19's useActionState hook
- Examples: `src/features/todo/model/form-state.ts`, `src/features/todo/ui/add-todo/AddTodo.tsx`
- Pattern: Action functions validate formData and return FormState with error field

**UI Component Library:**

- Purpose: Reusable, unstyled primitives built on Base UI with CVA styling
- Examples: `src/shared/ui/Button/`, `src/shared/ui/Input/`, `src/shared/ui/Field/`
- Pattern: Each component in subdirectory with index.ts, uses CVA for variants

**Authentication Integration:**

- Purpose: User session management and route protection
- Pattern: ClerkProvider wraps ConvexProviderWithClerk which handles auth state
- Location: `src/app/index.tsx` (provider setup)

## Entry Points

**Application Root:**

- Location: `src/app/index.tsx`
- Triggers: Browser loads HTML referencing this script
- Responsibilities: Creates React root, mounts provider hierarchy (Clerk → Convex), renders Routes component

**Routes:**

- Location: `src/app/routes/routes.tsx`
- Triggers: Invoked by app entry point after providers initialized
- Responsibilities: Checks Clerk auth state; displays SignIn for unauthenticated users or HomePage for authenticated

**HomePage:**

- Location: `src/pages/home/ui/HomePage.tsx`
- Triggers: Rendered by Routes when user is authenticated
- Responsibilities: Fetches todos via useTodoQuery, renders header and todo list, handles loading states

## Error Handling

**Strategy:** Error boundary wrapping entire app tree with fallback UI

**Patterns:**

- **Global Error Boundary**: `src/app/providers/ErrorBoundary/ErrorBoundary.tsx` catches React rendering errors, displays error details and recovery button
- **Form Errors**: Form action handlers catch exceptions and return FormState with error string for inline display
- **API Errors**: Convex hooks handle errors implicitly; component catch blocks convert to user-facing messages
- **Logging**: Error Boundary logs to console.error for debugging

## Cross-Cutting Concerns

**Logging:**

- Console-based via console.error in error boundaries and action handlers
- No external logging service integrated

**Validation:**

- Form input validation via server-side useActionState handlers
- Schema validation in Convex backend (todos.ts) using Convex value validators
- Empty string check for todo content in AddTodo component

**Authentication:**

- Clerk manages session tokens and user identity
- ClerkProvider exposes useAuth() hook for accessing userId, isSignedIn, isLoaded state
- ConvexProviderWithClerk bridges Clerk authentication to Convex backend

**Type Safety:**

- TypeScript strict mode enabled in tsconfig
- Convex auto-generates API types in `_generated/api.d.ts`, `_generated/dataModel.d.ts`
- Todo interface defined in features layer model

---

_Architecture analysis: 2026-03-21_
