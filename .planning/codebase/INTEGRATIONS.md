# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**Authentication & User Management:**

- Clerk - Authentication, user identity, and session management
  - SDK/Client: `@clerk/react` 6.1.2
  - Testing: `@clerk/testing` 2.0.6
  - Auth: `VITE_CLERK_PUBLISHABLE_KEY` (public key for client)
  - Auth: `CLERK_JWT_ISSUER_DOMAIN` (for Convex JWT validation)

**Backend & Database:**

- Convex - Backend-as-a-service platform handling database, queries, mutations, and real-time sync
  - SDK/Client: `convex` 1.34.0
  - Auth: `VITE_CONVEX_URL` (Convex deployment URL)
  - Implementation: `src/shared/api/convex/` - Convex backend code
  - Database client: ConvexReactClient (in `src/app/index.tsx`)

## Data Storage

**Databases:**

- Convex Database
  - Type: Managed cloud database (JSON-based)
  - Client: ConvexReactClient (React SDK)
  - Connection: `VITE_CONVEX_URL` environment variable
  - Schema: `src/shared/api/convex/schema.ts` - Defines todos table with userId and content
  - Queries: `src/shared/api/convex/todos.ts` - getTodos, getTodo
  - Mutations: `src/shared/api/convex/todos.ts` - addTodo, deleteTodo, updateTodo
  - Authentication: Clerk JWT validation via `src/shared/api/convex/auth.config.ts`

**File Storage:**

- Not currently integrated (no file storage service detected)

**Caching:**

- Not explicitly configured (Convex provides built-in caching)

## Authentication & Identity

**Auth Provider:**

- Clerk
  - Implementation: ClerkProvider wrapper + Clerk React hooks
  - Integration point: `src/app/index.tsx` - ClerkProvider with publishable key
  - Convex integration: `ConvexProviderWithClerk` uses Clerk auth for Convex mutations/queries
  - Auth config: `src/shared/api/convex/auth.config.ts` - JWT validation from Clerk
  - E2E testing: `e2e/.auth/user.json` - Stores auth state for Playwright tests

## Monitoring & Observability

**Error Tracking:**

- react-error-boundary 6.1.1 - Client-side error boundary wrapper
  - Component: `src/app/providers/ErrorBoundary.tsx`
  - Purpose: Catches React component errors and prevents full app crash

**Logs:**

- Cloudflare observability enabled in `wrangler.jsonc`
- Browser console for development
- No external logging service detected

## CI/CD & Deployment

**Hosting:**

- Cloudflare Workers
  - Configuration: `wrangler.jsonc`
  - Build output: `./dist/client` served as static assets
  - Deploy command: `bun run deploy` → `wrangler deploy`
  - Dry-run: `wrangler deploy --dry-run` (part of `bun run check`)

**CI Pipeline:**

- Not detected (no CI configuration files found for GitHub Actions, GitLab CI, etc.)

## Environment Configuration

**Required env vars:**

Development (`.env.dev`):

- `VITE_CONVEX_URL` - Convex deployment URL
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key for client SDK
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer for Convex auth

Production (`.env.prod`):

- Same as development vars

**Secrets location:**

- `.env.dev` and `.env.prod` files (loaded via dotenvx)
- Actual secrets not committed; `.env.example` shows required structure
- dotenvx secure encryption available for sensitive values

## Webhooks & Callbacks

**Incoming:**

- Convex authentication hooks: `src/shared/api/convex/auth.config.ts` - Validates Clerk JWT tokens

**Outgoing:**

- None detected

## Integration Patterns

**React Provider Pattern:**

- `src/app/index.tsx` uses nested providers:
  1. ErrorBoundary - Error handling
  2. ClerkProvider - Authentication
  3. ConvexProviderWithClerk - Database + auth bridging
  4. Routes - Application routing

**Convex Client Usage:**

- `src/features/todo/lib/use-todo-query.ts` - Custom hook using `useQuery` from Convex
- `src/features/todo/lib/use-todo-mutation.ts` - Custom hook using `useMutation` from Convex
- All Convex functions accessed via `convexApi` exported from `src/shared/api/index.ts`

**Generated Code:**

- `src/shared/api/convex/_generated/api.d.ts` - Auto-generated API types
- `src/shared/api/convex/_generated/dataModel.d.ts` - Auto-generated data model types
- `src/shared/api/convex/_generated/server.d.ts` - Convex server runtime types

## Data Flow

**Query Flow:**

1. Component calls `useQuery(convexApi.todos.getTodos, { userId })`
2. Convex client sends request with Clerk auth token
3. Convex validates JWT via auth config
4. Convex executes server-side query in `todos.ts`
5. Results returned and cached

**Mutation Flow:**

1. Component calls `useMutation(convexApi.todos.addTodo)`
2. User action triggers mutation with `{ userId, content }`
3. Convex validates auth token
4. Convex executes mutation (insert/update/delete)
5. Real-time subscriptions updated

---

_Integration audit: 2026-03-21_
