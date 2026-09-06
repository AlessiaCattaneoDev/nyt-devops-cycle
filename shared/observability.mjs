/**
 * Error tracking lato server, condiviso da backend Express e Serverless Functions.
 *
 * Trasporto Sentry minimale via `fetch` nativo: nessuna dipendenza, nessun
 * albero OpenTelemetry. Se `SENTRY_DSN_BACKEND` non e' impostato, `captureError`
 * ripiega su `console.error`, cosi in locale e nei test non serve configurare nulla.
 *
 * DSN atteso: https://<publicKey>@<host>/<projectId>
 */

function parseDsn(dsn) {
  try {
    const url = new URL(dsn)
    const projectId = url.pathname.replace(/^\/+/, '')
    if (!url.username || !projectId) return null
    return {
      publicKey: url.username,
      host: url.host,
      protocol: url.protocol.replace(':', ''),
      projectId,
    }
  } catch {
    return null
  }
}

const dsn = process.env.SENTRY_DSN_BACKEND
const parsed = dsn ? parseDsn(dsn) : null
const environment = process.env.SENTRY_ENVIRONMENT ?? process.env.APP_ENV ?? 'development'
const release = process.env.APP_RELEASE || undefined

function randomId() {
  // 32 hex chars
  let out = ''
  for (let i = 0; i < 32; i += 1) out += Math.floor(Math.random() * 16).toString(16)
  return out
}

export function isEnabled() {
  return Boolean(parsed)
}

export async function initObservability() {
  // Nessuna inizializzazione necessaria per il trasporto HTTP; funzione
  // mantenuta per simmetria con l'SDK e per un log esplicito all'avvio.
  if (parsed) {
    console.log(`[observability] Sentry attivo (env=${environment})`)
  }
  return isEnabled()
}

export async function captureError(err, context) {
  if (!parsed) {
    console.error('[unhandled]', err, context ?? '')
    return
  }

  const eventId = randomId()
  const nowIso = new Date().toISOString()
  const endpoint = `${parsed.protocol}://${parsed.host}/api/${parsed.projectId}/envelope/`

  const event = {
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: 'node',
    level: 'error',
    environment,
    release,
    server_name: process.env.VERCEL_REGION || process.env.HOSTNAME || undefined,
    exception: {
      values: [
        {
          type: err?.name || 'Error',
          value: err?.message || String(err),
          stacktrace: { frames: framesFromStack(err?.stack) },
        },
      ],
    },
    extra: context ? { context } : undefined,
  }

  const body =
    JSON.stringify({ event_id: eventId, sent_at: nowIso }) +
    '\n' +
    JSON.stringify({ type: 'event' }) +
    '\n' +
    JSON.stringify(event)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=nyt-devops/1.0`,
      },
      body,
    }).finally(() => clearTimeout(timeout))
  } catch (sendErr) {
    console.error('[observability] invio a Sentry fallito:', sendErr?.message)
    console.error('[unhandled]', err, context ?? '')
  }
}

function framesFromStack(stack) {
  if (!stack || typeof stack !== 'string') return []
  return stack
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at '))
    .map((line) => ({ function: line.slice(3) }))
    .reverse()
}
