// ─────────────────────────────────────────────────────────────────────────────
// Server-side D&D Beyond proxy.
//
// The browser cannot call D&D Beyond's character-service directly (no CORS
// header), and campaign-only characters require an authenticated session. This
// handler runs server-side (Vite dev middleware in dev, the Node server in prod)
// and:
//   1. exchanges the caller's CobaltSession cookie for a short-lived Bearer token
//      at auth-service.dndbeyond.com (cached in-memory ~80s), then
//   2. fetches the character JSON from character-service with that Bearer token.
//
// This is the same exchange Foundry's ddb-importer / ddb-proxy use. The cobalt
// cookie is sent by the browser in the `x-cobalt` header and only ever forwarded
// to D&D Beyond — it is never logged or stored on disk.
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_URL = 'https://auth-service.dndbeyond.com/v1/cobalt-token'
const CHAR_URL = (id) => `https://character-service.dndbeyond.com/character/v5/character/${id}`

/** cobalt cookie value -> { token, exp(ms) } */
const tokenCache = new Map()

async function getBearer(cobalt) {
  const cached = tokenCache.get(cobalt)
  if (cached && cached.exp > Date.now()) return cached.token

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { Cookie: `CobaltSession=${cobalt}` },
  })
  if (!res.ok) {
    throw new Error(
      `cobalt-token exchange failed (${res.status}). Your CobaltSession cookie is ` +
        `probably expired or wrong — grab a fresh one while logged in to D&D Beyond.`,
    )
  }
  const json = await res.json()
  const ttlMs = (json.ttl ? json.ttl * 1000 : 90_000) - 10_000
  tokenCache.set(cobalt, { token: json.token, exp: Date.now() + Math.max(ttlMs, 15_000) })
  return json.token
}

function send(res, status, obj) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(obj))
}

/**
 * Handle a request if it targets /ddb-api/character/:id. Returns true if it
 * handled the request, false if the caller should continue (e.g. serve static).
 */
export async function ddbApiHandler(req, res) {
  const url = new URL(req.url, 'http://localhost')

  // ── rendered scrape: drives a headless browser so DDB computes everything ──
  const rendered = url.pathname.match(/^\/ddb-api\/rendered\/(\d+)\/?$/)
  if (rendered) {
    const cobalt = req.headers['x-cobalt']
    try {
      // dynamic import: the base server / Docker image works even without playwright installed
      const { scrapeCharacter } = await import('./scrapeCharacter.mjs')
      const data = await scrapeCharacter(rendered[1], cobalt ? String(cobalt) : undefined)
      send(res, 200, { success: true, data })
    } catch (err) {
      const msg = String(err?.message || err)
      const hint = /Cannot find package 'playwright'|Executable doesn't exist|channel/.test(msg)
        ? 'The headless browser is not available. Run `npx playwright install chromium-headless-shell`, or set BROWSER_CDP_URL to a browser on your host.'
        : msg
      send(res, 502, { success: false, message: hint })
    }
    return true
  }

  const match = url.pathname.match(/^\/ddb-api\/character\/(\d+)\/?$/)
  if (!match) return false

  const id = match[1]
  const cobalt = req.headers['x-cobalt']

  try {
    const headers = { Accept: 'application/json' }
    if (cobalt && String(cobalt).trim()) {
      headers.Authorization = `Bearer ${await getBearer(String(cobalt).trim())}`
    }
    const ddb = await fetch(CHAR_URL(id), { headers })
    const body = await ddb.text()
    res.statusCode = ddb.status
    res.setHeader('content-type', 'application/json')
    res.end(body)
  } catch (err) {
    send(res, 502, { success: false, message: String(err.message || err) })
  }
  return true
}
