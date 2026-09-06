import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { registerRoutes } from './routes.js'
import { initObservability, captureError } from './observability.mjs'

const PORT = Number(process.env.PORT ?? 3001)
const APP_ENV = process.env.APP_ENV ?? 'development'
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:8080,http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

await initObservability()

const app = express()
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: CORS_ORIGINS }))
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

registerRoutes(app)

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' })
})

// Error handler: registra su Sentry senza esporre dettagli al client.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  captureError(err)
  res.status(500).json({ error: 'internal_error' })
})

app.listen(PORT, () => {
  console.log(`BFF NYT in ascolto su :${PORT} (env=${APP_ENV})`)
})
