import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/store'
import type { AppData } from '../types'
import { Checkbox } from '../components/Checkbox'
import { confirmDialog, alertDialog } from '../lib/dialog'
import { listBackups, fetchBackup, setSyncedMtime, type BackupInfo } from '../store/backup'

const INTERVAL_OPTIONS = [
  { min: 15, label: 'Every 15 minutes' },
  { min: 60, label: 'Hourly' },
  { min: 1440, label: 'Daily' },
]

function formatMtime(ms: number) {
  const d = new Date(ms)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const backupEnabled = useStore((s) => s.backupEnabled)
  const backupIntervalMin = useStore((s) => s.backupIntervalMin)
  const setBackupEnabled = useStore((s) => s.setBackupEnabled)
  const setBackupIntervalMin = useStore((s) => s.setBackupIntervalMin)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetData = useStore((s) => s.resetData)

  const fileRef = useRef<HTMLInputElement>(null)
  const [backups, setBackups] = useState<BackupInfo[] | null>(null)
  const [loadingBackups, setLoadingBackups] = useState(false)
  const [backupError, setBackupError] = useState<string | null>(null)

  // Pull the list of on-disk backups when the modal opens (best effort).
  useEffect(() => {
    let alive = true
    setLoadingBackups(true)
    listBackups()
      .then((b) => alive && setBackups(b))
      .catch((e) => alive && setBackupError(String(e?.message || e)))
      .finally(() => alive && setLoadingBackups(false))
    return () => {
      alive = false
    }
  }, [])

  const toggleBackup = async (next: boolean) => {
    if (!next) {
      const ok = await confirmDialog({
        title: 'Turn off disk backups?',
        message:
          'Disk backups protect you if browser data is cleared. With this off, your campaign data lives only in this browser — clearing it will permanently delete everything, with no recovery.',
        confirmLabel: 'Turn off',
        danger: true,
      })
      if (!ok) return
    }
    setBackupEnabled(next)
  }

  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dm-screen-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importAppData = async (data: AppData, sourceLabel: string): Promise<boolean> => {
    if (!data.tabs || !Array.isArray(data.tabs)) throw new Error('Missing "tabs"')
    if (!data.activeTabId) data.activeTabId = data.tabs[0]?.id
    if (
      await confirmDialog({
        title: 'Replace all current data?',
        message: `This will replace everything currently in this browser with ${sourceLabel}. Continue?`,
        confirmLabel: 'Replace',
        danger: true,
      })
    ) {
      importData(data)
      onClose()
      return true
    }
    return false
  }

  const doImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await importAppData(JSON.parse(reader.result as string) as AppData, 'the imported file')
      } catch (err) {
        await alertDialog({ title: 'Import failed', message: 'Could not import: ' + (err as Error).message })
      }
    }
    reader.readAsText(file)
  }

  const doRestore = async (b: BackupInfo) => {
    try {
      const data = await fetchBackup(b.name)
      const when = b.name === 'latest.json' ? 'the latest backup' : `the backup from ${formatMtime(b.mtime)}`
      if (await importAppData(data, when)) setSyncedMtime(b.mtime)
    } catch (err) {
      await alertDialog({ title: 'Restore failed', message: 'Could not restore: ' + (err as Error).message })
    }
  }

  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <h2>Settings</h2>

        <h3 style={{ margin: '4px 0 6px' }}>Disk backup</h3>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 8px' }}>
          Your data normally lives only in this browser. With backups on, the app also saves a
          copy to disk on the machine running the server, so it survives clearing your browser.
        </p>
        <Checkbox
          checked={backupEnabled}
          onChange={toggleBackup}
          label="Automatically back up to disk"
        />
        <label className="header-field" style={{ margin: '10px 0', opacity: backupEnabled ? 1 : 0.5 }}>
          Snapshot frequency:
          <select
            value={backupIntervalMin}
            disabled={!backupEnabled}
            onChange={(e) => setBackupIntervalMin(Number(e.target.value))}
            title="How often a timestamped history snapshot is kept (the latest copy is always saved on every change)"
          >
            {INTERVAL_OPTIONS.map((o) => (
              <option key={o.min} value={o.min}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <h3 style={{ margin: '14px 0 6px' }}>Restore from backup</h3>
        {loadingBackups && <p className="muted" style={{ fontSize: 13 }}>Looking for backups…</p>}
        {backupError && (
          <p className="muted" style={{ fontSize: 13 }}>
            Disk backups are unavailable (no backup server reachable).
          </p>
        )}
        {backups && backups.length === 0 && (
          <p className="muted" style={{ fontSize: 13 }}>No backups on disk yet.</p>
        )}
        {backups && backups.length > 0 && (
          <div className="backup-list" style={{ maxHeight: 180, overflowY: 'auto', margin: '0 0 6px' }}>
            {backups.map((b) => (
              <div
                key={b.name}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}
              >
                <span style={{ flex: 1, fontSize: 13 }}>
                  {b.name === 'latest.json' ? 'Latest' : formatMtime(b.mtime)}
                  <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>
                    {formatSize(b.size)}
                  </span>
                </span>
                <button className="btn" onClick={() => doRestore(b)}>
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ margin: '14px 0 6px' }}>Manual export / import</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={doExport} title="Download all data as JSON">
            Export
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()} title="Load data from JSON">
            Import
          </button>
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (
                await confirmDialog({
                  title: 'Reset everything?',
                  message: 'Reset everything to the default demo data? This cannot be undone.',
                  confirmLabel: 'Reset',
                  danger: true,
                })
              ) {
                resetData()
                onClose()
              }
            }}
            title="Reset to defaults"
          >
            Reset
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) doImportFile(f)
              e.target.value = ''
            }}
          />
        </div>

        <div className="modal-actions">
          <span className="spacer" />
          <button className="btn btn-accent" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
