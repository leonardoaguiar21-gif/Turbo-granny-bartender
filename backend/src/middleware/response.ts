/**
 * backend/src/middleware/response.ts
 *
 * Helpers for consistent API responses and CORS headers.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

export function error(message: string, status = 400): Response {
  return json({ error: message }, status)
}

export function notFound(): Response {
  return error('Not found', 404)
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}
