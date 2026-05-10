/**
 * backend/src/routes/items.ts
 *
 * CRUD routes for Items. Follow this pattern for every new resource:
 *   GET    /api/items       -> list all
 *   POST   /api/items       -> create one
 *   GET    /api/items/:id   -> get one
 *   DELETE /api/items/:id   -> delete one
 */
import { randomUUID } from 'crypto'
import { db } from '../db/database'
import { json, error, notFound } from '../middleware/response'
import { CreateItemSchema } from '@shared/schemas/item'

export async function handleItems(req: Request, url: URL): Promise<Response> {
  const segments = url.pathname.split('/').filter(Boolean)
  const id = segments[2] // /api/items/:id

  // GET /api/items
  if (req.method === 'GET' && !id) {
    return json(db.data.items)
  }

  // GET /api/items/:id
  if (req.method === 'GET' && id) {
    const item = db.data.items.find((i) => i.id === id)
    return item ? json(item) : notFound()
  }

  // POST /api/items
  if (req.method === 'POST') {
    const body = await req.json().catch(() => null)
    const parsed = CreateItemSchema.safeParse(body)

    if (!parsed.success) {
      return error(parsed.error.issues.map((i) => i.message).join(', '))
    }

    const newItem = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...parsed.data,
    }

    db.data.items.push(newItem)
    await db.write()

    return json(newItem, 201)
  }

  // DELETE /api/items/:id
  if (req.method === 'DELETE' && id) {
    const index = db.data.items.findIndex((i) => i.id === id)
    if (index === -1) return notFound()

    db.data.items.splice(index, 1)
    await db.write()

    return json({ success: true })
  }

  return error('Method not allowed', 405)
}