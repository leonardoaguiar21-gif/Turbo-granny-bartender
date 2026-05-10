# Architecture

This document explains the structural decisions behind this boilerplate.

---

## Overview

```text
Browser (Vue 3)  <->  Bun HTTP Server  <->  db.json (lowdb)
       ^                    ^
       \------ Zod schemas --/
           (shared types)
```

The key idea: **Zod schemas in `shared/` are the contract between frontend and backend.** Both sides import from the same place, so type drift is impossible.

---

## Layer Responsibilities

### Frontend (`frontend/`)

- Renders UI using Vue 3 Single File Components
- Fetches data via composables (`useItems`, `useNotes`, etc.)
- Validates API responses with shared Zod schemas at runtime
- Routes pages via Vue Router (configured in `main.ts`)
- Never contains business logic -- that lives in the backend

### Backend (`backend/`)

- Thin Bun HTTP server -- no framework overhead
- Each resource has one route file with a single exported handler function
- Validates all incoming request bodies with Zod before touching the DB
- Returns consistent JSON responses via the `response.ts` helpers

### Shared (`shared/`)

- Zod schemas only -- no runtime code, no API calls, no imports from front or backend
- Every schema exports:
  - `*Schema` -- the full entity (e.g., `ItemSchema`)
  - `Create*Schema` -- the input shape for creation (no `id`, no `createdAt`)
  - `type *` -- the inferred TypeScript type

---

## Data Flow: Creating an Item

```text
1. User fills form in Vue component
2. Component calls composable function (e.g., createItem(data))
3. Composable validates with CreateItemSchema (client-side feedback)
4. Composable calls POST /api/items with JSON body
5. Backend handler validates body with CreateItemSchema (server-side safety)
6. Handler generates id + createdAt, writes to db.json via lowdb
7. Handler returns the new item as JSON
8. Composable updates local reactive state
9. Vue re-renders with new item
```

---

## Why These Technologies?

### Bun (not Node + Express)
- One install command, no version managers needed
- Runs TypeScript natively -- no build step for the backend
- `--watch` flag gives instant hot-reload
- Built-in HTTP server is fast enough for prototypes

### lowdb (not SQLite, not Postgres)
- Zero setup -- the file is created automatically
- The entire database is readable as JSON in any text editor
- Easy to reset (just delete `db.json`)
- When you outgrow it, graduate to SQLite (`better-sqlite3`) or Postgres

### Zod (not plain TypeScript interfaces)
- TypeScript types only exist at compile time; Zod validates at **runtime**
- `safeParse` gives structured error messages -- useful for form feedback
- `z.infer<>` derives the TypeScript type from the schema, keeping them in sync

### Vue 3 Composition API (not Options API)
- `<script setup>` is the modern, concise way to write Vue components
- Composables (`use*` functions) are the idiomatic pattern for shared logic
- Better TypeScript integration than the Options API

### Tailwind CSS (not a component library)
- No external visual opinions -- style freely
- No "override the override" battles with component libraries
- Works well for vibe coding where the design evolves quickly

---

## Scaling Beyond the Boilerplate

When the project grows, here's the natural upgrade path:

| Current | Upgrade to | When |
|---|---|---|
| lowdb (JSON) | better-sqlite3 | Relational data, more than ~1000 records |
| better-sqlite3 | PostgreSQL + Drizzle | Multi-user, production |
| Bun HTTP | Hono or Elysia | Need middleware, auth, plugins |
| Local state | Pinia | Shared state across many components |
| No auth | Lucia or better-auth | User accounts needed |

---

## Environment Variables

Create a `.env` file in `backend/` for secrets:

```env
PORT=3000
# Add API keys, secrets, etc. here
```

Access in Bun: `Bun.env.PORT`

Never commit `.env` to git. A `.env.example` file documents available variables.