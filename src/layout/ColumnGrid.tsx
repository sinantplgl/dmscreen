import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useStore } from '../store/store'
import type { Tab } from '../types'
import { PanelFrame } from './PanelFrame'
import { PANEL_REGISTRY } from './panelRegistry'

const MIME = 'application/x-panel'

function AddPanelMenu({ tabId, colId }: { tabId: string; colId: string }) {
  const addPanel = useStore((s) => s.addPanel)
  const [open, setOpen] = useState(false)
  return (
    <div className="add-panel-wrap">
      <button className="btn btn-sm" onClick={() => setOpen((v) => !v)}>
        + Panel
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} />
          <div className="add-panel-menu">
            {PANEL_REGISTRY.map((p) => (
              <button
                key={p.type}
                onClick={() => {
                  addPanel(tabId, colId, p.type)
                  setOpen(false)
                }}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function ColumnGrid({ tab }: { tab: Tab }) {
  const addColumn = useStore((s) => s.addColumn)
  const removeColumn = useStore((s) => s.removeColumn)
  const setColumnWidth = useStore((s) => s.setColumnWidth)
  const movePanel = useStore((s) => s.movePanel)

  const colRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [dropCol, setDropCol] = useState<string | null>(null)

  // Drag a splitter to redistribute weight between two adjacent columns.
  const startResize = (e: React.PointerEvent, leftId: string, rightId: string) => {
    e.preventDefault()
    const leftEl = colRefs.current[leftId]
    const rightEl = colRefs.current[rightId]
    if (!leftEl || !rightEl) return
    const leftCol = tab.columns.find((c) => c.id === leftId)!
    const rightCol = tab.columns.find((c) => c.id === rightId)!
    const startX = e.clientX
    const leftPx = leftEl.offsetWidth
    const rightPx = rightEl.offsetWidth
    const totalPx = leftPx + rightPx
    const totalW = leftCol.width + rightCol.width

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const newLeftPx = Math.max(60, Math.min(totalPx - 60, leftPx + dx))
      const leftW = (newLeftPx / totalPx) * totalW
      setColumnWidth(tab.id, leftId, leftW)
      setColumnWidth(tab.id, rightId, totalW - leftW)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const onColDragOver = (e: DragEvent, colId: string) => {
    if (!e.dataTransfer.types.includes(MIME)) return
    e.preventDefault()
    setDropCol(colId)
  }
  const onColDrop = (e: DragEvent, colId: string, panelCount: number) => {
    if (!e.dataTransfer.types.includes(MIME)) return
    e.preventDefault()
    const draggedId = e.dataTransfer.getData(MIME)
    if (draggedId) movePanel(draggedId, tab.id, colId, panelCount)
    setDropCol(null)
  }

  return (
    <main className="workspace">
      {tab.columns.map((col, ci) => (
        <div key={col.id} style={{ display: 'contents' }}>
          <div
            ref={(el) => (colRefs.current[col.id] = el)}
            className={
              'column' +
              (col.panels.length === 0 ? ' column-empty' : '') +
              (dropCol === col.id ? ' drop-target' : '')
            }
            style={{ flexGrow: col.width, flexBasis: 0 }}
            onDragOver={(e) => onColDragOver(e, col.id)}
            onDragLeave={() => setDropCol(null)}
            onDrop={(e) => onColDrop(e, col.id, col.panels.length)}
          >
            <div className="column-tools">
              <AddPanelMenu tabId={tab.id} colId={col.id} />
              {tab.columns.length > 1 && (
                <button
                  className="icon-btn danger"
                  title="Remove column (panels are removed with it)"
                  onClick={() => {
                    if (
                      col.panels.length === 0 ||
                      confirm('Remove this column and its panels?')
                    )
                      removeColumn(tab.id, col.id)
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {col.panels.length === 0 ? (
              <div className="empty-hint">Empty column — add a panel or drop one here.</div>
            ) : (
              col.panels.map((p, pi) => (
                <PanelFrame key={p.id} instance={p} tabId={tab.id} colId={col.id} index={pi} />
              ))
            )}
          </div>

          {ci < tab.columns.length - 1 && (
            <div
              className="column-splitter"
              title="Drag to resize"
              onPointerDown={(e) => startResize(e, col.id, tab.columns[ci + 1].id)}
            />
          )}
        </div>
      ))}

      {/* trailing control to add a new column */}
      <div className="column-splitter" style={{ cursor: 'default' }} />
      <div className="column" style={{ flex: '0 0 44px', alignItems: 'center', paddingTop: 12 }}>
        <button className="icon-btn" title="Add column" onClick={() => addColumn(tab.id)}>
          ＋
        </button>
      </div>
    </main>
  )
}
