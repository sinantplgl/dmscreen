// ─────────────────────────────────────────────────────────────────────────────
// Server-side D&D Beyond proxy for the character import.
//
// The Player Roster's "Refresh" hits /ddb-api/rendered/:id. This handler runs
// server-side (Vite dev middleware in dev, the Node server in prod) and drives a
// headless browser (see scrapeCharacter.mjs) to load the real D&D Beyond sheet so
// DDB itself computes every value, then returns the parsed result.
//
// The caller's CobaltSession cookie (only needed for private / campaign-only
// characters) is passed in the `x-cobalt` header and handed to the browser
// session — it is never logged or stored on disk.
// ─────────────────────────────────────────────────────────────────────────────

function send(res, status, obj) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(obj))
}

/**
 * Handle a request if it targets /ddb-api/rendered/:id. Returns true if it
 * handled the request, false if the caller should continue (e.g. serve static).
 */
export async function ddbApiHandler(req, res) {
  const url = new URL(req.url, 'http://localhost')
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
    const hint = /Cannot find package 'playwright'|Executable doesn't exist|channel/.test(msg)
      ? 'The headless browser is not available. Run `npx playwright install chromium-headless-shell`, or set BROWSER_CDP_URL to a browser on your host.'
      : msg
    send(res, 502, { success: false, message: hint })
  }
  return true
}
