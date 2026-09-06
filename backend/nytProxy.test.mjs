import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { handleNytRequest, _clearCache } from './src/nytProxy.mjs'

const realFetch = globalThis.fetch

beforeEach(() => {
  _clearCache()
  process.env.NYT_TOP_STORIES_KEY = 'test-top-key'
  process.env.NYT_MOST_POPULAR_KEY = 'test-pop-key'
  process.env.PROXY_CACHE_TTL_MS = '60000'
})

afterEach(() => {
  globalThis.fetch = realFetch
})

test('rifiuta una sezione non valida senza chiamare NYT', async () => {
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response('{}', { status: 200 })
  }
  const res = await handleNytRequest({
    resource: 'topstories',
    params: { section: '../etc/passwd' },
  })
  assert.equal(res.status, 400)
  assert.equal(called, false)
})

test('inoltra la richiesta topstories e non espone la api key nel body', async () => {
  let seenUrl = ''
  globalThis.fetch = async (url) => {
    seenUrl = String(url)
    return new Response(JSON.stringify({ status: 'OK', results: [{ title: 'x' }] }), {
      status: 200,
    })
  }
  const res = await handleNytRequest({ resource: 'topstories', params: { section: 'world' } })
  assert.equal(res.status, 200)
  assert.equal(res.body.results.length, 1)
  assert.match(seenUrl, /topstories\/v2\/world\.json/)
  assert.match(seenUrl, /api-key=test-top-key/)
  assert.doesNotMatch(JSON.stringify(res.body), /test-top-key/)
})

test('serve dalla cache alla seconda chiamata', async () => {
  let calls = 0
  globalThis.fetch = async () => {
    calls += 1
    return new Response(JSON.stringify({ status: 'OK', results: [] }), { status: 200 })
  }
  await handleNytRequest({ resource: 'mostpopular', params: { days: 7 } })
  const second = await handleNytRequest({ resource: 'mostpopular', params: { days: 7 } })
  assert.equal(calls, 1)
  assert.equal(second.cached, true)
})

test('passa attraverso un 401 upstream (chiave errata)', async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ fault: { faultstring: 'Invalid ApiKey' } }), { status: 401 })
  const res = await handleNytRequest({ resource: 'mostpopular', params: {} })
  assert.equal(res.status, 401)
  assert.equal(res.body.error, 'nyt_upstream_error')
})

test('normalizza un 500 upstream a 502', async () => {
  globalThis.fetch = async () => new Response('boom', { status: 500 })
  const res = await handleNytRequest({ resource: 'topstories', params: { section: 'home' } })
  assert.equal(res.status, 502)
})

test('500 se manca la API key sul server', async () => {
  delete process.env.NYT_MOST_POPULAR_KEY
  const res = await handleNytRequest({ resource: 'mostpopular', params: {} })
  assert.equal(res.status, 500)
  assert.equal(res.body.error, 'server_misconfigured_missing_api_key')
})
