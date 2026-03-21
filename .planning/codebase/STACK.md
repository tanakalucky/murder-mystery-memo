# Technology Stack

**Analysis Date:** 2026-03-21

## Languages

**Primary:**

- TypeScript 5.9.3 - All source code, build configuration, and scripts
- JSX/TSX - React components throughout the application

**Secondary:**

- JavaScript - Some configuration files and scripts

## Runtime

**Environment:**

- Node.js (no specific version enforced; Bun used as package manager)

**Package Manager:**

- Bun - Primary runtime and package manager
- Lockfile: `bun.lockb` (implied through bun usage)

## Frameworks

**Core:**

- React 19.2.4 - UI framework and component system
- Vite 8.0.1 - Build tool and development server
- TypeScript 5.9.3 - Static type checking

**Backend/Database:**

- Convex 1.34.0 - Backend-as-a-service, provides database, queries, mutations
- Cloudflare Workers - Runtime deployment platform via wrangler

**UI/Styling:**

- Tailwind CSS 4.2.2 - Utility-first CSS framework
- @tailwindcss/vite 4.2.2 - Vite plugin for Tailwind
- shadcn 4.1.0 - Component library system
- @base-ui/react 1.3.0 - Headless UI primitives
- lucide-react 0.577.0 - Icon library
- class-variance-authority 0.7.1 - CSS class composition utility
- tailwind-merge 3.5.0 - Merge Tailwind CSS classes intelligently
- next-themes 0.4.6 - Dark mode theme management

**Routing:**

- wouter 3.9.0 - Lightweight client-side router

**Authentication:**

- @clerk/react 6.1.2 - Authentication and user management UI
- @clerk/testing 2.0.6 - Testing utilities for Clerk

**Data Validation & Parsing:**

- valibot 1.3.1 - Schema validation library
- ts-pattern 5.9.0 - Pattern matching for TypeScript

**Error Handling:**

- react-error-boundary 6.1.1 - Error boundary component wrapper

**Fonts:**

- @fontsource-variable/noto-sans 5.2.10 - Variable font import

## Testing

**Unit & Browser Tests:**

- vitest 4.1.0 - Vitest testing framework (unit and browser projects)
- @vitest/ui 4.1.0 - Visual UI for test results
- @vitest/browser-playwright 4.1.0 - Browser testing provider
- vitest-browser-react 2.1.0 - React testing utilities for vitest browser

**E2E Testing:**

- @playwright/test 1.58.2 - Playwright end-to-end testing
- playwright 1.58.2 - Playwright browser automation library

## Build & Development Tools

**Code Quality:**

- oxlint 1.56.0 - Rust-based linter (replaces ESLint)
- oxfmt 0.41.0 - Rust-based code formatter
- oxlint-tsgolint 0.17.1 - TypeScript/Go-specific linting rules
- eslint-plugin-better-tailwindcss 4.3.2 - Tailwind CSS linting rules

**Type Checking:**

- @typescript/native-preview 7.0.0-dev.20260320.1 - Native TypeScript preview (experimental)
- bun tsgo - TypeScript compiler integration with Bun

**Build Plugins:**

- @vitejs/plugin-react 6.0.1 - React support for Vite
- @cloudflare/vite-plugin 1.30.0 - Cloudflare Workers Vite integration

**Environment Management:**

- @dotenvx/dotenvx 1.57.0 - Environment variable management

**Package Publishing:**

- wrangler 4.76.0 - Cloudflare CLI for Workers deployment

**Git Hooks:**

- lefthook 2.1.4 - Git hook manager

**Animations:**

- tw-animate-css 1.4.0 - Tailwind animation utilities

## Configuration

**Environment:**

- Managed via dotenvx with `.env.dev` and `.env.prod` files
- Key env vars: `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_ISSUER_DOMAIN`

**Build:**

- `vite.config.ts` - Vite build configuration
  - React plugin
  - Cloudflare Workers plugin
  - Tailwind CSS Vite integration
  - Path alias: `@/` → `src/`
  - Test projects: unit (Node environment), browser (Playwright provider)

- `tsconfig.json` - References `tsconfig.app.json`
- `tsconfig.app.json` - Main TypeScript configuration
  - Target: ES2020
  - Module: ESNext
  - Strict mode enabled
  - Unused locals/parameters checked
  - Vitest globals and Node types included

**Playwright:**

- `playwright.config.ts` - E2E test configuration
  - Base URL: `http://localhost:5173`
  - Test directory: `e2e/`
  - Browser: Chromium
  - Setup project for authentication state

**Wrangler:**

- `wrangler.jsonc` - Cloudflare Workers configuration
  - Compatibility date: 2025-04-01
  - Node.js compatibility enabled
  - Observability enabled
  - Source maps uploaded on deploy
  - Static assets directory: `./dist/client`
  - SPA not-found handling enabled

## Package Scripts

**Development:**

```bash
bun run dev              # Start Vite dev server with dotenvx
bun run build            # Build for production (Vite)
bun run preview          # Preview production build locally
```

**Quality Assurance:**

```bash
bun run typecheck        # Run TypeScript type checking (bun tsgo)
bun run lint             # Run oxlint with type-awareness and fix
bun run lint:ci          # Run oxlint without auto-fix (CI mode)
bun run format           # Format code with oxfmt
```

**Testing:**

```bash
bun run test             # Run vitest unit + browser + playwright E2E tests
                         # (unit & browser in parallel, playwright via dotenvx)
```

**UI Components:**

```bash
bun run ui:add           # Add shadcn components via script
bun run ui:organize      # Organize UI component structure
```

**Deployment:**

```bash
bun run deploy           # Deploy to Cloudflare Workers
bun run check            # Type check, build, and dry-run deploy
bun run cf-typegen       # Generate Cloudflare types
```

**Other:**

```bash
bun run claude:copy      # Copy Claude config (internal tool)
```

## Platform Requirements

**Development:**

- Bun runtime (primary package manager)
- Node.js compatible environment (for wrangler and testing)
- Cloudflare account (for Workers deployment)
- Clerk account (for authentication)
- Convex account (for database and backend)

**Production:**

- Cloudflare Workers deployment platform
- Clerk authentication service
- Convex backend service

## Key Architectural Decisions

1. **Cloudflare Workers + Vite:** Server and client both deployed to Cloudflare Workers
2. **Convex as Backend:** Managed database and real-time sync instead of custom server
3. **Clerk for Auth:** Delegated authentication to specialized provider
4. **Oxlint/Oxfmt:** Modern Rust-based tooling instead of Node-based ESLint/Prettier
5. **BDD/Vitest:** Unified test framework for unit and browser testing
6. **Tailwind + shadcn:** Modern component-based styling
7. **dotenvx:** Secure environment variable management

---

_Stack analysis: 2026-03-21_
