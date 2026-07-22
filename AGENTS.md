# AGENTS.md — Agent API Gateway

## Quick Start

```bash
cp .env.example .env        # Fill in at minimum: GEMINI_API_KEY, DATABASE_URL, BETTER_AUTH_SECRET
npm install
npm run dev:api             # API on :3000 (auto-reloads)
curl http://localhost:3000/health
```

## Key Commands

| Task | Command | Notes |
|------|---------|-------|
| Run API dev server | `npm run dev:api` | tsx watch, port 3000 |
| Run all tests | `npm test` | Node built-in test runner |
| Run single test file | `npm run test:product` | Or: `npx tsx --test tests/<file>.test.ts` |
| Typecheck | `npm run typecheck` | `tsc --noEmit` — **always run before committing** |
| Build for prod | `npm run build` | `tsc && vite build src/dashboard` |
| Start prod | `npm start` | `node dist/api/index.js` |
| Scan for leaked secrets | `npm run check:secrets` | Runs `scripts/check-secrets.mjs` |

## Architecture

Single-package Node.js app. **Not a monorepo.**

```
src/api/index.ts       ← Entry point (Hono server)
src/api/routes/        ← Route handlers (extract, billing, usage, schemas)
src/api/middleware/     ← Auth + rate-limit middleware
src/api/lib/           ← DB pool, cache, config, SSRF guard, alerts
src/auth/              ← Better Auth config + email transport
src/billing/           ← Polar integration + pricing tiers
src/scraper/           ← Playwright + fetch-based HTML scraper
src/extraction/        ← LLM extraction (Gemini/Claude/OpenRouter)
src/shared/types.ts    ← Shared TypeScript types + tier limits
src/dashboard/         ← React/Vite SPA (served same-origin from dist/)
src/mcp/               ← MCP server for agent integration
```

## Request Flow

```
POST /v1/extract → authMiddleware → rateLimitMiddleware → SSRF check → cache check
  → scrape HTML (Playwright or fetch) → LLM extraction → validate → cache → response
```

## Critical Patterns

### SSRF Protection

All user-supplied URLs pass through `src/api/lib/ssrf.ts` — blocks private IPs, localhost, metadata endpoints. **Never bypass this.**

### Auth Flow

Better Auth handles sessions + API keys. Auth middleware (`src/api/middleware/auth.ts`) tries:
1. Session cookie → `/api/auth/get-session`
2. Bearer token → `auth.api.verifyApiKey()`

Both paths set `userId`, `user`, `tier` on Hono context.

### LLM Engine Selection

Priority: `OPENROUTER_API_KEY` → `GEMINI_API_KEY` → `ANTHROPIC_API_KEY`
Override with `EXTRACTION_LLM` env var (values: `openrouter`, `gemini`, `claude`).

### Path Alias

`@shared/*` maps to `src/shared/*` (configured in `tsconfig.json` paths).

## Testing

- Framework: Node built-in test runner (`node:test` + `node:assert/strict`)
- Tests import directly from `src/` using `.ts` extensions (tsx handles it)
- No test database required — tests exercise pure functions (validator, pricing)
- Product test: `npm run test:product` (validator + pricing catalog)

## Deployment

- **Production:** Render (auto-deploys from main branch)
- **Docker:** `docker-compose.yml` for local container testing
- **Frontend:** Built Vite SPA served from `dist/` by the Hono server
- **Database:** Render PostgreSQL (shared with sister product StatusPlate)
- **Billing:** Polar (hosted checkout) — not Stripe

## Environment Variables

Required for full functionality:
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Session encryption key
- `GEMINI_API_KEY` or `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` — At least one LLM
- `POLAR_ACCESS_TOKEN` + `POLAR_WEBHOOK_SECRET` — Billing

Optional but recommended:
- `RESEND_API_KEY` — Email verification (without it, links log to console)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `REDIS_URL` — Cache (without it, in-memory cache is used)

## Conventions

- TypeScript strict mode, ESM modules
- Hono for HTTP routing (not Express)
- Zod for request validation
- Better Auth for auth (not custom auth code)
- Polar for billing (not Stripe)
- Structured JSON logging for audit events (session.create, user.update, etc.)
- Error messages redact secrets before logging
- API keys use `sk-` prefix
- Tier types: `free` | `hobby` | `pro` | `scale`

## Engineering Principles (Vibe Coding Reference)

All architectural decisions should reference Alan Knox's **Engineering for Vibe Coders** series (https://alanknox.com/vibe-coding/). When making a decision that maps to a concept below, fetch the article for full context.

**Planning & Requirements:** Business Requirements, Product Requirements, Design & Technical Requirements, MVP, Trade-Offs, Scope Creep, Definition of Done, Cost of Ownership, SDLC, Task Decomposition, Notifications

**System Structure:** System Design, Component Architecture, Separation of Concerns, File & Folder Structure, Data Contracts, Data Validation, State Management, API Design, Software Architecture

**Thinking Disciplines:** Edge Case Thinking, Production Thinking, Technical Debt, Evaluating AI-Generated Code, Right-Sized Prompting, Blast Radius, Analysis Paralysis, Rubber Ducking

**Reliability:** Error Handling, Idempotency, Retry Strategies, Rate Limiting, Timeouts & Circuit Breakers, Graceful Degradation, Webhooks, Fail Fast vs Fail Safe

**Execution:** Sync vs Async, Caching, Background Jobs, Race Conditions, Batching, Pagination, Database Indexes

**Infrastructure:** Version Control, Configuration & Secrets, Deployment, Serverless, CI/CD, Database Migrations, Dependency Management

**Testing & Quality:** Debugging, Automated Testing, Type Systems, Linting, Code Assessment

**Observability & Security:** Logging & Observability, AuthN vs AuthZ, Security-First Coding, Prompt-Injection, Auditing, Guardrails, PII & Data Handling

When a decision involves one of these areas, fetch the matching article for guidance.

## Don'ts

- Don't use wildcard CORS in production
- Don't skip the SSRF guard when adding new URL-input endpoints
- Don't commit `.env` files (use `.env.example` for placeholders)
- Don't hardcode API keys or secrets in source code
- Don't use Express patterns — this is a Hono app

## Recursive Learning Loop

The LLM agent maintains a continuous improvement cycle. Each turn follows this loop:

### 1. SCAN (60s)
- Run `node scripts/self-audit.mjs` for codebase health
- Check `.recursive-state.json` for completed/pending work
- Verify the deployed site with `curl -sI https://agentapigw.dpdns.org/`
- Check `git status` and `git log --oneline -5`

### 2. ANALYZE (30s)
- Cross-reference current state against the priority areas below
- Check for: build errors, TypeScript issues, console errors in browser
- Review the state tracker for pending improvements
- Prioritize: bugs first → UX polish → features → infrastructure

### 3. EXECUTE
- Make the change with clear intent
- Run `npm run typecheck` before any commit
- Run `npm run build` to verify the frontend compiles
- Run `npm run check:secrets` if adding env or config files

### 4. VERIFY
- Check `tsc --noEmit` passes
- Check Vite build completes
- Load the page in the in-app browser and check console for errors
- Verify the dashboard and landing page both render

### 5. COMMIT & DEPLOY
```bash
git add <files>
git commit -m "type: concise description"
git push origin master
```
- Wait for Render auto-deploy (1-2 min)
- Verify the new bundle is served by checking asset hashes

### 6. RETRO & UPDATE STATE
- Update `.recursive-state.json` with completed work
- Move completed items from `pending` to `completed`
- Add any new `knownIssues` found during verification
- Increment `iteration` counter

### Priority Areas (in order)

| Priority | Area | Why |
|----------|------|-----|
| P0 | Bugs/crashes | Site must render without console errors |
| P1 | Security | SSRF, CSP, API key handling |
| P2 | UX polish | Icons, micro-interactions, premium feel |
| P3 | Features | New pages, schemas, integrations |
| P4 | Infrastructure | Deploy perf, build optimization, tests |

### Self-Correction

If verification fails (build error, blank page, console error):
1. Read the error message fully
2. Revert the change with `git checkout -- <files>`
3. Rebuild with `npm run build`
4. Only retry with a fix, not the same change
5. Record the failure in `.recursive-state.json.knownIssues`

### Completion Criteria

A change is done when:
- `tsc --noEmit` passes with zero errors
- `npm run build` completes
- Deployed site shows zero console errors
- Bundle hash changed from previous deploy
- Commit is pushed to master

Do not mark an item complete until all five criteria are met.