# Turbo granny bartender 3000 yujuuu

The cocktail matcher lets a user enter ingredients and alcohol they have on hand, then returns cocktail recipes with step-by-step instructions.

## Matching Rules

- If all required ingredients are available, return the original recipe.
- If exactly one required ingredient is missing, return the recipe with substitute options for that ingredient.
- If more than one required ingredient is missing, favor a simpler alternate cocktail that better fits the user's ingredients.

## Method Guidance

Every recipe explains whether it should be shaken, stirred, or built. When a drink can reasonably be shaken or stirred, the response describes how each method changes the flavor profile and texture.

## Manual Test Plan

- Happy path: enter `rum, coke, lime, amargo angostura` and confirm Cuba Libre appears as an original match.
- One-missing path: enter `rum, coke, lime` and confirm Cuba Libre appears with Angostura bitters substitutes.
- Fallback path: enter `rum, coke` and confirm Rum and Coke is recommended.
- Failure path: submit an empty ingredient list and confirm the backend returns an actionable validation error.

## Deployment

Recommended production path:

- One Railway service serving both the Vue frontend and Bun API.

Railway service settings:

- Build command: `bun install --linker hoisted && bun run build`
- Start command: `bun run start`

Backend environment:

- `PORT`: provided automatically by Railway. Read by `backend/src/index.ts`.

Frontend environment:

- `VITE_API_URL`: leave blank when the frontend and backend are served from the same Railway service.
