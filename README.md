# Vibe Starter

A modern full-stack boilerplate for rapid prototyping and vibe coding.

**Stack:** Vue 3 · TypeScript · Tailwind CSS · Zod · Bun · lowdb

---

## Prerequisites

You only need **one thing** installed: [Bun](https://bun.sh).

### Install Bun

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Restart your terminal after installing. Verify with `bun --version`.

---

## Getting Started

```bash
# 1. Install all dependencies (frontend + backend)
bun run install:all

# 2. Start both servers with one command
bun run dev
```

- **Frontend** -> http://127.0.0.1:43171
- **Backend API** -> http://127.0.0.1:43172

---

## Project Structure

```text
vibe-starter/
|-- frontend/          # Vue 3 + Vite + Tailwind + TypeScript
|-- backend/           # Bun HTTP server + lowdb + TypeScript
|-- shared/            # Zod schemas shared between front & back
|-- docs/              # Architecture & decision docs
|-- CLAUDE.md          # AI assistant instructions
\-- README.md
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a full breakdown.

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start frontend + backend concurrently |
| `bun run dev:frontend` | Frontend only |
| `bun run dev:backend` | Backend only |
| `bun run install:all` | Install all deps |
| `bun run typecheck` | Run TS checks across the project |

---

## Database

Data is stored locally in `backend/db.json` -- a plain JSON file managed by **lowdb**. No setup, no migrations, no server. Perfect for prototyping.

To reset the database: delete `backend/db.json` and restart the backend.

---

## Adding Features

1. Define your data shape in `shared/schemas/` using Zod
2. Add a route in `backend/src/routes/`
3. Register the route in `backend/src/index.ts`
4. Consume the API in a Vue composable under `frontend/src/composables/`
5. Build your UI in `frontend/src/pages/` or `frontend/src/components/`