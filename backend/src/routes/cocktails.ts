import { CocktailRecommendationRequestSchema, type CocktailRecipe } from '@shared/schemas/cocktail'
import { error, json } from '../middleware/response'

type IngredientToken = {
  canonical: string
  aliases: string[]
}

type Recipe = CocktailRecipe & {
  required: IngredientToken[]
}

const recipes: Recipe[] = [
  {
    id: 'cuba-libre',
    name: 'Cuba Libre',
    description: 'Rum, cola, lime, and aromatic bitters with a bright, spiced finish.',
    glassware: 'Highball',
    primaryMethod: 'build',
    canShake: false,
    canStir: true,
    methodGuidance: {
      recommended: 'Build it over ice and give it a short stir to keep the cola lively.',
      shakenFlavor:
        'Shaking is not recommended because carbonation turns foamy and flat, making the drink taste thinner.',
      stirredFlavor:
        'Stirring keeps the cola crisp while folding lime and bitters evenly through the rum.',
    },
    ingredients: [
      { name: 'White or aged rum', amount: '2 oz' },
      { name: 'Cola', amount: '4 oz' },
      { name: 'Fresh lime juice', amount: '1/2 oz' },
      { name: 'Angostura bitters', amount: '2 dashes' },
    ],
    instructions: [
      'Fill a highball glass with ice.',
      'Add rum, fresh lime juice, and Angostura bitters.',
      'Top with cola.',
      'Stir gently for 5 seconds.',
      'Garnish with a lime wedge if you have one.',
    ],
    required: [
      { canonical: 'rum', aliases: ['white rum', 'aged rum', 'dark rum'] },
      { canonical: 'cola', aliases: ['coke', 'coca cola', 'pepsi'] },
      { canonical: 'lime', aliases: ['lime juice', 'fresh lime'] },
      { canonical: 'angostura bitters', aliases: ['bitters', 'amargo angostura', 'aromatic bitters'] },
    ],
  },
  {
    id: 'rum-and-coke',
    name: 'Rum and Coke',
    description: 'A simple, refreshing two-ingredient highball.',
    glassware: 'Highball',
    primaryMethod: 'build',
    canShake: false,
    canStir: true,
    methodGuidance: {
      recommended: 'Build over ice and stir once or twice.',
      shakenFlavor:
        'Shaking is not useful here because cola loses bubbles and the drink becomes sweeter and flatter.',
      stirredFlavor:
        'A light stir keeps carbonation sharp and lets the rum sit warmly behind the cola.',
    },
    ingredients: [
      { name: 'Rum', amount: '2 oz' },
      { name: 'Cola', amount: '4-6 oz' },
    ],
    instructions: [
      'Fill a highball glass with ice.',
      'Pour in the rum.',
      'Top with cold cola.',
      'Stir gently once or twice.',
    ],
    required: [
      { canonical: 'rum', aliases: ['white rum', 'aged rum', 'dark rum'] },
      { canonical: 'cola', aliases: ['coke', 'coca cola', 'pepsi'] },
    ],
  },
  {
    id: 'daiquiri',
    name: 'Daiquiri',
    description: 'A clean sour with rum, lime, and sugar.',
    glassware: 'Coupe',
    primaryMethod: 'shake',
    canShake: true,
    canStir: true,
    methodGuidance: {
      recommended: 'Shake hard because citrus needs aeration and dilution to taste bright instead of sharp.',
      shakenFlavor:
        'Shaking makes the drink colder, lighter, and more vivid, with lime lifted into the aroma.',
      stirredFlavor:
        'Stirring tastes silkier and denser, but the lime can feel sharper and less integrated.',
    },
    ingredients: [
      { name: 'White rum', amount: '2 oz' },
      { name: 'Fresh lime juice', amount: '3/4 oz' },
      { name: 'Simple syrup', amount: '3/4 oz' },
    ],
    instructions: [
      'Add rum, lime juice, and simple syrup to a shaker.',
      'Fill the shaker with ice.',
      'Shake hard for 10-12 seconds.',
      'Strain into a chilled coupe.',
    ],
    required: [
      { canonical: 'rum', aliases: ['white rum', 'aged rum'] },
      { canonical: 'lime', aliases: ['lime juice', 'fresh lime'] },
      { canonical: 'simple syrup', aliases: ['sugar syrup', 'sugar', 'agave syrup'] },
    ],
  },
  {
    id: 'whiskey-sour',
    name: 'Whiskey Sour',
    description: 'Whiskey, lemon, and sugar balanced into a tart, rounded sour.',
    glassware: 'Rocks',
    primaryMethod: 'shake',
    canShake: true,
    canStir: true,
    methodGuidance: {
      recommended: 'Shake to brighten the lemon and give the drink a softer texture.',
      shakenFlavor:
        'Shaking adds chill, dilution, and a light foam, making the whiskey feel rounder.',
      stirredFlavor:
        'Stirring keeps more whiskey weight and oak, but the lemon reads more direct and tart.',
    },
    ingredients: [
      { name: 'Whiskey', amount: '2 oz' },
      { name: 'Fresh lemon juice', amount: '3/4 oz' },
      { name: 'Simple syrup', amount: '3/4 oz' },
    ],
    instructions: [
      'Add whiskey, lemon juice, and simple syrup to a shaker.',
      'Fill with ice.',
      'Shake for 10-12 seconds.',
      'Strain into a rocks glass over fresh ice.',
    ],
    required: [
      { canonical: 'whiskey', aliases: ['bourbon', 'rye'] },
      { canonical: 'lemon', aliases: ['lemon juice', 'fresh lemon'] },
      { canonical: 'simple syrup', aliases: ['sugar syrup', 'sugar', 'honey syrup'] },
    ],
  },
  {
    id: 'old-fashioned',
    name: 'Old Fashioned',
    description: 'Spirit-forward whiskey softened with sugar and bitters.',
    glassware: 'Rocks',
    primaryMethod: 'stir',
    canShake: true,
    canStir: true,
    methodGuidance: {
      recommended: 'Stir slowly so the drink stays clear, rich, and spirit-forward.',
      shakenFlavor:
        'Shaking makes it colder and more diluted, but cloudy and less plush.',
      stirredFlavor:
        'Stirring preserves whiskey aroma, a glossy texture, and controlled sweetness.',
    },
    ingredients: [
      { name: 'Whiskey', amount: '2 oz' },
      { name: 'Simple syrup or sugar cube', amount: '1 tsp' },
      { name: 'Angostura bitters', amount: '2 dashes' },
    ],
    instructions: [
      'Add whiskey, syrup, and bitters to a mixing glass.',
      'Fill with ice.',
      'Stir for 20-30 seconds.',
      'Strain into a rocks glass over one large ice cube.',
      'Express orange peel over the top if available.',
    ],
    required: [
      { canonical: 'whiskey', aliases: ['bourbon', 'rye'] },
      { canonical: 'simple syrup', aliases: ['sugar', 'sugar cube', 'demerara syrup'] },
      { canonical: 'angostura bitters', aliases: ['bitters', 'amargo angostura', 'aromatic bitters'] },
    ],
  },
  {
    id: 'margarita',
    name: 'Margarita',
    description: 'Tequila, lime, and orange liqueur with a crisp citrus snap.',
    glassware: 'Rocks',
    primaryMethod: 'shake',
    canShake: true,
    canStir: true,
    methodGuidance: {
      recommended: 'Shake because fresh lime benefits from aeration and fast chilling.',
      shakenFlavor:
        'Shaking tastes brighter, colder, and a little more energetic.',
      stirredFlavor:
        'Stirring makes a smoother, denser drink where tequila shows more clearly.',
    },
    ingredients: [
      { name: 'Tequila', amount: '2 oz' },
      { name: 'Fresh lime juice', amount: '1 oz' },
      { name: 'Orange liqueur', amount: '3/4 oz' },
    ],
    instructions: [
      'Add tequila, lime juice, and orange liqueur to a shaker.',
      'Fill with ice.',
      'Shake for 10-12 seconds.',
      'Strain into a rocks glass over fresh ice.',
      'Salt the rim first if you like that style.',
    ],
    required: [
      { canonical: 'tequila', aliases: ['blanco tequila', 'reposado tequila'] },
      { canonical: 'lime', aliases: ['lime juice', 'fresh lime'] },
      { canonical: 'orange liqueur', aliases: ['triple sec', 'cointreau', 'curacao'] },
    ],
  },
  {
    id: 'gin-tonic',
    name: 'Gin and Tonic',
    description: 'A crisp, bitter, aromatic highball.',
    glassware: 'Highball',
    primaryMethod: 'build',
    canShake: false,
    canStir: true,
    methodGuidance: {
      recommended: 'Build in the glass and stir briefly to protect the tonic bubbles.',
      shakenFlavor:
        'Shaking knocks out carbonation and makes the drink taste flat and more bitter.',
      stirredFlavor:
        'A short stir keeps the quinine snap and gin botanicals clean.',
    },
    ingredients: [
      { name: 'Gin', amount: '2 oz' },
      { name: 'Tonic water', amount: '4-6 oz' },
      { name: 'Lime', amount: '1 wedge', optional: true },
    ],
    instructions: [
      'Fill a highball glass with ice.',
      'Add gin.',
      'Top with tonic water.',
      'Stir gently and garnish with lime if available.',
    ],
    required: [
      { canonical: 'gin', aliases: ['london dry gin'] },
      { canonical: 'tonic water', aliases: ['tonic'] },
    ],
  },
]

const substitutions: Record<string, string[]> = {
  'angostura bitters': ['orange bitters', 'aromatic bitters from another brand', 'a tiny pinch of baking spice'],
  lime: ['lemon juice', 'grapefruit juice with a pinch of sugar', 'bottled lime juice'],
  lemon: ['lime juice', 'grapefruit juice', 'citric acid solution'],
  'simple syrup': ['sugar stirred with a splash of warm water', 'agave syrup', 'honey syrup'],
  'orange liqueur': ['orange syrup plus a splash of extra tequila', 'orange juice plus simple syrup'],
  cola: ['another cola brand', 'spiced soda'],
  'tonic water': ['soda water plus a small splash of bitter aperitif', 'lemon-lime soda for a sweeter drink'],
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function hasIngredient(input: Set<string>, token: IngredientToken): boolean {
  return [token.canonical, ...token.aliases].some((name) => input.has(normalize(name)))
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

function withoutInternalFields(recipe: Recipe): CocktailRecipe {
  const { required, ...publicRecipe } = recipe
  return publicRecipe
}

export async function handleCocktails(req: Request, url: URL): Promise<Response> {
  if (req.method !== 'POST' || url.pathname !== '/api/cocktails/recommendations') {
    return error('Method not allowed', 405)
  }

  const body = await req.json().catch(() => null)
  const parsed = CocktailRecommendationRequestSchema.safeParse(body)

  if (!parsed.success) {
    return error(parsed.error.issues.map((issue) => issue.message).join(', '))
  }

  const normalizedIngredients = unique(parsed.data.ingredients.map(normalize).filter(Boolean))
  const input = new Set(normalizedIngredients)

  const matches = recipes
    .map((recipe) => {
      const availableIngredients = recipe.required
        .filter((ingredient) => hasIngredient(input, ingredient))
        .map((ingredient) => ingredient.canonical)
      const missingIngredients = recipe.required
        .filter((ingredient) => !hasIngredient(input, ingredient))
        .map((ingredient) => ingredient.canonical)

      return { recipe, availableIngredients, missingIngredients }
    })
    .filter(({ availableIngredients }) => availableIngredients.length > 0)
    .sort((a, b) => {
      if (a.missingIngredients.length !== b.missingIngredients.length) {
        return a.missingIngredients.length - b.missingIngredients.length
      }

      return b.availableIngredients.length - a.availableIngredients.length
    })

  const recommendations = matches
    .filter((match) => match.missingIngredients.length <= 1 || match.availableIngredients.length >= 2)
    .sort((a, b) => {
      if (a.availableIngredients.length !== b.availableIngredients.length) {
        return b.availableIngredients.length - a.availableIngredients.length
      }

      return a.missingIngredients.length - b.missingIngredients.length
    })
    .map((match) => {
      const recipe = withoutInternalFields(match.recipe)

      if (match.missingIngredients.length === 0) {
        return {
          ...match,
          recipe,
          matchType: 'original' as const,
          substitutions: [],
          reason: 'You have every required ingredient for the original recipe.',
        }
      }

      if (match.missingIngredients.length === 1) {
        const missingIngredient = match.missingIngredients[0]

        return {
          ...match,
          recipe,
          matchType: 'substitution' as const,
          substitutions: [
            {
              missingIngredient,
              substitutes: substitutions[missingIngredient] ?? ['a close ingredient in the same flavor family'],
              note: `You are only missing ${missingIngredient}, so this stays close to the original cocktail.`,
            },
          ],
          reason: `You are missing only ${missingIngredient}, so a substitution can keep the drink on track.`,
        }
      }

      return {
        ...match,
        recipe,
        matchType: 'alternate' as const,
        substitutions: [],
        reason:
          'More than one required ingredient is missing, so this is a better alternate cocktail for what you have.',
      }
    })
    .slice(0, 5)

  return json({
    normalizedIngredients,
    matches: recommendations,
  })
}
