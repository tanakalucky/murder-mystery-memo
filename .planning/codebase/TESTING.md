# Testing Patterns

**Analysis Date:** 2026-03-21

## Test Framework

**Runner:**

- Vitest 4.1.0 (with two project configurations)
- Playwright 1.58.2 (for E2E testing)
- Config: `vite.config.ts` (contains both unit and browser test projects)

**Assertion Library:**

- Vitest built-in expect API
- Playwright test assertions (e.g., `expect(element).toContainText()`)

**Run Commands:**

```bash
bun run test                        # Run all tests (unit + browser + e2e)
                                    # Internally: vitest --project unit & vitest --project browser & playwright test
bun run typecheck                   # Type checking before tests
bun run lint                        # Linting with auto-fix
```

## Test File Organization

**Location:**

- Unit tests: Co-located with source files (`.unit.test.ts` suffix)
- Browser tests: Co-located with components (`.browser.test.tsx` suffix)
- E2E tests: Separate directory `e2e/` with `.spec.ts` suffix

**Naming:**

- `ComponentName.browser.test.tsx` - Browser/integration tests for React components
- `filename.unit.test.ts` - Unit tests for utilities/functions
- `feature.spec.ts` - E2E tests in `e2e/` directory

**Current test files in project:**

- `src/features/todo/ui/add-todo/AddTodo.browser.test.tsx`
- `src/features/todo/ui/todo-item/TodoItem.browser.test.tsx`
- `e2e/todo.spec.ts`
- `e2e/global.setup.ts` (authentication setup)

## Test Structure

**Suite Organization:**

Browser test example from `AddTodo.browser.test.tsx`:

```typescript
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

import { useTodoMutation } from "../../lib/use-todo-mutation";
import { AddTodo } from "./AddTodo";

vi.mock("@clerk/react", () => ({
  useAuth: vi.fn().mockReturnValue({ userId: "user123" }),
}));

vi.mock("../../lib/use-todo-mutation", () => ({
  useTodoMutation: vi.fn().mockReturnValue({ addTodo: vi.fn() }),
}));

const mockUseTodoMutation = vi.mocked(useTodoMutation);

describe("AddTodo", async () => {
  it("追加ボタン押下でTodoが追加されること", async () => {
    // Arrange
    const mockAddTodo = vi.fn().mockResolvedValue({});

    mockUseTodoMutation.mockReturnValue({
      addTodo: mockAddTodo as unknown as ReturnType<typeof useTodoMutation>["addTodo"],
      // ... other mocked functions
    });

    const screen = await render(<AddTodo />);

    // Act & Assert
    const addButton = screen.getByRole("button", { name: "追加" });
    const input = screen.getByLabelText("TODO");
    await input.fill("アプリを作る");
    await userEvent.click(addButton);

    expect(mockAddTodo).toHaveBeenCalledWith({
      content: "アプリを作る",
      userId: "user123",
    });
  });
});
```

**Patterns:**

- Arrange-Act-Assert pattern (comments clearly mark sections)
- `describe()` for grouping related tests
- Nested `describe()` for test organization (e.g., "TODOの編集", "TODOの削除")
- One assertion per test (sometimes multiple related assertions for same feature)
- Async/await for async operations

**E2E test example from `e2e/todo.spec.ts`:**

```typescript
import { expect, test } from "@playwright/test";

test.describe("TODOアプリ", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Delete all TODOs before each test
    await page.goto("/");
    const list = page.getByRole("list");
    await list.waitFor();

    const items = await list.getByRole("listitem").all();
    for (const item of items) {
      const deleteButton = item.getByRole("button", { name: /削除/i });
      await deleteButton.click();
    }
  });

  test("TODOの追加、編集、削除ができる", async ({ page }) => {
    // Arrange-Act-Assert flow
    const list = page.getByRole("list");
    await list.waitFor();

    // Add TODO
    await page.getByLabel("TODO").fill("新しいTODO");
    await page.getByRole("button", { name: /追加/i }).click();

    const newItem = page.getByRole("listitem").last();
    await expect(newItem).toContainText("新しいTODO");

    // Edit TODO
    // Delete TODO
  });
});
```

## Mocking

**Framework:** Vitest's `vi` module with `vi.mock()`, `vi.fn()`, `vi.mocked()`

**Patterns:**

Mocking hooks at module level:

```typescript
vi.mock("@clerk/react", () => ({
  useAuth: vi.fn().mockReturnValue({ userId: "user123" }),
}));

vi.mock("../../lib/use-todo-mutation", () => ({
  useTodoMutation: vi.fn().mockReturnValue({ addTodo: vi.fn() }),
}));

const mockUseTodoMutation = vi.mocked(useTodoMutation);
```

Per-test mock customization:

```typescript
const mockAddTodo = vi.fn().mockResolvedValue({});
const mockAddTodoReject = vi.fn().mockRejectedValue(new Error("TODO追加エラー"));

mockUseTodoMutation.mockReturnValue({
  addTodo: mockAddTodo as unknown as ReturnType<typeof useTodoMutation>["addTodo"],
  deleteTodo: vi.fn() as unknown as ReturnType<typeof useTodoMutation>["deleteTodo"],
  editTodo: vi.fn() as unknown as ReturnType<typeof useTodoMutation>["editTodo"],
});
```

**What to Mock:**

- External dependencies (Clerk auth, Convex mutations)
- Custom hooks that have side effects
- HTTP/API calls via mutations
- Any third-party services

**What NOT to Mock:**

- Core React utilities (useState, useCallback, etc.)
- Built-in DOM methods that testing libraries provide
- UI components being tested
- Utils and helper functions (test the real implementation)

## Fixtures and Factories

**Test Data:**

Simple inline test data from `TodoItem.browser.test.tsx`:

```typescript
const screen = await render(
  <TodoItem todo={{ id: "test-id", content: "アプリを作る" }} />
);
```

Form state structure (from `src/features/todo/model/form-state.ts`):

```typescript
export interface FormState {
  error?: string;
}
```

**Location:**

- Test data defined inline within test files
- Reusable interfaces/types in `model/` directories (e.g., `form-state.ts`)
- No separate fixture files yet (project is small scale)

## Coverage

**Requirements:** Not enforced in current configuration

**View Coverage:**

- No explicit coverage command in package.json
- Tests run with `bun run test` but no coverage report generated
- To add coverage: would need to configure in vitest test project

## Test Types

**Unit Tests (not heavily used yet):**

- Would use `.unit.test.ts` suffix
- Test utilities, helpers, type guards
- Environment: `node` (not browser)
- None currently visible in project

**Browser/Integration Tests (primary test type):**

- Scope: Test React components in browser-like environment
- File pattern: `**/*.browser.test.{ts,tsx}`
- Vitest browser project with Playwright provider
- Uses `vitest-browser-react` for React rendering
- Tests user interactions, form submission, state changes

**E2E Tests (critical path testing):**

- Framework: Playwright (separate from Vitest)
- Scope: Full application workflows with real backend
- Location: `e2e/` directory (separate from src)
- Setup: `global.setup.ts` handles authentication
  - Logs in test user via Clerk
  - Saves auth state to `e2e/.auth/user.json`
- Tests: Full TODO CRUD operations end-to-end
- Runs after dev server starts (configured in `playwright.config.ts`)

## Common Patterns

**Async Testing (Browser tests):**

```typescript
it("追加ボタン押下でTodoが追加されること", async () => {
  const screen = await render(<AddTodo />);

  const input = screen.getByLabelText("TODO");
  await input.fill("アプリを作る");

  const addButton = screen.getByRole("button", { name: "追加" });
  await userEvent.click(addButton);

  expect(mockAddTodo).toHaveBeenCalledWith({
    content: "アプリを作る",
    userId: "user123",
  });
});
```

**Error Testing:**

```typescript
it("入力内容が空の場合はエラーが表示され、追加されないこと", async () => {
  const screen = await render(<AddTodo />);

  const input = screen.getByLabelText("TODO");
  await input.fill("");

  const addButton = screen.getByRole("button", { name: "追加" });
  await userEvent.click(addButton);

  await expect.element(screen.getByRole("alert")).toHaveTextContent("TODOを入力してください");
  expect(mockAddTodo).not.toHaveBeenCalled();
});
```

**Error scenarios testing:**

```typescript
it("TODO追加エラー時にエラーが表示され、追加されないこと", async () => {
  const mockAddTodo = vi.fn().mockRejectedValue(new Error("TODO追加エラー"));

  mockUseTodoMutation.mockReturnValue({
    addTodo: mockAddTodo as unknown as ReturnType<typeof useTodoMutation>["addTodo"],
    // ... other mocked functions
  });

  const screen = await render(<AddTodo />);

  const input = screen.getByLabelText("TODO");
  await input.fill("アプリを作る");

  const addButton = screen.getByRole("button", { name: "追加" });
  await userEvent.click(addButton);

  expect(mockAddTodo).toHaveBeenCalled();

  await expect.element(screen.getByRole("alert")).toHaveTextContent("TODOの追加に失敗しました");
});
```

**Form submission testing pattern:**

- Test uses `userEvent.click()` for button clicks
- Tests verify both success and error paths
- Assert on mocked function calls with expected arguments
- Assert on rendered error messages via `getByRole("alert")`

**E2E cleanup pattern:**

```typescript
test.beforeEach(async ({ page }) => {
  // Arrange: Clean up state before each test
  await page.goto("/");

  const list = page.getByRole("list");
  await list.waitFor();

  const items = await list.getByRole("listitem").all();
  for (const item of items) {
    await item.getByRole("button", { name: /削除/i }).click();
  }
});
```

**DOM Query patterns:**

- `getByRole()` - Primary method (accessible queries)
- `getByLabelText()` - For form inputs
- `getByText()` / `toContainText()` - For text content
- `toBeInTheDocument()` - Existence assertions
- `toHaveBeenCalled()` - Mock assertions

## Test Project Configuration

**Vitest projects (from `vite.config.ts`):**

1. **Unit project:**
   - Name: `unit`
   - Environment: `node`
   - Includes: `**/*.unit.test.{ts,tsx}`
   - Globals: true (describe/it/expect available without imports)

2. **Browser project:**
   - Name: `browser`
   - Environment: Playwright (chromium)
   - Includes: `**/*.browser.test.{ts,tsx}`
   - Globals: true
   - Headless: true
   - No screenshot failures

**Playwright configuration (from `playwright.config.ts`):**

- Test directory: `e2e/`
- Base URL: `http://localhost:5173`
- Projects: `setup` (global auth) + `chromium` (browser)
- Auto-start dev server before tests
- Retry on CI only (2 retries)
- HTML reporter
- Authentication state saved/restored per test

---

_Testing analysis: 2026-03-21_
