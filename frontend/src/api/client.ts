import axios from 'axios'

/**
 * Il frontend NON parla piu direttamente con api.nytimes.com.
 * Tutte le chiamate passano dal BFF proxy sullo stesso dominio (`/api/nyt`),
 * cosi le API key NYT restano lato server e non finiscono nel bundle.
 *
 * - in locale (docker-compose) `/api` e' inoltrato da nginx / dal dev server Vite al servizio `backend`
 * - in produzione (Vercel) `/api/nyt/*` e' servito dalle Serverless Functions in `api/`
 */
export const nytClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/nyt',
  timeout: 15000,
})
