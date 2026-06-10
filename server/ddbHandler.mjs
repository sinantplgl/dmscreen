// ─────────────────────────────────────────────────────────────────────────────
// Server-side D&D Beyond proxy. Two jobs, both server-side so the browser dodges
// CORS (Vite dev middleware in dev, the Node server in prod):
//
//   /ddb-api/rendered/:id   — character import. Drives a headless browser (see
//                             scrapeCharacter.mjs) so DDB computes every value,
//                             then returns the parsed sheet. The caller's
//                             CobaltSession cookie (private/campaign chars only)
//                             rides in `x-cobalt` and is never logged or stored.
//   /ddb-api/monster?url=   — monster import. Monster pages are server-rendered,
//                             so we just fetch the HTML and hand it back for the
//                             client to parse (no browser needed). Restricted to
//                             dndbeyond.com /monsters/ URLs.
// ─────────────────────────────────────────────────────────────────────────────

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

function send(res, status, obj) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(obj))
}

/**
 * Handle a request if it targets /ddb-api/*. Returns true if it handled the
 * request, false if the caller should continue (e.g. serve static).
 */
export async function ddbApiHandler(req, res) {
  const url = new URL(req.url, 'http://localhost')

  // ── monster import: fetch the (server-rendered) monster page HTML ──────────
  if (url.pathname === '/ddb-api/monster') {
    const target = url.searchParams.get('url') || ''
    // CobaltSession cookie (sent as x-cobalt) unlocks paid/campaign-only pages.
    const cobalt = req.headers['x-cobalt']
    try {
      const u = new URL(target)
      if (!/(^|\.)dndbeyond\.com$/.test(u.hostname) || !u.pathname.startsWith('/monsters/')) {
        throw new Error('Only D&D Beyond /monsters/… URLs can be imported.')
      }
      const headers = { 'User-Agent': UA, Accept: 'text/html' }
      if (cobalt) headers.Cookie = `CobaltSession=${cobalt}`
      const ddb = await fetch(u.href, { headers })
      if (!ddb.ok) throw new Error(`D&D Beyond returned ${ddb.status}`)
      const html = await ddb.text()
      send(res, 200, { success: true, html })
    } catch (err) {
      send(res, 502, { success: false, message: String(err?.message || err) })
    }
    return true
  }

  const rendered = url.pathname.match(/^\/ddb-api\/rendered\/(\d+)\/?$/)
  if (!rendered) return false

  const cobalt = req.headers['x-cobalt']
  try {
    // dynamic import: the base server / Docker image works even without playwright installed
    const { scrapeCharacter } = await import('./scrapeCharacter.mjs')
    const data = await scrapeCharacter(rendered[1], cobalt ? String(cobalt) : undefined)
    send(res, 200, { success: true, data })
  } catch (err) {
    const msg = String(err?.message || err)
    const hint = /Cannot find package 'playwright'|Executable doesn't exist|channel|connectOverCDP|chromium\.connect|ECONNREFUSED|ENOTFOUND/.test(msg)
      ? 'The headless browser is not available. In Docker, start it with `docker compose --profile browserless up`; locally, run `npx playwright install chromium-headless-shell`; or set BROWSER_CDP_URL to a browser on your host.'
      : msg
    send(res, 502, { success: false, message: hint })
  }
  return true
}
