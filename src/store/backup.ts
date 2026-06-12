import type { AppData } from '../types'
import { makeDefaultData } from './defaultData'
import { useStore } from './store'

// ─────────────────────────────────────────────────────────────────────────────
// On-disk backup driver. The store already persists to localStorage; this also
// pushes a copy to the local server's /backup-api on every change (debounced),
// so the data survives a browser-data clear. It's a one-way, fire-and-forget
// POST — there's no polling and no socket; if the server isn't there (e.g. a
// pure static host) the POST simply fails and is ignored (offline-first).
// ─────────────────────────────────────────────────────────────────────────────

const SAVE_DEBOUNCE_MS = 3000

export interface BackupInfo {
  name: string
  size: number
  mtime: number
}

// Canonical projection of just the campaign data (no ddbCobalt / device prefs).
// Used to recognise the untouched demo seed so a fresh or freshly-cleared
// browser never overwrites a good backup with the default content.
function campaignDataKey(s: AppData): string {
  return JSON.stringify({
    campaigns: s.campaigns,
    activeCampaignId: s.activeCampaignId,
    inactiveCampaigns: s.inactiveCampaigns,
    tabs: s.tabs,
    activeTabId: s.activeTabId,
    combatants: s.combatants,
    round: s.round,
    activeTurn: s.activeTurn,
    parties: s.parties,
    activePartyId: s.activePartyId,
    players: s.players,
    sessionNodes: s.sessionNodes,
    diceHistory: s.diceHistory,
    bestiary: s.bestiary,
    items: s.items,
    tables: s.tables,
    customNodeTypes: s.customNodeTypes,
  })
}

const SEED_KEY = campaignDataKey(makeDefaultData())

// mtime (ms) of the latest backup this browser last wrote or restored. Kept in
// its own localStorage key — it's sync bookkeeping, not campaign data, so it
// stays out of the store and out of exports. Lets us notice when another device
// has pushed a newer backup than this browser has seen.
const SYNC_KEY = 'dm-screen-sync-mtime'

export function getSyncedMtime(): number {
  if (typeof localStorage === 'undefined') return 0
  return Number(localStorage.getItem(SYNC_KEY)) || 0
}

export function setSyncedMtime(ms: number) {
  if (typeof localStorage !== 'undefined' && ms > 0) localStorage.setItem(SYNC_KEY, String(ms))
}

/** The server's latest backup if it's newer than what this browser last synced,
 *  else null. Used to offer pulling changes made on another device. */
export async function checkForNewerSnapshot(): Promise<BackupInfo | null> {
  const backups = await listBackups()
  const latest = backups.find((b) => b.name === 'latest.json') ?? backups[0]
  if (!latest) return null
  return latest.mtime > getSyncedMtime() + 1 ? latest : null
}

export async function listBackups(): Promise<BackupInfo[]> {
  const res = await fetch('/backup-api/list')
  if (!res.ok) throw new Error(`Backup server returned ${res.status}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Could not list backups')
  return json.snapshots as BackupInfo[]
}

export async function fetchBackup(name: string): Promise<AppData> {
  const res = await fetch(`/backup-api/file?name=${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error(`Backup server returned ${res.status}`)
  return (await res.json()) as AppData
}

let timer: ReturnType<typeof setTimeout> | undefined
let lastSent: string | undefined

function scheduleSave() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(save, SAVE_DEBOUNCE_MS)
}

// Current backup payload, or null if nothing should be saved right now.
function pendingPayload(): string | null {
  const s = useStore.getState()
  if (!s.backupEnabled) return null
  // never clobber a backup with the untouched demo seed (e.g. fresh browser)
  if (campaignDataKey(s) === SEED_KEY) return null
  const payload = s.exportData()
  return payload === lastSent ? null : payload
}

async function save() {
  const payload = pendingPayload()
  if (payload === null) return
  const interval = useStore.getState().backupIntervalMin
  try {
    const res = await fetch(`/backup-api/save?interval=${interval}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
    })
    if (res.ok) {
      lastSent = payload
      const json = await res.json().catch(() => null)
      if (json?.latestMtime) setSyncedMtime(json.latestMtime)
    }
  } catch {
    // offline / no backend — keep working, localStorage still holds the data
  }
}

// Best-effort flush when the tab is being hidden/closed, so a change made within
// the debounce window still reaches disk. sendBeacon survives unload where fetch
// may not; the server JSON-parses the body regardless of content-type.
function flush() {
  const payload = pendingPayload()
  if (payload === null) return
  const interval = useStore.getState().backupIntervalMin
  const url = `/backup-api/save?interval=${interval}`
  if (navigator.sendBeacon?.(url, payload)) lastSent = payload
}

/** Start auto-saving the store to disk. Safe to call once at app startup. */
export function startDiskBackup() {
  if (typeof fetch === 'undefined') return
  // fire on every persisted change; the guards inside save() decide what to do
  useStore.subscribe(scheduleSave)
  // flush the last debounced change before the tab goes away
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
  }
}
