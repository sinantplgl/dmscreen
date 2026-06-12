// Minimal zero-dependency production server: serves the built static site from
// ./dist and handles the /ddb-api proxy. Used by the Docker image and runnable
// directly with `npm run serve` after `npm run build`.
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ddbApiHandler } from './ddbHandler.mjs'
import { backupApiHandler } from './backupHandler.mjs'

const ROOT = normalize(join(fileURLToPath(import.meta.url), '..', '..'))
const DIST = join(ROOT, 'dist')
const PORT = process.env.PORT || 8080

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function serveFile(res, file, fallbackToIndex = true) {
  try {
    const data = await readFile(file)
    res.setHeader('content-type', MIME[extname(file)] || 'application/octet-stream')
    res.statusCode = 200
    res.end(data)
  } catch {
    if (fallbackToIndex) {
      // SPA fallback
      return serveFile(res, join(DIST, 'index.html'), false)
    }
    res.statusCode = 404
    res.end('Not found')
  }
}

const server = http.createServer(async (req, res) => {
  if (await ddbApiHandler(req, res)) return
  if (await backupApiHandler(req, res)) return

  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const requested = normalize(join(DIST, pathname === '/' ? '/index.html' : pathname))
  if (!requested.startsWith(DIST)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }
  // Assets have an extension; routes without one fall back to index.html.
  await serveFile(res, requested, !extname(requested))
})

server.listen(PORT, () => {
  console.log(`DM Screen running at http://localhost:${PORT}`)
})
