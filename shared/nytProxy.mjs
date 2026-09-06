/**
 * Logica del BFF proxy verso l'API del New York Times, condivisa fra:
 *  - il backend Express locale (`backend/src/routes.js`) usato da docker-compose
 *  - le Serverless Functions Vercel (`api/**`) usate in staging/produzione
 *
 * Nessuna dipendenza esterna: usa solo `fetch` nativo di Node >= 18.
 * La API key non compare mai nel corpo della risposta: viaggia solo nella
 * query string della richiesta verso NYT, quindi non finisce nei log applicativi
 * ne' nel payload restituito al browser.
 */

export const NYT_BASE_URL = 'https://api.nytimes.com/svc'

// Sezioni valide per la Top Stories API (allowlist per evitare path injection).
const VALID_SECTIONS = new Set([
  'home',
  'arts',
  'automobiles',
  'books',
  'business',
  'fashion',
  'food',
  'health',
  'insider',
  'magazine',
  'movies',
  'nyregion',
  'opinion',
  'politics',
  'realestate',
  'science',
  'sports',
  'sundayreview',
  'technology',
  'theater',
  't-magazine',
  'travel',
  'upshot',
  'us',
  'world',
])

const VALID_DAYS = new Set([1, 7, 30])

const DEFAULT_TTL_MS = 5 * 60 * 1000
const cache = new Map()

function ttlMs() {
  const raw = Number(process.env.PROXY_CACHE_TTL_MS)
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_TTL_MS
}

function fromCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key)
    return null
  }
  return entry.body
}

function toCache(key, body) {
  const ms = ttlMs()
  if (ms === 0) return
  cache.set(key, { body, expiresAt: Date.now() + ms })
}

/** Svuota la cache in memoria (usata dai test). */
export function _clearCache() {
  cache.clear()
}

async function fetchFromNyt(path, apiKey) {
  const url = `${NYT_BASE_URL}${path}?api-key=${encodeURIComponent(apiKey)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      return { status: 200, body: data }
    }
    // Errori upstream: 5xx normalizzati a 502, il resto passa attraverso.
    const status = res.status >= 500 ? 502 : res.status
    return {
      status,
      body: {
        error: 'nyt_upstream_error',
        upstreamStatus: res.status,
        message: data?.fault?.faultstring ?? data?.message ?? data?.errors ?? null,
      },
    }
  } catch (err) {
    const isAbort = err && err.name === 'AbortError'
    return {
      status: 504,
      body: { error: isAbort ? 'nyt_upstream_timeout' : 'nyt_request_failed' },
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * @param {{ resource: 'topstories' | 'mostpopular', params?: Record<string, unknown> }} input
 * @returns {Promise<{ status: number, body: unknown, cached?: boolean }>}
 */
export async function handleNytRequest({ resource, params = {} }) {
  let path
  let apiKey

  if (resource === 'topstories') {
    const section = String(params.section ?? '').toLowerCase()
    if (!VALID_SECTIONS.has(section)) {
      return { status: 400, body: { error: 'invalid_section', section } }
    }
    path = `/topstories/v2/${section}.json`
    apiKey = process.env.NYT_TOP_STORIES_KEY
  } else if (resource === 'mostpopular') {
    const requested = Number(params.days ?? 7)
    const days = VALID_DAYS.has(requested) ? requested : 7
    path = `/mostpopular/v2/viewed/${days}.json`
    apiKey = process.env.NYT_MOST_POPULAR_KEY
  } else {
    return { status: 404, body: { error: 'unknown_resource', resource } }
  }

  if (!apiKey) {
    return { status: 500, body: { error: 'server_misconfigured_missing_api_key' } }
  }

  const cached = fromCache(path)
  if (cached) {
    return { status: 200, body: cached, cached: true }
  }

  const result = await fetchFromNyt(path, apiKey)
  if (result.status === 200) {
    toCache(path, result.body)
  }
  return result
}
