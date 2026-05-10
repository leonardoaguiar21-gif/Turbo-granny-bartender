/**
 * shared/schemas/item.ts
 *
 * This schema is the single source of truth for the Item shape.
 * It is imported by BOTH the frontend and backend.
 *
 * Rules:
 *   - Never define data shapes in only one side of the stack
 *   - Add all new fields here first, then update the DB/UI
 */
import { z } from 'zod'

export const ItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
})

export const CreateItemSchema = ItemSchema.omit({ id: true, createdAt: true })

export type Item = z.infer<typeof ItemSchema>
export type CreateItem = z.infer<typeof CreateItemSchema>
