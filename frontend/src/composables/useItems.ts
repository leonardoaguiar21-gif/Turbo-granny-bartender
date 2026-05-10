/**
 * useItems -- example composable for fetching items from the backend.
 *
 * Pattern to follow for all API calls:
 *   1. Define the Zod schema in shared/schemas/
 *   2. Create a composable here that fetches + validates
 *   3. Use the composable in your page/component
 */
import { ref, onMounted } from 'vue'
import { ItemSchema, type Item } from '@shared/schemas/item'

export function useItems() {
  const items = ref<Item[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetchItems() {
    try {
      loading.value = true
      error.value = null

      const res = await fetch('/api/items')
      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const raw = await res.json()

      // Validate the response with Zod -- catches backend/frontend mismatches early
      const parsed = ItemSchema.array().safeParse(raw)
      if (!parsed.success) {
        throw new Error('Unexpected API response shape')
      }

      items.value = parsed.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchItems)

  return { items, loading, error, refetch: fetchItems }
}