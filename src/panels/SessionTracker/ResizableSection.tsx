import { useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

const MIN_H = 48
const MAX_H = 800

/** How a field section sizes within the card body:
 *  - `grow`   — flex-fills the remaining height; no title band, no grip. Header
 *               actions float as a top-right overlay so single-field cards stay clean.
 *  - `fixed`  — explicit (draggable, persisted) height with a title band + top grip
 *               that steals space from the `grow` filler above it.
 *  - `static` — sizes to content, no grip (focused / maximized detail pane). */
export type SectionMode = 'grow' | 'fixed' | 'static'

/**
 * The shell every card field renders into. The card body is a flex column: the
 * first visible field is `grow` (the filler) and any fields below it are `fixed`
 * (resizable), so the card is always fully covered.
 */
export function ResizableSection({
  title,
  actions,
  mode = 'fixed',
  height,
  onHeight,
  defaultHeight = 140,
  children,
}: {
  title?: string
  actions?: ReactNode
  mode?: SectionMode
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

  if (mode === 'grow') {
    return (
      <div className="node-section grow">
        {actions != null && <div className="node-section-overlay">{actions}</div>}
        <div className="node-section-body">{children}</div>
      </div>
    )
  }

  const fixed = mode === 'fixed'
  return (
    <div className={'node-section' + (fixed ? '' : ' static')} style={fixed ? { height: cur } : undefined}>
      {fixed && <div className="node-section-grip" title="Drag to resize" onPointerDown={onGripDown} />}
      {(title != null || actions != null) && (
        <div className="node-section-head">
          {title != null && <span className="node-section-title">{title}</span>}
          {actions != null && (
            <>
              <span className="spacer" />
              {actions}
            </>
          )}
        </div>
      )}
      <div className="node-section-body">{children}</div>
    </div>
  )
}
