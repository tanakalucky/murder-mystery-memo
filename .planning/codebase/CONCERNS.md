# Codebase Concerns

**Analysis Date:** 2026-03-21

## Security Considerations

**Missing Authorization Checks in Convex Backend:**

- Risk: Backend mutations (`addTodo`, `updateTodo`, `deleteTodo`) do not verify the authenticated user owns the todo before modifying it. A malicious user could modify or delete another user's todos if they know the todoId.
- Files: `src/shared/api/convex/todos.ts`
- Current mitigation: Clerk authentication ensures userId is present, but mutations don't validate ownership
- Recommendations:
  - Add `getIdentity()` checks in all mutations to verify the requesting user matches the todoId's userId
  - Example fix: `const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error("Unauthenticated");`
  - Validate that the todo being edited/deleted belongs to the authenticated user

**Missing Input Validation & Constraints:**

- Risk: `content` field in todos accepts any string without length restrictions. Users could store extremely large content (e.g., gigabytes of text) or malicious strings
- Files: `src/shared/api/convex/todos.ts`, `src/shared/api/convex/schema.ts`
- Current mitigation: Valibot would normally handle this, but it's not used for Convex mutations
- Recommendations:
  - Add validators: `content: v.string().max(5000)` (or appropriate limit)
  - Add client-side validation in `AddTodo.tsx` for user feedback before submission
  - Consider sanitizing/escaping HTML to prevent XSS if content is ever rendered as HTML

**Unsafe Type Assertions:**

- Risk: Line 26 in `src/features/todo/ui/todo-item/TodoItem.tsx` uses `as Id<"todos">` to force-cast todo.id. If the id format is incorrect, this will fail silently at runtime
- Files: `src/features/todo/ui/todo-item/TodoItem.tsx` (line 26, 38)
- Current mitigation: None
- Recommendations: Remove unsafe casts; ensure types flow correctly from server through client. Use strict TypeScript checks

**Non-null Assertion on userId:**

- Risk: `const userId = useAuth().userId!;` in `src/pages/home/ui/HomePage.tsx` line 10 will crash if userId is undefined (e.g., during logout or auth transition)
- Files: `src/pages/home/ui/HomePage.tsx`
- Current mitigation: Clerk authentication guard at app level, but not explicit
- Recommendations:
  - Add explicit null check before using userId
  - Consider redirecting to login if userId is missing
  - Add suspense boundary for auth loading state

## Missing Authorization & Access Control

**No Ownership Validation on Mutations:**

- Risk: Users can theoretically modify/delete other users' todos if they can guess or intercept todoIds
- Files: `src/shared/api/convex/todos.ts` (addTodo, updateTodo, deleteTodo mutations)
- Impact: High - data integrity and privacy violation
- Fix approach:
  1. Extract authenticated userId from auth context in each mutation
  2. Verify mutations only affect todos where userId matches authenticated user
  3. Return 403 error if ownership check fails

**Query-Level Authorization Missing:**

- Risk: `getTodo` query accepts any todoId and returns the todo without verifying the requesting user owns it
- Files: `src/shared/api/convex/todos.ts` (line 17-24)
- Impact: Information disclosure - users can read other users' todos
- Fix approach: Add userId parameter to getTodo, verify ownership before returning

## Performance & Scalability Issues

**No Pagination Support:**

- Problem: `getTodos` returns all todos for a user without pagination or limits
- Files: `src/shared/api/convex/todos.ts` (line 5-15)
- Cause: No `take()` or pagination mechanism implemented
- Impact: Large todo lists (1000+ items) will load slowly, consume excessive memory, and cause performance degradation
- Improvement path:
  1. Add `limit` and `cursor` parameters to getTodos
  2. Implement cursor-based pagination
  3. Default limit to 50-100 items per page
  4. Add total count query for UI pagination indicators

**No Data Cleanup Strategy:**

- Problem: Deleted todos are permanently removed, but there's no archiving, soft deletes, or retention policy
- Files: `src/shared/api/convex/todos.ts`, `src/shared/api/convex/schema.ts`
- Impact: Accidental deletes cannot be recovered; audit trails are lost
- Improvement path: Consider adding `deletedAt` timestamp, implementing soft deletes, or archiving feature

## Fragile Areas

**Form Error Handling in AddTodo:**

- Files: `src/features/todo/ui/add-todo/AddTodo.tsx` (line 20-26)
- Why fragile: Generic `catch` block with simple error message; specific error context is lost
- Safe modification: Log full error to console for debugging; display generic user-facing message
- Test coverage: Only 3 test cases; missing edge cases like network timeouts, partial failures

**TodoItem State Mutation During Edit:**

- Files: `src/features/todo/ui/todo-item/TodoItem.tsx` (line 16, 42, 66)
- Why fragile: Uses local `isEditing` state combined with `useActionState` to manage edit flow; state can become out of sync if mutation fails
- Safe modification:
  1. Use optimistic updates to pre-update UI
  2. Add revert on failure
  3. Disable form during submission to prevent double-submits
- Test coverage: TodoItem has 11+ tests but missing concurrent edit scenarios

**Error Boundary Missing Specific Error Types:**

- Files: `src/app/providers/ErrorBoundary/ErrorBoundary.tsx` (line 9-14)
- Why fragile: Treats all errors identically; doesn't distinguish between network errors, auth errors, and application errors
- Safe modification:
  1. Add error type detection (e.g., is it a network error?)
  2. Show context-specific recovery suggestions
  3. Add retry logic for transient failures

## Test Coverage Gaps

**No Authorization Tests:**

- What's not tested: Backend authorization checks (none exist). Cannot verify that users cannot access/modify other users' todos
- Files: `src/shared/api/convex/todos.ts`
- Risk: Authorization bugs will reach production undetected
- Priority: High - add tests immediately:
  1. Write unit tests for mutation authorization
  2. Write integration tests for cross-user access attempts
  3. Add E2E tests for end-to-end auth flows

**HomePage Component Lacks Tests:**

- What's not tested: Loading states, error handling, empty list rendering, list rendering with many items
- Files: `src/pages/home/ui/HomePage.tsx`
- Risk: UI bugs in main user-facing page will be caught only in manual testing
- Priority: Medium - add tests for:
  1. Loading skeleton display
  2. Empty state rendering
  3. List rendering with varying item counts
  4. Error state handling

**Convex Query/Mutation Tests Missing:**

- What's not tested: Backend business logic, data persistence, edge cases
- Files: `src/shared/api/convex/todos.ts`
- Risk: Data consistency issues, query performance problems go undetected
- Priority: Medium - create test utilities for Convex operations

**E2E Test Coverage Minimal:**

- What's not tested: Full user workflows, multi-step operations, cross-component interactions
- Files: `e2e/todo.spec.ts` (exists but limited scope)
- Risk: Integration bugs and workflows that work in dev but fail in production
- Priority: Medium

## Tech Debt

**Console.error Statements in Production Code:**

- Issue: Two console.error calls left in source code for debugging
- Files:
  - `src/app/providers/ErrorBoundary/ErrorBoundary.tsx` (line 44)
  - `src/features/todo/ui/add-todo/AddTodo.tsx` (line 25)
- Impact: Creates noise in production logs; should use structured logging or error tracking service
- Fix approach: Replace with error tracking service (Sentry, LogRocket) or structured logging

**Magic Strings & Hardcoded Values:**

- Issue: Validation messages and labels hardcoded throughout components (Japanese strings scattered across UI)
- Files:
  - `src/features/todo/ui/add-todo/AddTodo.tsx` (lines 20, 26)
  - `src/features/todo/ui/todo-item/TodoItem.tsx` (lines 30, 45)
  - `src/pages/home/ui/HomePage.tsx` (lines 41, 42, 57)
- Impact: Difficult to maintain, update, or translate
- Fix approach: Centralize all user-facing strings in i18n/constants file

**Overly Complex Component Props Types:**

- Issue: `Field.tsx` and `Item.tsx` use complex CVA variant systems that are somewhat difficult to understand and maintain
- Files:
  - `src/shared/ui/Field/Field.tsx` (line 52-65)
  - `src/shared/ui/Item/Item.tsx` (line 34-54)
- Impact: New developers need to understand CVA pattern; props become verbose
- Fix approach: Document variants clearly; consider extracting variant definitions to separate files

**Missing Error Boundary Coverage:**

- Issue: Error boundary only wraps top-level app; inner components (pages, features) don't have granular error boundaries
- Files: `src/app/index.tsx`, `src/app/providers/ErrorBoundary/ErrorBoundary.tsx`
- Impact: Single error in any page crashes entire app; users lose all data
- Fix approach: Add error boundaries at page and feature levels for granular error recovery

## Dependencies at Risk

**Clerk Authentication Non-null Assertion Risk:**

- Risk: Heavy reliance on `useAuth()` returning userId without null checks; if Clerk state is corrupted or auth session expires mid-render, app crashes
- Impact: Production crash during logout or session refresh
- Migration plan: Always null-check auth state; use error boundary to catch auth-related crashes

**Convex Real-time Subscription Not Implemented:**

- Risk: Using manual query fetching instead of real-time subscriptions; multiple users editing todos won't see updates until refresh
- Impact: Collaborative editing not supported; data consistency unclear in multi-client scenarios
- Migration plan:
  1. Migrate to Convex real-time subscriptions
  2. Add conflict resolution for concurrent edits
  3. Implement optimistic updates

## Missing Critical Features

**No Confirmation Dialog on Delete:**

- Problem: Deleting todos has no confirmation step; user can accidentally delete with single click
- Blocks: Prevents safe production deployment for non-technical users
- Recommended fix: Add confirmation dialog before deleteTodo mutation

**No Edit History / Audit Trail:**

- Problem: Cannot track who changed what when; important for debugging and compliance
- Blocks: Data audit requirements; debugging user-reported issues
- Recommended fix: Add `updatedAt`, `createdAt` timestamps and consider edit history table

**No Bulk Operations:**

- Problem: Only single item operations supported; cannot bulk edit, delete, or reorder todos
- Blocks: Power users cannot efficiently manage large todo lists
- Recommended fix: Add select mode and bulk operations (delete selected, mark complete in bulk)

---

_Concerns audit: 2026-03-21_
