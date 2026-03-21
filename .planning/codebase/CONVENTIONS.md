# Coding Conventions

**Analysis Date:** 2026-03-21

## Naming Patterns

**Files:**

- Component files: PascalCase (e.g., `AddTodo.tsx`, `TodoItem.tsx`)
- Utility/hook files: camelCase (e.g., `use-todo-mutation.ts`, `use-todo-query.ts`)
- Type/interface files: camelCase with descriptive names (e.g., `form-state.ts`, `todo.ts`)
- Test files: Same name as component + `.browser.test.tsx` or `.unit.test.ts` suffix
- E2E test files: `.spec.ts` suffix (e.g., `todo.spec.ts`)

**Functions:**

- Component functions: PascalCase (e.g., `AddTodo`, `ErrorBoundary`, `TodoItem`)
- Hook functions: camelCase with `use` prefix (e.g., `useTodoMutation`, `useAuth`)
- Helper functions: camelCase (e.g., `getErrorMessage`, `cn`)
- Callbacks: camelCase with descriptive intent (e.g., `resetErrorBoundary`, `setIsEditing`)

**Variables:**

- State/constants: camelCase (e.g., `isEditing`, `isPending`, `userId`)
- UI Props/element references: camelCase (e.g., `mockAddTodo`, `mockEditTodo`)
- Type names in destructuring: PascalCase (e.g., `{ userId }`, `{ error }`)

**Types:**

- Interfaces: PascalCase (e.g., `Props`, `FormState`, `FallbackProps`)
- Union/complex types: PascalCase (e.g., `ReturnType`)
- Generic type parameters: Single uppercase letters or descriptive names (e.g., `FormState`, `T`)

## Code Style

**Formatting:**

- Tool: `oxfmt` (Rust-based formatter) - configured for format command
- Linting: `oxlint --type-aware` (with automatic fix via `--fix` flag)
- Line width: Standard (enforced by oxfmt, typically 100-120 chars)
- Indentation: 2 spaces (standard for TypeScript/React)

**Key Linting Rules:**

- Strict TypeScript mode enabled (`strict: true`)
- No unused locals or parameters allowed (`noUnusedLocals: true`, `noUnusedParameters: true`)
- No fallthrough cases in switch statements
- No unchecked side effect imports
- `type-aware` linting enabled for advanced checks

**Linting Commands:**

```bash
bun run lint           # oxlint with --type-aware and --fix
bun run lint:ci        # oxlint --type-aware (no auto-fix, for CI)
bun run format         # oxfmt (code formatting)
bun run typecheck      # bun tsgo --noEmit (type checking)
```

## Import Organization

**Order:**

1. External libraries/node modules (e.g., `react`, `@clerk/react`, `convex/react`)
2. Type imports from external libraries (e.g., `type FallbackProps`)
3. Internal imports using alias `@/` (e.g., `@/shared/ui/Button`)
4. Relative imports for same-slice code (same feature/domain) - relative paths only

**Path Aliases:**

- `@/*` → `src/*` - Use for cross-slice/cross-layer imports

**Important: Same-slice imports:**

- Within a feature slice (e.g., `features/todo/`), use relative paths only to avoid barrel file performance issues
- Example: `import { useAuth } from "../model/useAuth"` (not `@/features/auth`)

**Actual example from codebase:**

```typescript
// src/features/todo/ui/add-todo/AddTodo.tsx
import { useAuth } from "@clerk/react";
import { Plus } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/shared/ui/Button";
import { Field, FieldError } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";

import { useTodoMutation } from "../../lib/use-todo-mutation"; // relative within slice
import { FormState } from "../../model/form-state"; // relative within slice
```

## Error Handling

**Patterns:**

- Try-catch blocks around API calls and mutations
- Error messages returned as part of form state (e.g., `{ error: string }`)
- Errors logged with `console.error()` including context description
- Error boundaries for component-level error catching

**Example from ErrorBoundary:**

```typescript
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const onError = (error: unknown) => {
  console.error("ErrorBoundary caught an error:", error);
};
```

**Form error handling pattern:**

```typescript
const [state, action, isPending] = useActionState<FormState, FormData>(async (_, formData) => {
  const content = formData.get("content") as string;
  if (!content) return { error: "TODOを入力してください" };

  try {
    await addTodo({ content: content.trim(), userId });
  } catch (error) {
    console.error("TODOの追加に失敗しました", error);
    return { error: "TODOの追加に失敗しました" };
  }

  return {};
}, {});
```

## Logging

**Framework:** `console` (built-in, no external logging library)

**Patterns:**

- `console.error()` for error conditions only
- Include descriptive context message alongside error object
- Example: `console.error("TODOの追加に失敗しました", error)`
- Reserved for error boundaries and significant failures, not debug logging

## Comments

**When to Comment:**

- Complex error handling logic
- Non-obvious business logic (especially related to form state management)
- Context about why a particular approach was chosen
- Comments should be Japanese to match codebase language

**JSDoc/TSDoc:**

- Not extensively used in this codebase
- Type annotations preferred over JSDoc comments
- Interfaces and types are self-documenting

## Function Design

**Size:** Keep functions under 30 lines when possible; complex components broken into smaller pieces

**Parameters:**

- Props destructured in function signature for React components
- Named parameters for functions (avoid long parameter lists)
- Use of typed objects for related parameters

**Return Values:**

- Components return JSX (or `null`/`undefined` for conditional rendering)
- Hooks return objects with named properties (e.g., `{ addTodo, editTodo, deleteTodo }`)
- Form actions return state objects with error property (e.g., `{ error?: string }`)

**Example:**

```typescript
// Hook with named return object
export const useTodoMutation = () => {
  const addTodo = useMutation(convexApi.todos.addTodo);
  const editTodo = useMutation(convexApi.todos.updateTodo);
  const deleteTodo = useMutation(convexApi.todos.deleteTodo);

  return { addTodo, editTodo, deleteTodo };
};

// Component with destructured props
export const AddTodo = () => {
  const { userId } = useAuth();
  if (!userId) return;

  // ... rest of component
};
```

## Module Design

**Exports:**

- Each slice has a `index.ts` file (Public API)
- Public API re-exports only public interfaces/components
- Internal implementation files not directly imported from outside

**Example from `features/todo/index.ts` pattern:**

```typescript
// Public API - what external slices can import
export { AddTodo } from "./ui/AddTodo";
export { TodoItem } from "./ui/TodoItem";
export { useTodoMutation } from "./lib/use-todo-mutation";
export type { Todo } from "./model/todo";
```

**Barrel Files (index.ts):**

- Used at slice level (`features/auth/index.ts`) for public API
- NOT used at segment level (`features/auth/ui/index.ts`) to avoid performance issues
- Each UI component/utility has own `index.ts` in shared layer
  - `shared/ui/Button/index.ts` exports only Button
  - `shared/ui/Input/index.ts` exports only Input
  - (NOT a single `shared/ui/index.ts` for all)

## TypeScript-Specific

**Target:** ES2020
**JSX:** react-jsx
**Module Resolution:** bundler
**Strict Mode:** All strict checks enabled

**Important flags:**

- `noEmit: true` - TypeScript is type-check only, not compiled
- `allowImportingTsExtensions: true` - Can import `.ts` files directly
- `noUncheckedSideEffectImports: true` - Prevents importing modules with side effects without explicit imports

---

_Convention analysis: 2026-03-21_
