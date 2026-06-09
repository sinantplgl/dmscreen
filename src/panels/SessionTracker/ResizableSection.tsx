import { useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

const MIN_H = 48
const MAX_H = 800

/**
 * A labeled card section. Its header carries the section title plus any
 * section-level actions (e.g. "Add creature", "Send all to combat"). When
 * `resizable` (the default) it has a draggable splitter on top: dragging resizes
 * the section, which inside the flex-column card takes space from the scrollable
 * notes above. When not resizable it just sizes to its content (used in the
 * focused/maximized detail pane). Height is persisted by the parent via `onHeight`.
 */
export function ResizableSection({
  title,
  actions,
  resizable = true,
  height,
  onHeight,
  defaultHeight = 140,
  children,
}: {
  title: string
  actions?: ReactNode
  resizable?: boolean
  height?: number
  onHeight?: (px: number) => void
  defaultHeight?: number
  children: ReactNode
}) {
  const base = height ?? defaultHeight
  const [drag, setDrag] = useState<number | null>(null)
  const cur = drag ?? base

  // Drag the top splitter: moving up (negative dy) grows the section.
  const onGripDown = (e: ReactPointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const sy = e.clientY
    const start = base
    const compute = (dy: number) => Math.max(MIN_H, Math.min(MAX_H, Math.round(start - dy)))
    const move = (ev: PointerEvent) => setDrag(compute(ev.clientY - sy))
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setDrag(null)
      onHeight?.(compute(ev.clientY - sy))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className={'node-section' + (resizable ? '' : ' static')} style={resizable ? { height: cur } : undefined}>
      {resizable && <div className="node-section-grip" title="Drag to resize" onPointerDown={onGripDown} />}
      <div className="node-section-head">
        <span className="node-section-title">{title}</span>
        {actions != null && (
          <>
            <span className="spacer" />
            {actions}
          </>
        )}
      </div>
      <div className="node-section-body">{children}</div>
    </div>
  )
}
