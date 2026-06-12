import { useEffect, useState } from 'react'
import { useStore, hadPersistedDataAtBoot } from '../store/store'
import { SwordsIcon, GearIcon } from '../components/icons'
import { confirmDialog, promptDialog } from '../lib/dialog'
import { listBackups, fetchBackup, checkForNewerSnapshot, setSyncedMtime } from '../store/backup'
import { SettingsModal } from './SettingsModal'

function formatWhen(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// On startup, reconcile this browser against the on-disk backups:
//  • empty/cleared browser → offer to restore the latest backup (the recovery
//    path for "I cleared my browser data");
//  • browser with data, but the server has a newer backup (e.g. you edited on
//    another machine) → offer to pull the newer one.
function useStartupBackupCheck() {
  const importData = useStore((s) => s.importData)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!hadPersistedDataAtBoot) {
          const backups = await listBackups()
          const latest = backups.find((b) => b.name === 'latest.json') ?? backups[0]
          if (!alive || !latest) return
          const ok = await confirmDialog({
            title: 'Restore your data?',
            message: `This browser has no DM Screen data, but ${backups.length} disk backup${backups.length === 1 ? '' : 's'} ${backups.length === 1 ? 'was' : 'were'} found. Restore the most recent one (from ${formatWhen(latest.mtime)})?`,
            confirmLabel: 'Restore latest',
            cancelLabel: 'Start fresh',
          })
          if (!ok || !alive) return
          const data = await fetchBackup(latest.name)
          if (data?.tabs) {
            importData(data)
            setSyncedMtime(latest.mtime)
          }
        } else {
          const newer = await checkForNewerSnapshot()
          if (!alive || !newer) return
          const ok = await confirmDialog({
            title: 'Newer backup found',
            message: `A backup on disk (from ${formatWhen(newer.mtime)}) is newer than this browser's data — looks like you made changes on another device. Load it? This replaces what's currently in this browser.`,
            confirmLabel: 'Load newer backup',
            cancelLabel: 'Keep this browser',
            danger: true,
          })
          if (!ok || !alive) {
            // don't ask again this session for the same snapshot
            if (newer) setSyncedMtime(newer.mtime)
            return
          }
          const data = await fetchBackup(newer.name)
          if (data?.tabs) {
            importData(data)
            setSyncedMtime(newer.mtime)
          }
        }
      } catch {
        // no backup server reachable — nothing to reconcile
      }
    })()
    return () => {
      alive = false
    }
  }, [importData])
}

function useClock() {
  const [time, setTime] = useState('--:--')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        now.getHours().toString().padStart(2, '0') +
          ':' +
          now.getMinutes().toString().padStart(2, '0'),
      )
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])
  return time
}

function CampaignSelector() {
  const campaigns = useStore((s) => s.campaigns)
  const activeCampaignId = useStore((s) => s.activeCampaignId)
  const switchCampaign = useStore((s) => s.switchCampaign)
  const addCampaign = useStore((s) => s.addCampaign)
  const renameCampaign = useStore((s) => s.renameCampaign)
  const deleteCampaign = useStore((s) => s.deleteCampaign)
  const active = campaigns.find((c) => c.id === activeCampaignId)

  return (
    <div className="header-field campaign-select">
      Campaign:
      <select
        value={activeCampaignId}
        onChange={(e) => switchCampaign(e.target.value)}
        title="Switch campaign"
      >
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        className="icon-btn"
        title="New campaign"
        onClick={async () => {
          const name = await promptDialog({ title: 'New campaign', placeholder: 'Campaign name' })
          if (name !== null) addCampaign(name)
        }}
      >
        ＋
      </button>
      <button
        className="icon-btn"
        title="Rename this campaign"
        onClick={async () => {
          const name = await promptDialog({ title: 'Rename campaign', defaultValue: active?.name })
          if (name?.trim()) renameCampaign(activeCampaignId, name.trim())
        }}
      >
        ✎
      </button>
      <button
        className="icon-btn danger"
        title="Delete this campaign and all its data"
        disabled={campaigns.length <= 1}
        onClick={async () => {
          if (
            await confirmDialog({
              title: 'Delete campaign?',
              message: `Delete campaign "${active?.name}" and everything in it? This cannot be undone.`,
              confirmLabel: 'Delete',
              danger: true,
            })
          )
            deleteCampaign(activeCampaignId)
        }}
      >
        ✕
      </button>
    </div>
  )
}

export function Header() {
  const activeCampaignName = useStore(
    (s) => s.campaigns.find((c) => c.id === s.activeCampaignId)?.name,
  )
  useEffect(() => {
    document.title = activeCampaignName ? `DM Screen | ${activeCampaignName}` : 'DM Screen'
  }, [activeCampaignName])

  const clock = useClock()
  const [settingsOpen, setSettingsOpen] = useState(false)
  useStartupBackupCheck()

  return (
    <header className="app-header">
      <h1>
        <SwordsIcon /> DM Screen
      </h1>
      <div className="header-divider" />
      <CampaignSelector />

      <div className="header-right">
        <span className="clock">{clock}</span>
        <div className="header-divider" />
        <button
          className="icon-btn"
          onClick={() => setSettingsOpen(true)}
          title="Settings, backups, export / import"
        >
          <GearIcon />
        </button>
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </header>
  )
}
