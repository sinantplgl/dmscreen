import { useRef, useState } from 'react'
import type { DragEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { PanelInstance } from '../types'
import { useStore } from '../store/store'
import { getPanelMeta } from './panelRegistry'
import { ErrorBoundary } from './ErrorBoundary'

const MIME = 'application/x-panel'

export function PanelFrame({
  instance,
  tabId,
  colId,
  index,
}: {
  instance: PanelInstance
  tabId: string
  colId: string
  index: number
}) {
  const removePanel = useStore((s) => s.removePanel)
  const movePanel = useStore((s) => s.movePanel)
  const updatePanelConfig = useStore((s) => s.updatePanelConfig)
  const setPanelHeight = useStore((s) => s.setPanelHeight)
  const meta = getPanelMeta(instance.type)

  const panelRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [dropPos, setDropPos] = useState<'before' | 'after' | null>(null)

  // Drag the bottom grip to set an explicit panel height (vertical only).
  const startHeightResize = (e: ReactPointerEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = panelRef.current?.offsetHeight ?? 0
    const move = (ev: PointerEvent) =>
      setPanelHeight(instance.id, Math.max(90, startH + (ev.clientY - startY)))
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData(MIME, instance.id)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }
  const onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes(MIME)) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setDropPos(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after')
  }
  const onDrop = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes(MIME)) return
    e.preventDefault()
    e.stopPropagation()
    const draggedId = e.dataTransfer.getData(MIME)
    const target = dropPos === 'after' ? index + 1 : index
    if (draggedId && draggedId !== instance.id) movePanel(draggedId, tabId, colId, target)
    setDropPos(null)
  }

  return (
    <div
      ref={panelRef}
      className={
        'panel' +
        (instance.height ? ' fixed-height' : '') +
        (dragging ? ' dragging' : '') +
        (dropPos === 'before' ? ' drop-before' : dropPos === 'after' ? ' drop-after' : '')
      }
      style={instance.height ? { height: instance.height } : undefined}
      onDragOver={onDragOver}
      onDragLeave={() => setDropPos(null)}
      onDrop={onDrop}
    >
      <div
        className="panel-head"
        draggable
        onDragStart={onDragStart}
        onDragEnd={() => {
          setDragging(false)
          setDropPos(null)
        }}
      >
        <span className="panel-grip" title="Drag to move panel">
          ⠿
        </span>
        <span className="panel-title">
          <span>{meta.icon}</span>
          {meta.label}
        </span>
        <div className="panel-actions">
          <button
            className="icon-btn danger"
            title="Remove panel"
            onClick={() => removePanel(instance.id)}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="panel-body">
        <ErrorBoundary label={meta.label}>
          {meta.render(instance, (c) => updatePanelConfig(instance.id, c))}
        </ErrorBoundary>
      </div>
      <div
        className="panel-resize"
        title="Drag to set height · double-click to reset to auto"
        onPointerDown={startHeightResize}
        onDoubleClick={() => setPanelHeight(instance.id, undefined)}
      />
    </div>
  )
}
