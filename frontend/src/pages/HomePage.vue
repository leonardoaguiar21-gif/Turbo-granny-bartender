<template>
  <main class="min-h-screen bg-[#1f0f08] text-[#fff4d7]">
    <section class="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 md:grid-cols-[360px_1fr] md:px-8 lg:py-12">
      <form
        class="self-start rounded-lg border border-[#7a4a18] bg-[#2b140a]/95 p-5 shadow-2xl shadow-black/40"
        @submit.prevent="findCocktails"
      >
        <div class="mb-6">
          <p class="text-sm font-medium uppercase tracking-[0.18em] text-[#f0c15a]">Cocktail bench</p>
          <h1 class="mt-2 text-3xl font-bold text-[#ffd56a]">Turbo granny bartender 3000 yujuuu</h1>
          <p class="mt-3 text-sm leading-6 text-[#f7dfac]">
            Add the bottles, mixers, citrus, bitters, and sweeteners you have. The app will suggest original recipes, one-ingredient substitutions, or simpler alternates.
          </p>
        </div>

        <label for="ingredients" class="text-sm font-semibold text-[#fff4d7]">
          Ingredients and alcohol
        </label>
        <textarea
          id="ingredients"
          v-model="ingredientText"
          class="mt-2 h-40 w-full resize-none rounded-md border border-[#7a4a18] bg-[#160804] px-3 py-3 text-sm text-[#fff4d7] outline-none transition placeholder:text-[#b58b4d] focus:border-[#ffd56a] focus:ring-2 focus:ring-[#ffd56a]/25"
          placeholder="rum, coke, lime, amargo angostura"
        />

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="sample in samples"
            :key="sample.label"
            type="button"
            class="rounded-md border border-[#7a4a18] px-3 py-2 text-xs font-semibold text-[#f7dfac] transition hover:border-[#ffd56a] hover:text-[#ffd56a]"
            @click="ingredientText = sample.value"
          >
            {{ sample.label }}
          </button>
        </div>

        <button
          type="submit"
          class="mt-5 w-full rounded-md bg-[#ffd56a] px-4 py-3 text-sm font-bold text-[#1f0f08] transition hover:bg-[#ffe49a] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Matching recipes...' : 'Find cocktails' }}
        </button>

        <p v-if="error" class="mt-4 rounded-md border border-red-300/30 bg-red-950/50 px-3 py-2 text-sm text-red-100">
          {{ error }}
        </p>
      </form>

      <section class="space-y-5">
        <div class="rounded-lg border border-[#7a4a18] bg-[#2b140a]/80 p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm font-medium uppercase tracking-[0.18em] text-[#f0c15a]">Recommendations</p>
              <h2 class="mt-2 text-2xl font-bold text-[#ffd56a]">Recipes that fit your bar</h2>
            </div>
            <p class="text-sm text-[#d6b069]">
              {{ ingredientCount }} ingredient{{ ingredientCount === 1 ? '' : 's' }} entered
            </p>
          </div>

          <div v-if="!hasSearched" class="mt-8 border-t border-[#7a4a18] pt-6 text-[#f7dfac]">
            Start with a list like rum, coke, lime, and amargo angostura. I will separate exact recipes from smart substitutes and fallback drinks.
          </div>

          <div v-else-if="!loading && matches.length === 0" class="mt-8 border-t border-[#7a4a18] pt-6 text-[#f7dfac]">
            No close cocktail found yet. Try adding a base spirit, citrus, a mixer, or a sweetener.
          </div>
        </div>

        <article
          v-for="match in matches"
          :key="match.recipe.id"
          class="rounded-lg border border-[#7a4a18] bg-[#2b140a] p-5 shadow-xl shadow-black/25"
        >
          <div class="flex flex-col gap-3 border-b border-[#7a4a18] pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-2xl font-bold text-[#ffd56a]">{{ match.recipe.name }}</h3>
                <span
                  class="rounded px-2 py-1 text-xs font-bold uppercase tracking-wide"
                  :class="badgeClass(match.matchType)"
                >
                  {{ matchLabel(match.matchType) }}
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-[#f7dfac]">{{ match.recipe.description }}</p>
            </div>
            <div class="rounded-md border border-[#7a4a18] px-3 py-2 text-sm text-[#d6b069]">
              {{ match.recipe.glassware }}
            </div>
          </div>

          <div class="grid gap-5 pt-5 lg:grid-cols-[1fr_1fr]">
            <div>
              <h4 class="font-semibold text-[#fff4d7]">Ingredients</h4>
              <ul class="mt-3 space-y-2">
                <li
                  v-for="ingredient in match.recipe.ingredients"
                  :key="ingredient.name"
                  class="flex justify-between gap-4 rounded-md bg-[#160804] px-3 py-2 text-sm"
                >
                  <span class="text-[#fff4d7]">{{ ingredient.name }}</span>
                  <span class="shrink-0 text-[#d6b069]">{{ ingredient.amount }}</span>
                </li>
              </ul>

              <div v-if="match.substitutions.length" class="mt-4 rounded-md border border-[#ffd56a]/40 bg-[#ffd56a]/10 p-3">
                <h4 class="font-semibold text-[#ffe49a]">Substitution</h4>
                <div v-for="substitution in match.substitutions" :key="substitution.missingIngredient" class="mt-2 text-sm text-[#fff4d7]">
                  <p>Missing {{ substitution.missingIngredient }}: {{ substitution.substitutes.join(', ') }}</p>
                  <p class="mt-1 text-[#f7dfac]">{{ substitution.note }}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-[#fff4d7]">Step by step</h4>
              <ol class="mt-3 space-y-2">
                <li
                  v-for="(step, index) in match.recipe.instructions"
                  :key="step"
                  class="grid grid-cols-[2rem_1fr] gap-3 rounded-md bg-[#160804] px-3 py-2 text-sm text-[#fff4d7]"
                >
                  <span class="font-bold text-[#ffd56a]">{{ index + 1 }}</span>
                  <span>{{ step }}</span>
                </li>
              </ol>
            </div>
          </div>

          <div class="mt-5 rounded-md border border-[#7a4a18] bg-[#160804] p-4">
            <div class="flex flex-wrap gap-2">
              <span class="rounded bg-[#3a1a0c] px-2 py-1 text-xs font-bold uppercase text-[#ffd56a]">
                Recommended: {{ methodLabel(match.recipe.primaryMethod) }}
              </span>
              <span class="rounded bg-[#3a1a0c] px-2 py-1 text-xs text-[#f7dfac]">
                Shake: {{ match.recipe.canShake ? 'possible' : 'avoid' }}
              </span>
              <span class="rounded bg-[#3a1a0c] px-2 py-1 text-xs text-[#f7dfac]">
                Stir: {{ match.recipe.canStir ? 'possible' : 'avoid' }}
              </span>
            </div>
            <p class="mt-3 text-sm leading-6 text-[#f7dfac]">{{ match.recipe.methodGuidance.recommended }}</p>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <p class="rounded-md bg-[#2b140a] px-3 py-2 text-sm text-[#f7dfac]">
                <span class="font-semibold text-[#fff4d7]">Shaken:</span>
                {{ match.recipe.methodGuidance.shakenFlavor }}
              </p>
              <p class="rounded-md bg-[#2b140a] px-3 py-2 text-sm text-[#f7dfac]">
                <span class="font-semibold text-[#fff4d7]">Stirred:</span>
                {{ match.recipe.methodGuidance.stirredFlavor }}
              </p>
            </div>
          </div>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCocktailRecommendations } from '@/composables/useCocktailRecommendations'
import type { CocktailMatch } from '@shared/schemas/cocktail'

type MatchType = 'original' | 'substitution' | 'alternate'
type CocktailMethod = 'shake' | 'stir' | 'build'

const ingredientText = ref('')
const hasSearched = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const samples = [
  { label: 'Cuba Libre', value: 'rum, coke, lime, amargo angostura' },
  { label: 'Missing bitters', value: 'rum, coke, lime' },
  { label: 'Fallback', value: 'rum, coke' },
  { label: 'Whiskey shelf', value: 'bourbon, lemon, sugar, bitters' },
]

const { matches, loading, error, recommend, reset } = useCocktailRecommendations()

const ingredients = computed(() =>
  ingredientText.value
    .split(/[,\n]/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean),
)

const ingredientCount = computed(() => ingredients.value.length)

function findCocktails() {
  hasSearched.value = true

  if (ingredients.value.length === 0) {
    reset()
    return
  }

  recommend(ingredients.value)
}

function scheduleCocktailSearch() {
  if (searchTimer) clearTimeout(searchTimer)

  if (ingredients.value.length === 0) {
    hasSearched.value = false
    reset()
    return
  }

  searchTimer = setTimeout(() => {
    findCocktails()
  }, 350)
}

watch(ingredientText, scheduleCocktailSearch)

function matchLabel(matchType: CocktailMatch['matchType']): string {
  const labels = {
    original: 'Original',
    substitution: 'One substitute',
    alternate: 'Alternate',
  } satisfies Record<MatchType, string>

  return labels[matchType as MatchType]
}

function badgeClass(matchType: CocktailMatch['matchType']): string {
  const classes = {
    original: 'bg-[#1f7a45] text-[#fff4d7]',
    substitution: 'bg-[#ffd56a] text-[#1f0f08]',
    alternate: 'bg-[#8f5b20] text-[#fff4d7]',
  } satisfies Record<MatchType, string>

  return classes[matchType as MatchType]
}

function methodLabel(method: CocktailMatch['recipe']['primaryMethod']): string {
  const labels = {
    shake: 'Shake',
    stir: 'Stir',
    build: 'Build',
  } satisfies Record<CocktailMethod, string>

  return labels[method as CocktailMethod]
}
</script>
