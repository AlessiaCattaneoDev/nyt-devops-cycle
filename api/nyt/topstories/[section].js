import { handleNytRequest } from '../../../shared/nytProxy.mjs'
import { captureError } from '../../../shared/observability.mjs'

export default async function handler(req, res) {
  try {
    const { status, body } = await handleNytRequest({
      resource: 'topstories',
      params: { section: req.query.section },
    })
    res.status(status).json(body)
  } catch (err) {
    await captureError(err, { route: 'topstories', section: req.query.section })
    res.status(500).json({ error: 'internal_error' })
  }
}
