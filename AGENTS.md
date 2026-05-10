# AGENTS.md -- AI Assistant Instructions

This file tells AI assistants (Codex, Cursor, Copilot, etc.) how to work with this codebase. Read it before making any changes.

---

## Project Purpose

This is a full-stack web application boilerplate. The goal is fast prototyping with strong type safety across the entire stack.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 (Composition API + `<script setup>`) |
| Styling | Tailwind CSS (utility-first, no custom CSS unless necessary) |
| Frontend types | TypeScript + Zod (for runtime API validation) |
| Backend | Bun HTTP server (native, no Express) |
| Backend DB | lowdb (JSON file, stored in `backend/db.json`) |
| Shared types | Zod schemas in `shared/schemas/` |

---

## Core Conventions

### 1. Shared Schemas Are the Source of Truth

- All data shapes live in `shared/schemas/`
- Never define a type in only the frontend or only the backend
- The `*Schema` (Zod) is the canonical definition; TypeScript types are inferred from it with `z.infer<>`

```ts
// [ok] Correct
import { ItemSchema, type Item } from '@shared/schemas/item'

// [x] Wrong -- do not duplicate types
type Item = { id: string; name: string }
```

### 2. Frontend Fetches via Composables

- All API calls go in `frontend/src/composables/use*.ts`
- Composables always validate the API response with the shared Zod schema
- Never call `fetch()` directly from a component

### 3. Backend Route Pattern

Each resource gets its own file in `backend/src/routes/`. Routes export a single `handle*` function:

```ts
export async function handleItems(req: Request, url: URL): Promise<Response>
```

Register new routes in `backend/src/index.ts`.

### 4. Always Validate Input on the Backend

Use the shared `Create*Schema` (the schema without `id` and `createdAt`) to validate POST bodies:

```ts
const parsed = CreateItemSchema.safeParse(body)
if (!parsed.success) return error(parsed.error.issues...)
```

### 5. Tailwind Only

- Style everything with Tailwind utility classes
- No `<style>` blocks in `.vue` files unless absolutely necessary
- No external CSS libraries

---

## File Structure

```text
vibe-starter/
|-- frontend/
|   \-- src/
|       |-- components/    # Reusable UI components (buttons, cards, inputs)
|       |-- composables/   # Data fetching and shared logic (use*.ts)
|       |-- pages/         # One file per route (HomePage.vue, etc.)
|       |-- schemas/       # Frontend-only Zod schemas (form validation, etc.)
|       \-- assets/        # Static files and global CSS
|-- backend/
|   \-- src/
|       |-- routes/        # One file per resource (items.ts, users.ts, etc.)
|       |-- db/            # Database setup (database.ts)
|       \-- middleware/    # Shared helpers (response.ts)
|-- shared/
|   \-- schemas/           # Zod schemas used by BOTH frontend and backend
\-- docs/                  # Architecture decisions and guides
```

---

## How to Add a New Feature

When asked to add a new resource (for example, "add a notes feature"):

1. **Schema**: Create `shared/schemas/note.ts` with `NoteSchema` and `CreateNoteSchema`
2. **Backend route**: Create `backend/src/routes/notes.ts` with `handleNotes()`
3. **Register route**: Add `if (url.pathname.startsWith('/api/notes')) return handleNotes(req, url)` in `backend/src/index.ts`
4. **DB collection**: Add `notes: Note[]` to the `Schema` type in `backend/src/db/database.ts`
5. **Composable**: Create `frontend/src/composables/useNotes.ts`
6. **Page/Component**: Build the UI in `frontend/src/pages/` or `frontend/src/components/`

---

## What Not to Do

- [x] Do not install Express, Fastify, or other HTTP frameworks -- Bun's built-in server is intentional
- [x] Do not use `any` types -- always use Zod schemas or explicit TypeScript types
- [x] Do not add a database migration system -- lowdb is for prototyping; if you need migrations, it is time to graduate to PostgreSQL
- [x] Do not define the same type in both frontend and backend -- always share via `shared/schemas/`
- [x] Do not add authentication until the feature set is stable -- premature auth adds complexity

---

## Database Notes

- `backend/db.json` is auto-created on first run
- It is gitignored -- each developer has their own local data
- To reset: delete `db.json` and restart the backend
- lowdb writes are async -- always `await db.write()` after mutations

---

## Real API Integration Playbook

When a user asks to integrate a real third-party API (Gmail, Stripe, Slack, Notion, etc.), do not jump straight to code. First gather setup inputs, then guide them through provider setup links, then implement.

### Assistant Workflow (Required)

1. Confirm the product goal in one sentence (for example: "send email from app", "read inbox", "sync calendar").
2. Request missing setup inputs using the checklist below.
3. Share official provider setup links and a step-by-step setup path.
4. Wait for the user to confirm setup completion and provide required values.
5. Implement backend route/composable/schema changes using project conventions.
6. Add `.env.example` entries, runtime validation, and friendly error messages for missing credentials.
7. Provide a test plan with at least one success path and one failure path.

### Setup Inputs Checklist (Ask User For These)

- API provider and product area (for example: Gmail API, Gmail send + read).
- Environment targets (local only, staging, production).
- Auth type required by provider (API key, OAuth 2.0, service account).
- Callback/redirect URL(s) they will register.
- Exact scopes/permissions needed (least privilege first).
- Credentials they can provide now (client ID, project ID, tenant ID, etc.).
- Webhook requirement (yes/no) and webhook verification secret if applicable.
- Expected rate limits / usage volume.
- Data model expectations (fields to store in lowdb now, migration plan later).

### Security Rules (Required)

- Never ask users to paste raw secrets into chat if avoidable; prefer `.env` placement.
- Never commit real credentials.
- Validate all required env vars on backend startup.
- Keep OAuth tokens server-side only; never expose refresh tokens to frontend.
- Start with minimum scopes and document why each scope is needed.

### Gmail API Example (Google Workspace)

Use this flow when the user asks for Gmail integration.

1. Ask whether they need `send`, `read`, or both.
2. Ask for target Google account type (personal Gmail vs Workspace org-managed).
3. Share official setup docs:
   - Enable APIs: https://developers.google.com/workspace/guides/enable-apis
   - Gmail API Node quickstart: https://developers.google.com/workspace/gmail/api/quickstart/nodejs
4. Instruct user to do these steps in Google Cloud:
   - Create/select a Google Cloud project.
   - Enable Gmail API.
   - Configure OAuth consent screen (Branding/Audience/Data Access).
   - Create OAuth Client ID credentials.
   - Register redirect URI for local dev and app callback.
   - Download credentials JSON and extract required values.
5. Ask user to provide non-secret config values, then place secrets in `.env`.
6. Implement:
   - Shared schema for Gmail-connected account state.
   - Backend OAuth start/callback routes and token storage.
   - Backend API route(s) for requested Gmail operations.
   - Frontend composable(s) for connect/disconnect/status/actions.
7. Verify:
   - Unauthenticated request returns actionable error.
   - OAuth connect succeeds.
   - Requested Gmail action succeeds with expected response shape.

### Output Contract For API Integrations

Every integration task response should include:

- What the user must do in provider console (with links).
- What values the user must provide to continue.
- What code changes were made in this repo.
- How to run and verify locally.
- Known limits/risk notes (quota, token expiry, missing scopes).
---

## Definition Of Done (Feature Checklist)

A feature is considered done only when all items below are complete:

- Shared schema created or updated in `shared/schemas/`.
- Backend input validation uses shared `Create*Schema`.
- Backend route returns consistent JSON success/error responses.
- Frontend calls API only through composables (`use*.ts`).
- Frontend validates API responses with shared Zod schemas.
- Loading, empty, and error states are visible in UI.
- Required env vars are documented in `.env.example`.
- No secrets are hardcoded or committed.
- Manual test steps are written (happy path + at least 1 failure path).
- Relevant docs updated (`README.md`, `docs/*`, or steering docs).

---

## Secrets And Env Contract

Use consistent env var names and keep provider secrets backend-only.

### Naming Convention

- Use uppercase snake case.
- Prefix by provider when possible.
- Examples:
  - `GMAIL_CLIENT_ID`
  - `GMAIL_CLIENT_SECRET`
  - `GMAIL_REDIRECT_URI`
  - `GMAIL_SCOPES`

### Placement Rules

- Backend-only secrets go in `backend/.env`.
- Frontend must not receive secrets.
- Only expose frontend-safe values with explicit `VITE_` prefix (if truly needed).

### Required Documentation For Each Env Var

For each new env var, document:

- What it is used for.
- Where it is read in code.
- Example value format (not real secret).
- Whether it is required in local/staging/production.

### Runtime Validation

- Validate required env vars at backend startup.
- Fail fast with actionable error messages when missing.
- Never log secret values.

---

## Troubleshooting Matrix

Use this matrix when integration issues appear.

| Symptom | Likely Cause | Fix |
|---|---|---|
| OAuth "redirect_uri_mismatch" | Redirect URI differs from provider console | Copy exact callback URL from app config into provider console and retry |
| OAuth consent/scope error | Missing or unapproved scope | Add scope in provider consent config, re-authorize user |
| 401 Unauthorized from provider | Expired/invalid token | Refresh token or reconnect account and store new tokens |
| 403 Forbidden | API not enabled or insufficient permission | Enable API in provider console and verify account access |
| CORS error in browser | Frontend calling wrong host/port or backend CORS config missing | Verify Vite proxy target and backend CORS headers |
| 429 Rate limit | Too many requests in short window | Add backoff/retry strategy and reduce polling frequency |
| Webhook signature invalid | Wrong signing secret or raw body altered | Verify webhook secret and signature verification logic |
| "Missing env var" startup failure | `.env` not configured | Add required vars to `backend/.env` using `.env.example` as template |

---

## Provider Intake Template (Copy/Paste)

Use this template at the start of any real API integration request:

1. Provider and API product:
2. Desired user action(s):
3. Environment(s): local / staging / production
4. Auth type required by provider:
5. Redirect/callback URL(s):
6. Required scope(s)/permission(s):
7. Credentials already available (non-secret identifiers):
8. Secrets available and where they will be stored (`backend/.env`):
9. Webhook needed? If yes, event types + signing secret ready?
10. Expected usage volume / rate sensitivity:
11. Data to store in app (fields + retention expectations):
12. Definition of success for first milestone:

After answers are provided, the assistant should:

- Share exact provider setup links.
- List the remaining missing inputs.
- Propose implementation steps tied to this repo structure.
- Implement incrementally with verification after each step.

---

## Testing Command Checklist

Before marking work complete, run these checks in order:

1. Type safety across repo:
   - `C:\Users\jose_\.bun\bin\bun.exe run typecheck`
2. Backend smoke test:
   - Start backend and verify at least one API endpoint returns expected JSON.
   - Example: `GET /api/items` should return `[]` or valid item array.
3. Frontend runtime check:
   - Start app with `C:\Users\jose_\.bun\bin\bun.exe run dev`
   - Open `http://127.0.0.1:43171` and confirm page loads with no blocking errors.
4. Integration-specific check (when using external APIs):
   - One happy-path action succeeds.
   - One expected failure path returns actionable error.
5. Config sanity:
   - New env vars exist in `.env.example`.
   - No secrets are committed.

If any check fails, do not mark task complete; report failure cause and next fix.

---

## Go Live Flow (Deployment Wizard)

When user intent indicates deployment (not just exact wording), trigger this flow.

### Intent Triggers (Examples)

Any message meaning "deploy now" should trigger this flow, including:

- "Can we put this online now?"
- "Make this live"
- "Let's put it in prod"
- "Deploy this"
- "Ship this"
- "Publish this app"

Do not require exact phrase matching. Match by intent.

### Default Deployment Path (Recommended)

- Frontend: Vercel
- Backend (Bun API): Railway

Use this by default unless the user requests another platform.

### Assistant Response Pattern

When triggered, respond with:

1. "Yes, we can deploy now."
2. "Recommended path: Vercel (frontend) + Railway (backend)."
3. "Here are the exact steps and what I need from you."

### What The Assistant Should Do Automatically

- Run preflight checks (`typecheck`, build sanity, required env vars check).
- Confirm frontend/backend production URLs strategy.
- Prepare deployment-ready configuration and env var checklist.
- Generate copy/paste env var blocks for each platform.
- Provide a minimal click path for user auth/approval steps.
- Provide post-deploy verification steps.

### What The User Must Provide

- Vercel account login/authorization.
- Railway account login/authorization.
- Repo access (or permission to connect/import project).
- Production env var values.
- Consent to set production callback URLs/origins.

### Browser Login / "Popup Accept" Guidance

- Assistant can automate most local prep and provide exact click steps.
- Third-party account authentication still requires user approval in provider UI.
- Target UX: user mostly clicks "Continue/Authorize", assistant handles the rest.

### Preflight Checklist Before Deploy

- `C:\Users\jose_\.bun\bin\bun.exe run typecheck` passes.
- Frontend build passes.
- Backend starts and responds on API endpoint.
- CORS origin is set for production frontend domain.
- `.env.example` includes all required variables.

### Post-Deploy Verification

- Frontend URL loads without blocking console/runtime errors.
- Backend health/API endpoint returns expected JSON.
- One read flow and one write flow succeed.
- External API integrations (if any) pass one happy path.

### Fallback

If user asks for "one platform only", prefer Railway full-stack or another platform they name, and provide tradeoffs briefly.

---

## Environment Bootstrap (Required Before Project Commands)

Before running setup, dev, build, or typecheck commands, verify Bun is available.

### 1. Verify Bun

- Command: `bun --version`
- If this succeeds, continue normally.

### 2. Install Bun If Missing

- Windows (PowerShell):
  - `powershell -c "irm bun.sh/install.ps1 | iex"`
- macOS/Linux:
  - `curl -fsSL https://bun.sh/install | bash`

After install, restart terminal/session or call Bun using full path if needed:

- `C:\Users\<username>\.bun\bin\bun.exe`

### 3. Then Run Project Setup

- Install dependencies: `bun run install:all`
- Typecheck: `bun run typecheck`
- Start app: `bun run dev`

### 4. If Bun Is Still Not Found

- Confirm Bun binary location exists.
- Use full path Bun executable for commands.
- Ask user to restart terminal/editor to refresh PATH.

---

## Monorepo Cloud Deploy Guardrails (Railway/Vercel/Render)

Use these rules whenever frontend/backend import from `shared/*`.

### Core Rule

Run dependency installation from repo root in cloud builds. Do not rely on subdirectory-only installs when shared code imports third-party packages.

### Why This Exists

Common failure pattern in cloud runtime:

- `Cannot find package 'zod' from '/app/shared/schemas/item.ts'`

This means shared imports resolved to files that require dependencies not available in that service runtime scope.

### Required Deployment Commands (Baseline)

Use repo root as service working directory whenever possible.

Frontend service:

- Build: `bun install && bun run --filter=vibe-starter-frontend build`
- Start: `bunx serve frontend/dist -l $PORT`

Backend service:

- Build: `bun install`
- Start: `bun run --filter=vibe-starter-backend start`

### Shared Dependency Rule

If files in `shared/` import external packages (for example `zod`), ensure one of these is true:

- Dependency is installed via root `bun install` in cloud build context.
- Or `shared` is modeled as an explicit package with its own `package.json` and dependencies.

### Preflight Before "Deploy Now"

1. Confirm repo root has workspace-aware install path.
2. Confirm latest commit includes `shared/` and workspace config.
3. Confirm root install command runs before filtered build/start commands.
4. Confirm `.env.example` and required runtime vars are present.

### Error Signature -> Action Map

- Error: `Cannot find package 'zod' from '/app/shared/schemas/...` 
  - Action: run install at monorepo root, then rebuild/restart.
  - Action: verify `zod` is present in root dependencies.
  - Action: avoid subdir-only deploy config for services using `shared/*`.

- Error: TypeScript cannot find shared types in cloud build
  - Action: ensure `shared` path is included in build context and committed.
  - Action: ensure workspace install happened before build.

### Assistant Behavior When User Says "Deploy"

When deployment is requested, assistant should:

- Check for monorepo + shared imports.
- Enforce root-level install/build/start commands.
- Warn about this exact `zod`/shared failure mode before first deploy attempt.
- Provide copy/paste service config values (root dir, build, start).
