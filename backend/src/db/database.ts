/**
 * backend/src/db/database.ts
 *
 * Local JSON database using lowdb.
 * All data is stored in backend/db.json.
 *
 * To add a new collection:
 *   1. Add the key + type to the `Schema` type below
 *   2. Add the default value to `defaultData`
 *   3. Import `db` in your route and use it
 */
import { JSONFilePreset } from 'lowdb/node'
import type { Item } from '@shared/schemas/item'

type Schema = {
  items: Item[]
  // Add more collections here, e.g.:
  // users: User[]
}

const defaultData: Schema = {
  items: [],
}

// db.json is created automatically on first run
export const db = await JSONFilePreset<Schema>('db.json', defaultData)
