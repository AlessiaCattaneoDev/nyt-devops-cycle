import * as Sentry from '@sentry/react'

let started = false

/**
 * Inizializza Sentry per il frontend.
 * Se `VITE_SENTRY_DSN` non e' impostato (tipico in sviluppo) l'error tracking
 * resta disattivato e la funzione non fa nulla.
 */
export function initMonitoring(): void {
  if (started) return
  started = true

  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    // Nessun DSN: Sentry disabilitato (es. sviluppo locale)
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_APP_ENV ?? 'development',
    release: import.meta.env.VITE_APP_RELEASE || undefined,
    tracesSampleRate: 0.1,
    // Non inviare PII di default
    sendDefaultPii: false,
  })
}

export { Sentry }
