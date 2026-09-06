import { captureError } from '../../shared/observability.mjs'

const debugEnabled = process.env.APP_ENV !== 'production' || process.env.DEBUG_ENDPOINTS === 'true'

export default async function handler(_req, res) {
  if (!debugEnabled) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  const err = new Error('Errore di test intenzionale dalla Serverless Function /api/debug/boom')
  await captureError(err, { route: 'debug/boom' })
  res.status(500).json({ error: 'internal_error', simulated: true })
}
