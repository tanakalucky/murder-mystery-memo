# 開発フロー

**すべてのパッケージ管理とスクリプト実行コマンドには、`npm`、`npx`、`yarn`の代わりに常に`bun`と`bunx`を使用すること。**

# 1.変更を加える

bun run ui:add <ComponentName> # shadcnのコンポーネントをコードベースに追加

# 2.型チェック

bun run typecheck

# 3.テスト実行

bun run test

# 4.ブラウザ動作確認（探索的テスト）

自動テストで検出しにくい問題を発見するため、変更箇所に関連する画面をブラウザで確認する。

## 開発サーバーの起動

### 1. 起動状態の確認

`lsof -i :5173` でポート5173が使用中か確認する。

### 2. 未起動の場合はバックグラウンドで起動

`bun run dev` をBashツールの `run_in_background` オプションで実行する。

### 3. 準備完了の確認

`curl -s -o /dev/null -w '%{http_code}' http://localhost:5173` を実行し、HTTPステータスコード200が返ることを確認する。
起動直後はサーバーの準備が完了していない場合があるため、200が返るまで数秒待って再試行する。

## チェックリスト

- [ ] **表示確認**: 変更に関連するページが正しく表示されること（スクリーンショットで目視確認）
- [ ] **操作確認**: ボタンクリック・フォーム入力・画面遷移など、ユーザー操作が期待通り動作すること
- [ ] **コンソール確認**: ブラウザコンソールにエラーや警告が出力されていないこと
- [ ] **ネットワーク確認**: APIリクエストが正常に完了し、期待するレスポンスが返ること

バグを発見した場合はその場で修正し、ステップ2（型チェック）から再実行する。

# 5.コミット前

bun run lint

# 6.PR作成前

bun run lint && bun run test

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Murder Mystery Memo**

マーダーミステリーゲームのプレイ中にリアルタイムでメモを取るためのWebアプリ。探偵のノートをイメージしたダークノワール調のUIで、キャンバス上にメモを自由配置・編集できる。PCブラウザでの使用を想定し、バックエンドは不要でlocalStorageにデータを永続化する。

**Core Value:** キャンバス上でメモを直感的に追加・配置・編集でき、ゲームプレイを中断せずに情報を整理できること。

### Constraints

- **Tech stack**: @xyflow/react（React Flow v12）でキャンバス実装 — 仕様指定
- **Tech stack**: localStorage のみでデータ永続化 — バックエンド不要の要件
- **Platform**: PCブラウザ専用 — モバイル対応不要
- **Architecture**: Feature-Sliced Design — 既存アーキテクチャ継続
- **Package manager**: bun — 既存環境継続
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 - All source code, build configuration, and scripts
- JSX/TSX - React components throughout the application
- JavaScript - Some configuration files and scripts
## Runtime
- Node.js (no specific version enforced; Bun used as package manager)
- Bun - Primary runtime and package manager
- Lockfile: `bun.lockb` (implied through bun usage)
## Frameworks
- React 19.2.4 - UI framework and component system
- Vite 8.0.1 - Build tool and development server
- TypeScript 5.9.3 - Static type checking
- Convex 1.34.0 - Backend-as-a-service, provides database, queries, mutations
- Cloudflare Workers - Runtime deployment platform via wrangler
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- @tailwindcss/vite 4.2.2 - Vite plugin for Tailwind
- shadcn 4.1.0 - Component library system
- @base-ui/react 1.3.0 - Headless UI primitives
- lucide-react 0.577.0 - Icon library
- class-variance-authority 0.7.1 - CSS class composition utility
- tailwind-merge 3.5.0 - Merge Tailwind CSS classes intelligently
- next-themes 0.4.6 - Dark mode theme management
- wouter 3.9.0 - Lightweight client-side router
- @clerk/react 6.1.2 - Authentication and user management UI
- @clerk/testing 2.0.6 - Testing utilities for Clerk
- valibot 1.3.1 - Schema validation library
- ts-pattern 5.9.0 - Pattern matching for TypeScript
- react-error-boundary 6.1.1 - Error boundary component wrapper
- @fontsource-variable/noto-sans 5.2.10 - Variable font import
## Testing
- vitest 4.1.0 - Vitest testing framework (unit and browser projects)
- @vitest/ui 4.1.0 - Visual UI for test results
- @vitest/browser-playwright 4.1.0 - Browser testing provider
- vitest-browser-react 2.1.0 - React testing utilities for vitest browser
- @playwright/test 1.58.2 - Playwright end-to-end testing
- playwright 1.58.2 - Playwright browser automation library
## Build & Development Tools
- oxlint 1.56.0 - Rust-based linter (replaces ESLint)
- oxfmt 0.41.0 - Rust-based code formatter
- oxlint-tsgolint 0.17.1 - TypeScript/Go-specific linting rules
- eslint-plugin-better-tailwindcss 4.3.2 - Tailwind CSS linting rules
- @typescript/native-preview 7.0.0-dev.20260320.1 - Native TypeScript preview (experimental)
- bun tsgo - TypeScript compiler integration with Bun
- @vitejs/plugin-react 6.0.1 - React support for Vite
- @cloudflare/vite-plugin 1.30.0 - Cloudflare Workers Vite integration
- @dotenvx/dotenvx 1.57.0 - Environment variable management
- wrangler 4.76.0 - Cloudflare CLI for Workers deployment
- lefthook 2.1.4 - Git hook manager
- tw-animate-css 1.4.0 - Tailwind animation utilities
## Configuration
- Managed via dotenvx with `.env.dev` and `.env.prod` files
- Key env vars: `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_ISSUER_DOMAIN`
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - References `tsconfig.app.json`
- `tsconfig.app.json` - Main TypeScript configuration
- `playwright.config.ts` - E2E test configuration
- `wrangler.jsonc` - Cloudflare Workers configuration
## Package Scripts
## Platform Requirements
- Bun runtime (primary package manager)
- Node.js compatible environment (for wrangler and testing)
- Cloudflare account (for Workers deployment)
- Clerk account (for authentication)
- Convex account (for database and backend)
- Cloudflare Workers deployment platform
- Clerk authentication service
- Convex backend service
## Key Architectural Decisions
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Component files: PascalCase (e.g., `AddTodo.tsx`, `TodoItem.tsx`)
- Utility/hook files: camelCase (e.g., `use-todo-mutation.ts`, `use-todo-query.ts`)
- Type/interface files: camelCase with descriptive names (e.g., `form-state.ts`, `todo.ts`)
- Test files: Same name as component + `.browser.test.tsx` or `.unit.test.ts` suffix
- E2E test files: `.spec.ts` suffix (e.g., `todo.spec.ts`)
- Component functions: PascalCase (e.g., `AddTodo`, `ErrorBoundary`, `TodoItem`)
- Hook functions: camelCase with `use` prefix (e.g., `useTodoMutation`, `useAuth`)
- Helper functions: camelCase (e.g., `getErrorMessage`, `cn`)
- Callbacks: camelCase with descriptive intent (e.g., `resetErrorBoundary`, `setIsEditing`)
- State/constants: camelCase (e.g., `isEditing`, `isPending`, `userId`)
- UI Props/element references: camelCase (e.g., `mockAddTodo`, `mockEditTodo`)
- Type names in destructuring: PascalCase (e.g., `{ userId }`, `{ error }`)
- Interfaces: PascalCase (e.g., `Props`, `FormState`, `FallbackProps`)
- Union/complex types: PascalCase (e.g., `ReturnType`)
- Generic type parameters: Single uppercase letters or descriptive names (e.g., `FormState`, `T`)
## Code Style
- Tool: `oxfmt` (Rust-based formatter) - configured for format command
- Linting: `oxlint --type-aware` (with automatic fix via `--fix` flag)
- Line width: Standard (enforced by oxfmt, typically 100-120 chars)
- Indentation: 2 spaces (standard for TypeScript/React)
- Strict TypeScript mode enabled (`strict: true`)
- No unused locals or parameters allowed (`noUnusedLocals: true`, `noUnusedParameters: true`)
- No fallthrough cases in switch statements
- No unchecked side effect imports
- `type-aware` linting enabled for advanced checks
## Import Organization
- `@/*` → `src/*` - Use for cross-slice/cross-layer imports
- Within a feature slice (e.g., `features/todo/`), use relative paths only to avoid barrel file performance issues
- Example: `import { useAuth } from "../model/useAuth"` (not `@/features/auth`)
## Error Handling
- Try-catch blocks around API calls and mutations
- Error messages returned as part of form state (e.g., `{ error: string }`)
- Errors logged with `console.error()` including context description
- Error boundaries for component-level error catching
## Logging
- `console.error()` for error conditions only
- Include descriptive context message alongside error object
- Example: `console.error("TODOの追加に失敗しました", error)`
- Reserved for error boundaries and significant failures, not debug logging
## Comments
- Complex error handling logic
- Non-obvious business logic (especially related to form state management)
- Context about why a particular approach was chosen
- Comments should be Japanese to match codebase language
- Not extensively used in this codebase
- Type annotations preferred over JSDoc comments
- Interfaces and types are self-documenting
## Function Design
- Props destructured in function signature for React components
- Named parameters for functions (avoid long parameter lists)
- Use of typed objects for related parameters
- Components return JSX (or `null`/`undefined` for conditional rendering)
- Hooks return objects with named properties (e.g., `{ addTodo, editTodo, deleteTodo }`)
- Form actions return state objects with error property (e.g., `{ error?: string }`)
## Module Design
- Each slice has a `index.ts` file (Public API)
- Public API re-exports only public interfaces/components
- Internal implementation files not directly imported from outside
- Used at slice level (`features/auth/index.ts`) for public API
- NOT used at segment level (`features/auth/ui/index.ts`) to avoid performance issues
- Each UI component/utility has own `index.ts` in shared layer
## TypeScript-Specific
- `noEmit: true` - TypeScript is type-check only, not compiled
- `allowImportingTsExtensions: true` - Can import `.ts` files directly
- `noUncheckedSideEffectImports: true` - Prevents importing modules with side effects without explicit imports
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Layered architecture with 7 layers ordered by responsibility (app → pages → widgets → features → entities → shared)
- Business domain slicing within each layer
- Strict dependency flow enforced (upper layers depend only on lower layers)
- Public API pattern via `index.ts` for controlled exports
- Cross-slice dependencies prohibited within same layer
## Layers
- Purpose: Application bootstrap, global configuration, and entry point
- Location: `src/app/`
- Contains: React root setup, provider hierarchy, routing configuration, global styles, error boundaries
- Depends on: All other layers (pages, features, shared, providers)
- Used by: Browser via DOM element with id "root"
- Purpose: Full-screen page components that compose features and widgets
- Location: `src/pages/`
- Contains: Route-level components (HomePage), page-specific layout
- Depends on: features, widgets, shared
- Used by: Routes (app/routes/routes.tsx)
- Purpose: Large self-contained UI blocks combining multiple features
- Location: `src/widgets/`
- Contains: Header component (integrates UserButton from Clerk)
- Depends on: shared, features (via composition)
- Used by: Pages
- Purpose: Concrete user-executable business functions (CRUD operations, form submission)
- Location: `src/features/`
- Contains: Business logic, mutations, queries, UI components, models
- Depends on: entities, shared, API services
- Used by: Pages, widgets
- Purpose: Project-wide reusable utilities, components, and API configuration
- Location: `src/shared/`
- Contains: UI primitives (Button, Input, Field), library functions (cn utility), API setup
- Depends on: Only external dependencies
- Used by: All layers above
## Data Flow
- **Component State**: Local React state via `useState` for UI-only state (isEditing, form errors)
- **Server State**: Convex provides automatic sync via `useQuery` and `useMutation` hooks
- **Form State**: Server-side validation via React's `useActionState` hook with FormState interface
- **Auth State**: Clerk manages user authentication state, propagated via `useAuth()` hook
## Key Abstractions
- Purpose: Encapsulates all todo-related functionality (query, mutations, UI)
- Examples: `src/features/todo/`
- Pattern: Feature exports AddTodo and TodoItem UI components via barrel file
- Purpose: Centralized backend data operations with type-safe schema
- Examples: `src/shared/api/convex/todos.ts`, `src/shared/api/convex/schema.ts`
- Pattern: Convex queries and mutations define backend operations; auto-generated types in `_generated/`
- Purpose: Server-side validation using React 19's useActionState hook
- Examples: `src/features/todo/model/form-state.ts`, `src/features/todo/ui/add-todo/AddTodo.tsx`
- Pattern: Action functions validate formData and return FormState with error field
- Purpose: Reusable, unstyled primitives built on Base UI with CVA styling
- Examples: `src/shared/ui/Button/`, `src/shared/ui/Input/`, `src/shared/ui/Field/`
- Pattern: Each component in subdirectory with index.ts, uses CVA for variants
- Purpose: User session management and route protection
- Pattern: ClerkProvider wraps ConvexProviderWithClerk which handles auth state
- Location: `src/app/index.tsx` (provider setup)
## Entry Points
- Location: `src/app/index.tsx`
- Triggers: Browser loads HTML referencing this script
- Responsibilities: Creates React root, mounts provider hierarchy (Clerk → Convex), renders Routes component
- Location: `src/app/routes/routes.tsx`
- Triggers: Invoked by app entry point after providers initialized
- Responsibilities: Checks Clerk auth state; displays SignIn for unauthenticated users or HomePage for authenticated
- Location: `src/pages/home/ui/HomePage.tsx`
- Triggers: Rendered by Routes when user is authenticated
- Responsibilities: Fetches todos via useTodoQuery, renders header and todo list, handles loading states
## Error Handling
- **Global Error Boundary**: `src/app/providers/ErrorBoundary/ErrorBoundary.tsx` catches React rendering errors, displays error details and recovery button
- **Form Errors**: Form action handlers catch exceptions and return FormState with error string for inline display
- **API Errors**: Convex hooks handle errors implicitly; component catch blocks convert to user-facing messages
- **Logging**: Error Boundary logs to console.error for debugging
## Cross-Cutting Concerns
- Console-based via console.error in error boundaries and action handlers
- No external logging service integrated
- Form input validation via server-side useActionState handlers
- Schema validation in Convex backend (todos.ts) using Convex value validators
- Empty string check for todo content in AddTodo component
- Clerk manages session tokens and user identity
- ClerkProvider exposes useAuth() hook for accessing userId, isSignedIn, isLoaded state
- ConvexProviderWithClerk bridges Clerk authentication to Convex backend
- TypeScript strict mode enabled in tsconfig
- Convex auto-generates API types in `_generated/api.d.ts`, `_generated/dataModel.d.ts`
- Todo interface defined in features layer model
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
