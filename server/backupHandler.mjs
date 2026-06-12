// ─────────────────────────────────────────────────────────────────────────────
// Server-side on-disk backup of the app's data. The browser keeps its own copy
// in localStorage; this writes a parallel copy to a folder on the HOST so the
// data survives a browser-data clear (which is how ~2 days of work was lost).
//
//   POST /backup-api/save?interval=<min>  — body is the JSON from exportData().
//       Always refreshes `latest.json`; additionally drops a timestamped history
//       snapshot at most once per <interval> minutes, then prunes to KEEP newest.
//   GET  /backup-api/list                 — list available backups (newest first).
//   GET  /backup-api/file?name=<file>     — return one backup's JSON.
//
// Zero dependencies (node:fs / node:path only). Shared by the Vite dev middleware
// and the prod Node server, exactly like ddbHandler.mjs.
// ─────────────────────────────────────────────────────────────────────────────
import { mkdir, readFile, writeFile, readdir, stat, unlink } from 'node:fs/promises'
import { join, normalize, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = normalize(join(fileURLToPath(import.meta.url), '..', '..'))
const BACKUP_DIR = process.env.BACKUP_DIR || join(ROOT, 'backups')
const KEEP = Number(process.env.BACKUP_KEEP) || 20

const LATEST = 'latest.json'
const SNAPSHOT_RE = /^dm-screen-[\dT-]+\.json$/

function send(res, status, obj) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(obj))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      // ~50MB guard so a runaway client can't exhaust memory
      if (data.length > 50 * 1024 * 1024) reject(new Error('Backup payload too large'))
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

// `2026-06-12T14:30:05.123Z` → `dm-screen-2026-06-12T14-30-05.json` (filesystem-safe).
function snapshotName(date) {
  const iso = date.toISOString().slice(0, 19).replace(/:/g, '-')
  return `dm-screen-${iso}.json`
}

// Existing history snapshots with their mtimes, newest first.
async function listSnapshots() {
  let names
  try {
    names = await readdir(BACKUP_DIR)
  } catch {
    return []
  }
  const snaps = await Promise.all(
    names
      .filter((n) => SNAPSHOT_RE.test(n))
      .map(async (name) => {
        const s = await stat(join(BACKUP_DIR, name))
        return { name, size: s.size, mtime: s.mtimeMs }
      }),
  )
  return snaps.sort((a, b) => b.mtime - a.mtime)
}

/**
 * Handle a request if it targets /backup-api/*. Returns true if it handled the
 * request, false if the caller should continue (e.g. serve static).
 */
export async function backupApiHandler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  if (!url.pathname.startsWith('/backup-api/')) return false

  // ── save: refresh latest + (interval-gated) history snapshot ───────────────
  if (url.pathname === '/backup-api/save' && req.method === 'POST') {
    try {
      const body = await readBody(req)
      JSON.parse(body) // validate; throws on garbage so we never persist junk
      const intervalMin = Math.max(0, Number(url.searchParams.get('interval')) || 0)

      await mkdir(BACKUP_DIR, { recursive: true })
      const latestPath = join(BACKUP_DIR, LATEST)
      await writeFile(latestPath, body)

      const snaps = await listSnapshots()
      const newest = snaps[0]?.mtime ?? 0
      const elapsed = Date.now() - newest
      const wroteSnapshot = snaps.length === 0 || elapsed >= intervalMin * 60_000
      if (wroteSnapshot) {
        await writeFile(join(BACKUP_DIR, snapshotName(new Date())), body)
        // prune oldest beyond KEEP (the just-written one is newest)
        const after = await listSnapshots()
        for (const old of after.slice(KEEP)) {
          await unlink(join(BACKUP_DIR, old.name)).catch(() => {})
        }
      }
      // hand back latest.json's mtime so the client can track what it last synced
      const latestMtime = (await stat(latestPath)).mtimeMs
      send(res, 200, { success: true, wroteSnapshot, latestMtime })
    } catch (err) {
      send(res, 400, { success: false, message: String(err?.message || err) })
    }
    return true
  }

  // ── list: backups available for restore (latest first, then history) ───────
  if (url.pathname === '/backup-api/list' && req.method === 'GET') {
    try {
      const snapshots = await listSnapshots()
      try {
        const s = await stat(join(BACKUP_DIR, LATEST))
        snapshots.unshift({ name: LATEST, size: s.size, mtime: s.mtimeMs })
      } catch {
        // no latest.json yet — fine
      }
      send(res, 200, { success: true, snapshots })
    } catch (err) {
      send(res, 500, { success: false, message: String(err?.message || err) })
    }
    return true
  }

  // ── file: return one backup's JSON (basename only, no path traversal) ───────
  if (url.pathname === '/backup-api/file' && req.method === 'GET') {
    const name = url.searchParams.get('name') || ''
    if (name !== LATEST && !SNAPSHOT_RE.test(name)) {
      send(res, 400, { success: false, message: 'Invalid backup name' })
      return true
    }
    const file = join(BACKUP_DIR, name)
    // defense in depth: the resolved path must stay inside BACKUP_DIR
    if (basename(file) !== name || dirname(file) !== normalize(BACKUP_DIR)) {
      send(res, 400, { success: false, message: 'Invalid backup name' })
      return true
    }
    try {
      const data = await readFile(file, 'utf8')
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end(data)
    } catch {
      send(res, 404, { success: false, message: 'Backup not found' })
    }
    return true
  }

  send(res, 404, { success: false, message: 'Unknown backup endpoint' })
  return true
}
