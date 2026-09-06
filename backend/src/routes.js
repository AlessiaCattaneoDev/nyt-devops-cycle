import { handleNytRequest } from './nytProxy.mjs'

const debugEnabled = process.env.APP_ENV !== 'production' || process.env.DEBUG_ENDPOINTS === 'true'

/**
 * Monta le rotte del BFF sull'app Express passata.
 * @param {import('express').Express} app
 */
export function registerRoutes(app) {
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      env: process.env.APP_ENV ?? 'unknown',
      time: new Date().toISOString(),
    })
  })

  app.get('/api/nyt/topstories/:section', async (req, res, next) => {
    try {
      const { status, body } = await handleNytRequest({
        resource: 'topstories',
        params: { section: req.params.section },
      })
      res.status(status).json(body)
    } catch (err) {
      next(err)
    }
  })

  app.get('/api/nyt/mostpopular', async (req, res, next) => {
    try {
      const { status, body } = await handleNytRequest({
        resource: 'mostpopular',
        params: { days: req.query.days },
      })
      res.status(status).json(body)
    } catch (err) {
      next(err)
    }
  })

  if (debugEnabled) {
    // Step "Simula autonomamente un errore": lancia un'eccezione non gestita
    // che l'error handler inoltra a Sentry.
    app.get('/api/debug/boom', () => {
      throw new Error('Errore di test intenzionale dal BFF /api/debug/boom')
    })
  }
}
