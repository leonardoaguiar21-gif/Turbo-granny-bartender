import { z } from 'zod'

export const CocktailRecommendationRequestSchema = z.object({
  ingredients: z
    .array(z.string().trim().min(1, 'Ingredient cannot be empty'))
    .min(1, 'Add at least one ingredient or spirit')
    .max(40, 'Use 40 ingredients or fewer'),
})

export const CocktailIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  optional: z.boolean().optional(),
})

export const CocktailSubstitutionSchema = z.object({
  missingIngredient: z.string(),
  substitutes: z.array(z.string()).min(1),
  note: z.string(),
})

export const CocktailRecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  glassware: z.string(),
  ingredients: z.array(CocktailIngredientSchema),
  instructions: z.array(z.string()).min(1),
  primaryMethod: z.enum(['shake', 'stir', 'build']),
  canShake: z.boolean(),
  canStir: z.boolean(),
  methodGuidance: z.object({
    recommended: z.string(),
    shakenFlavor: z.string(),
    stirredFlavor: z.string(),
  }),
})

export const CocktailMatchSchema = z.object({
  recipe: CocktailRecipeSchema,
  matchType: z.enum(['original', 'substitution', 'alternate']),
  availableIngredients: z.array(z.string()),
  missingIngredients: z.array(z.string()),
  substitutions: z.array(CocktailSubstitutionSchema),
  reason: z.string(),
})

export const CocktailRecommendationResponseSchema = z.object({
  normalizedIngredients: z.array(z.string()),
  matches: z.array(CocktailMatchSchema),
})

export type CocktailRecommendationRequest = z.infer<
  typeof CocktailRecommendationRequestSchema
>
export type CocktailRecipe = z.infer<typeof CocktailRecipeSchema>
export type CocktailMatch = z.infer<typeof CocktailMatchSchema>
export type CocktailRecommendationResponse = z.infer<
  typeof CocktailRecommendationResponseSchema
>
