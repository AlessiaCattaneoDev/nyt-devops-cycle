/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Ambiente logico: development | staging | production */
  readonly VITE_APP_ENV?: string
  /** DSN Sentry per il frontend; se vuoto, l'error tracking e' disattivato */
  readonly VITE_SENTRY_DSN?: string
  /** Release usata da Sentry (di norma lo SHA del commit) */
  readonly VITE_APP_RELEASE?: string
  /** Abilita le rotte di debug (/debug/boom) anche fuori da development */
  readonly VITE_DEBUG_ENDPOINTS?: string
  /** Override del base URL del BFF (default: /api/nyt) */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
