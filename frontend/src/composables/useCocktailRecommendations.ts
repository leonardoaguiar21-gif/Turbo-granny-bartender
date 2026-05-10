import { ref } from 'vue'
import {
  CocktailRecommendationResponseSchema,
  type CocktailMatch,
} from '@shared/schemas/cocktail'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export function useCocktailRecommendations() {
  const matches = ref<CocktailMatch[]>([])
  const normalizedIngredients = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let activeRequestId = 0

  async function recommend(ingredients: string[]) {
    const requestId = activeRequestId + 1
    activeRequestId = requestId

    try {
      loading.value = true
      error.value = null
      matches.value = []
      normalizedIngredients.value = []

      const res = await fetch(`${API_BASE_URL}/api/cocktails/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })

      const raw = await res.json()
      if (!res.ok) {
        throw new Error(raw?.error ?? `API error: ${res.status}`)
      }

      const parsed = CocktailRecommendationResponseSchema.safeParse(raw)
      if (!parsed.success) {
        throw new Error('Unexpected cocktail recommendation response')
      }

      if (requestId !== activeRequestId) return

      matches.value = parsed.data.matches
      normalizedIngredients.value = parsed.data.normalizedIngredients
    } catch (e) {
      if (requestId !== activeRequestId) return

      error.value = e instanceof Error ? e.message : 'Unknown error'
      matches.value = []
    } finally {
      if (requestId === activeRequestId) {
        loading.value = false
      }
    }
  }

  function reset() {
    activeRequestId += 1
    matches.value = []
    normalizedIngredients.value = []
    error.value = null
    loading.value = false
  }

  return {
    matches,
    normalizedIngredients,
    loading,
    error,
    recommend,
    reset,
  }
}
