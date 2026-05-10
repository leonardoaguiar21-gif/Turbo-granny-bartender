# Adding a New Feature

A step-by-step recipe for adding a new resource to the app. This example adds a **Note** resource -- swap it for whatever you're building.

---

## Step 1 -- Define the Schema

Create `shared/schemas/note.ts`:

```ts
import { z } from 'zod'

export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  body: z.string(),
  createdAt: z.string().datetime(),
})

export const CreateNoteSchema = NoteSchema.omit({ id: true, createdAt: true })

export type Note = z.infer<typeof NoteSchema>
export type CreateNote = z.infer<typeof CreateNoteSchema>
```

---

## Step 2 -- Add the DB Collection

In `backend/src/db/database.ts`, add the new collection:

```ts
import type { Note } from '@shared/schemas/note'

type Schema = {
  items: Item[]
  notes: Note[]      // <- add this
}

const defaultData: Schema = {
  items: [],
  notes: [],         // <- add this
}
```

---

## Step 3 -- Create the Route Handler

Create `backend/src/routes/notes.ts`:

```ts
import { randomUUID } from 'crypto'
import { db } from '../db/database'
import { json, error, notFound } from '../middleware/response'
import { CreateNoteSchema } from '@shared/schemas/note'

export async function handleNotes(req: Request, url: URL): Promise<Response> {
  const id = url.pathname.split('/')[3]

  if (req.method === 'GET' && !id) return json(db.data.notes)

  if (req.method === 'POST') {
    const body = await req.json().catch(() => null)
    const parsed = CreateNoteSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues.map(i => i.message).join(', '))

    const note = { id: randomUUID(), createdAt: new Date().toISOString(), ...parsed.data }
    db.data.notes.push(note)
    await db.write()
    return json(note, 201)
  }

  if (req.method === 'DELETE' && id) {
    const index = db.data.notes.findIndex(n => n.id === id)
    if (index === -1) return notFound()
    db.data.notes.splice(index, 1)
    await db.write()
    return json({ success: true })
  }

  return error('Method not allowed', 405)
}
```

---

## Step 4 -- Register the Route

In `backend/src/index.ts`:

```ts
import { handleNotes } from './routes/notes'

// inside fetch():
if (url.pathname.startsWith('/api/notes')) return handleNotes(req, url)
```

---

## Step 5 -- Create a Composable

Create `frontend/src/composables/useNotes.ts`:

```ts
import { ref, onMounted } from 'vue'
import { NoteSchema, type Note } from '@shared/schemas/note'

export function useNotes() {
  const notes = ref<Note[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetchNotes() {
    try {
      loading.value = true
      const res = await fetch('/api/notes')
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const raw = await res.json()
      const parsed = NoteSchema.array().safeParse(raw)
      if (!parsed.success) throw new Error('Unexpected API response')
      notes.value = parsed.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchNotes)
  return { notes, loading, error, refetch: fetchNotes }
}
```

---

## Step 6 -- Build the UI

Create `frontend/src/pages/NotesPage.vue` using the composable, then register the route in `frontend/src/main.ts`:

```ts
{ path: '/notes', component: () => import('./pages/NotesPage.vue') }
```

---

That's the full loop. The pattern is always the same: **schema -> db -> route -> register -> composable -> UI.**