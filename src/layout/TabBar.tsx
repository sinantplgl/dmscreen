import { useState } from 'react'
import type { DragEvent } from 'react'
import { useStore } from '../store/store'
import { confirmDialog } from '../lib/dialog'

const PANEL_MIME = 'application/x-panel'
const TAB_MIME = 'application/x-tab'

export function TabBar() {
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const addTab = useStore((s) => s.addTab)
  const renameTab = useStore((s) => s.renameTab)
  const deleteTab = useStore((s) => s.deleteTab)
  const moveTab = useStore((s) => s.moveTab)
  const movePanel = useStore((s) => s.movePanel)

  const [editing, setEditing] = useState<string | null>(null)
  const [dropTab, setDropTab] = useState<string | null>(null)

  const onDragOver = (e: DragEvent, tabId: string) => {
    const t = e.dataTransfer.types
    if (t.includes(PANEL_MIME) || t.includes(TAB_MIME)) {
      e.preventDefault()
      setDropTab(tabId)
    }
  }

  const onDrop = (e: DragEvent, tabId: string, index: number) => {
    const t = e.dataTransfer.types
    setDropTab(null)
    if (t.includes(TAB_MIME)) {
      e.preventDefault()
      const id = e.dataTransfer.getData(TAB_MIME)
      if (id && id !== tabId) moveTab(id, index)
      return
    }
    if (t.includes(PANEL_MIME)) {
      e.preventDefault()
      const panelId = e.dataTransfer.getData(PANEL_MIME)
      const tab = tabs.find((tb) => tb.id === tabId)
      const firstCol = tab?.columns[0]
      if (panelId && firstCol) {
        movePanel(panelId, tabId, firstCol.id, firstCol.panels.length)
        setActiveTab(tabId)
      }
    }
  }

  return (
    <nav className="tab-bar">
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          className={
            'tab-btn' + (tab.id === activeTabId ? ' active' : '') + (dropTab === tab.id ? ' drop-target' : '')
          }
          draggable={editing !== tab.id}
          onDragStart={(e) => {
            e.dataTransfer.setData(TAB_MIME, tab.id)
            e.dataTransfer.effectAllowed = 'move'
          }}
          onDragOver={(e) => onDragOver(e, tab.id)}
          onDragLeave={() => setDropTab(null)}
          onDrop={(e) => onDrop(e, tab.id, i)}
          onClick={() => setActiveTab(tab.id)}
          onDoubleClick={() => setEditing(tab.id)}
          title="Double-click to rename · drag to reorder · drop a panel here to move it"
        >
          {editing === tab.id ? (
            <input
              autoFocus
              value={tab.name}
              onChange={(e) => renameTab(tab.id, e.target.value)}
              onBlur={() => setEditing(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setEditing(null)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <span
                  className="tab-close"
                  title="Delete tab"
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (
                      await confirmDialog({
                        title: 'Delete tab?',
                        message: `Delete tab "${tab.name}" and all its panels?`,
                        confirmLabel: 'Delete',
                        danger: true,
                      })
                    )
                      deleteTab(tab.id)
                  }}
                >
                  ✕
                </span>
              )}
            </>
          )}
        </div>
      ))}
      <button className="tab-add" title="New tab" onClick={addTab}>
        +
      </button>
    </nav>
  )
}
