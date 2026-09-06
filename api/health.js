export default function handler(_req, res) {
  res.status(200).json({
    status: 'ok',
    env: process.env.APP_ENV ?? 'unknown',
    runtime: 'vercel-serverless',
    time: new Date().toISOString(),
  })
}
