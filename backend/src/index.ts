/**
 * backend/src/index.ts
 *
 * Main entry point. Bun's built-in HTTP server handles routing.
 *
 * To add a new resource:
 *   1. Create a handler in src/routes/yourResource.ts
 *   2. Import it here
 *   3. Add a route match below
 */
import { handleItems } from './routes/items'
import { handleCocktails } from './routes/cocktails'
import { handleOptions, notFound } from './middleware/response'

const PORT = Number(Bun.env.PORT ?? 43172)
const FRONTEND_DIST = new URL('../../frontend/dist/', import.meta.url)

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
}

function contentTypeFor(pathname: string): string {
  const extension = pathname.match(/\.[^.]+$/)?.[0]
  return extension ? CONTENT_TYPES[extension] ?? 'application/octet-stream' : 'text/html; charset=utf-8'
}

async function serveFrontend(url: URL): Promise<Response> {
  const requestedPath = decodeURIComponent(url.pathname)
  const safePath = requestedPath.includes('..') ? '/' : requestedPath
  const filePath = safePath === '/' ? 'index.html' : safePath.slice(1)
  const fileUrl = new URL(filePath, FRONTEND_DIST)
  const file = Bun.file(fileUrl)

  if (await file.exists()) {
    return new Response(file, {
      headers: {
        'Content-Type': contentTypeFor(filePath),
      },
    })
  }

  const index = Bun.file(new URL('index.html', FRONTEND_DIST))
  if (await index.exists()) {
    return new Response(index, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }

  return notFound()
}

Bun.serve({
  hostname: '0.0.0.0',
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    // Handle CORS preflight
    if (req.method === 'OPTIONS') return handleOptions()

    // -------------------- Routes --------------------
    if (url.pathname.startsWith('/api/cocktails')) return handleCocktails(req, url)
    if (url.pathname.startsWith('/api/items')) return handleItems(req, url)

    // Add more routes here:
    // if (url.pathname.startsWith('/api/users')) return handleUsers(req, url)
    // -----------------------------------------------

    return serveFrontend(url)
  },
})

console.log(`[ok] Backend running at http://127.0.0.1:${PORT}`)
