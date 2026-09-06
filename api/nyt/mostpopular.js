import { handleNytRequest } from '../../shared/nytProxy.mjs'
import { captureError } from '../../shared/observability.mjs'

export default async function handler(req, res) {
  try {
    const { status, body } = await handleNytRequest({
      resource: 'mostpopular',
      params: { days: req.query.days },
    })
    res.status(status).json(body)
  } catch (err) {
    await captureError(err, { route: 'mostpopular' })
    res.status(500).json({ error: 'internal_error' })
  }
}
