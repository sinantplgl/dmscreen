import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/store'
import type { AppData } from '../types'
import { SwordsIcon } from '../components/icons'

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
        onClick={() => {
          const name = prompt('Name for the new campaign?')
          if (name !== null) addCampaign(name)
        }}
      >
        ＋
      </button>
      <button
        className="icon-btn"
        title="Rename this campaign"
        onClick={() => {
          const name = prompt('Rename campaign', active?.name)
          if (name?.trim()) renameCampaign(activeCampaignId, name.trim())
        }}
      >
        ✎
      </button>
      <button
        className="icon-btn danger"
        title="Delete this campaign and all its data"
        disabled={campaigns.length <= 1}
        onClick={() => {
          if (confirm(`Delete campaign "${active?.name}" and everything in it? This cannot be undone.`))
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

  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetData = useStore((s) => s.resetData)
  const fileRef = useRef<HTMLInputElement>(null)
  const clock = useClock()

  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dm-screen-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as AppData
        if (!data.tabs || !Array.isArray(data.tabs)) throw new Error('Missing "tabs"')
        if (!data.activeTabId) data.activeTabId = data.tabs[0]?.id
        if (confirm('Import will replace all current data. Continue?')) importData(data)
      } catch (err) {
        alert('Could not import: ' + (err as Error).message)
      }
    }
    reader.readAsText(file)
  }

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
        <button className="btn" onClick={doExport} title="Download all data as JSON">
          Export
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()} title="Load data from JSON">
          Import
        </button>
        <button
          className="btn"
          onClick={() => {
            if (confirm('Reset everything to the default demo data? This cannot be undone.'))
              resetData()
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
            if (f) doImport(f)
            e.target.value = ''
          }}
        />
      </div>
    </header>
  )
}
