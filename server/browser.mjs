// ─────────────────────────────────────────────────────────────────────────────
// Headless-browser provider for the "rendered" D&D Beyond scrape.
//
// Three modes, chosen by env var so the same code works on a laptop and inside
// Docker (where we DON'T want a browser baked into the image):
//
//   BROWSER_WS_ENDPOINT  -> connect to a Playwright server  (chromium.connect)
//   BROWSER_CDP_URL      -> connect to a Chrome DevTools endpoint on the host
//                           (chromium.connectOverCDP) — e.g. a headless shell
//                           you run on your laptop with --remote-debugging-port.
//   (neither)            -> launch the local chromium-headless-shell.
//
// In Docker, set BROWSER_CDP_URL=http://host.docker.internal:9222 and run the
// shell on the host — the container drives the host's browser, no browser in
// the image. playwright is imported dynamically so the base server runs fine
// when it isn't installed.
// ─────────────────────────────────────────────────────────────────────────────

let cached = null // { browser, kind }

async function makeBrowser() {
  const { chromium } = await import('playwright')
  const ws = process.env.BROWSER_WS_ENDPOINT
  const cdp = process.env.BROWSER_CDP_URL

  if (ws) return { browser: await chromium.connect(ws), kind: 'remote' }
  if (cdp) return { browser: await chromium.connectOverCDP(cdp), kind: 'remote' }
  return {
    browser: await chromium.launch({ channel: 'chromium-headless-shell', args: ['--no-sandbox'] }),
    kind: 'local',
  }
}

/** Get a shared browser, reconnecting if a remote endpoint dropped. */
export async function getBrowser() {
  if (cached?.browser?.isConnected?.()) return cached.browser
  cached = await makeBrowser()
  return cached.browser
}

export async function closeBrowser() {
  if (cached?.kind === 'local') await cached.browser.close().catch(() => {})
  cached = null
}
