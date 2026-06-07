import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from 'react'
import './Board.css'

// ─────────────────────────────────────────────────────────────────────────────
// Generic free-placement board: items are positioned on a grid by {x,y,w,h} and
// can be dragged (by a `.drag-grip` element inside the rendered item) and resized
// from a corner handle. Plain pointer events, no dependency. Shared by the
// Reference panel and the Session Tracker's board view.
//
// CONTRACT: whatever `renderItem` returns MUST contain a `.drag-grip` element —
// that's the move handle. Everything else (inputs, buttons) stays interactive.
// ─────────────────────────────────────────────────────────────────────────────

export type Box = { x: number; y: number; w: number; h: number }

const ROW_H = 28 // px per grid row
const GAP = 10 // px gap between cells

function BoardItem({
  box,
  cols,
  colWidth,
  onChange,
  itemClassName,
  children,
}: {
  box: Box
  cols: number
  colWidth: number
  onChange: (b: Box) => void
  itemClassName?: string
  children: ReactNode
}) {
  const [ghost, setGhost] = useState<Box | null>(null)
  const cur = ghost ?? box
  const cellW = colWidth + GAP
  const cellH = ROW_H + GAP

  const style: CSSProperties = {
    position: 'absolute',
    left: cur.x * cellW,
    top: cur.y * cellH,
    width: Math.max(0, cur.w * colWidth + (cur.w - 1) * GAP),
    height: Math.max(0, cur.h * ROW_H + (cur.h - 1) * GAP),
    transition: ghost ? 'none' : 'left .12s, top .12s, width .12s, height .12s',
  }

  // Generic pointer-drag: `compute` maps the pixel delta to a new Box.
  const beginGesture = (e: ReactPointerEvent, compute: (dx: number, dy: number) => Box) => {
    e.preventDefault()
    const sx = e.clientX
    const sy = e.clientY
    const move = (ev: PointerEvent) => setGhost(compute(ev.clientX - sx, ev.clientY - sy))
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setGhost(null)
      onChange(compute(ev.clientX - sx, ev.clientY - sy))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    // Only the grip starts a move; everything else (inputs, buttons) behaves normally.
    if (!(e.target as HTMLElement).closest('.drag-grip')) return
    const start = { ...box }
    beginGesture(e, (dx, dy) => ({
      ...start,
      x: Math.max(0, Math.min(cols - start.w, Math.round(start.x + dx / cellW))),
      y: Math.max(0, Math.round(start.y + dy / cellH)),
    }))
  }

  const onResizeDown = (e: ReactPointerEvent) => {
    e.stopPropagation()
    const start = { ...box }
    beginGesture(e, (dx, dy) => ({
      ...start,
      w: Math.max(1, Math.min(cols - start.x, Math.round(start.w + dx / cellW))),
      h: Math.max(1, Math.round(start.h + dy / cellH)),
    }))
  }

  return (
    <div className={'board-item' + (ghost ? ' dragging' : '')} style={style} onPointerDown={onPointerDown}>
      <div className={'board-card-inner' + (itemClassName ? ' ' + itemClassName : '')}>{children}</div>
      <div className="board-resize" title="Resize" onPointerDown={onResizeDown} />
    </div>
  )
}

/** Track a container's pixel width so grid cells can be sized from it. */
function useContainerWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return width
}

export function Board<T extends { id: string }>({
  items,
  cols,
  layoutOf,
  onLayout,
  renderItem,
  defaultBox,
  itemClassName,
}: {
  items: T[]
  cols: number
  layoutOf: (item: T) => Box | undefined
  onLayout: (id: string, box: Box) => void
  renderItem: (item: T) => ReactNode
  defaultBox?: Box | ((item: T, index: number) => Box)
  itemClassName?: string
}) {
  const boardRef = useRef<HTMLDivElement>(null)
  const width = useContainerWidth(boardRef)
  const colWidth = cols > 0 && width > 0 ? Math.max(0, (width - GAP * (cols - 1)) / cols) : 0

  const resolveBox = (item: T, i: number): Box =>
    layoutOf(item) ??
    (typeof defaultBox === 'function'
      ? defaultBox(item, i)
      : defaultBox ?? { x: 0, y: 0, w: Math.min(6, cols), h: 6 })

  const maxBottom = items.reduce((m, it, i) => {
    const b = resolveBox(it, i)
    return Math.max(m, b.y + b.h)
  }, 0)

  return (
    <div
      className="ref-board"
      ref={boardRef}
      style={{ position: 'relative', height: Math.max(ROW_H, maxBottom * (ROW_H + GAP)) }}
    >
      {colWidth > 0 &&
        items.map((it, i) => (
          <BoardItem
            key={it.id}
            box={resolveBox(it, i)}
            cols={cols}
            colWidth={colWidth}
            onChange={(b) => onLayout(it.id, b)}
            itemClassName={itemClassName}
          >
            {renderItem(it)}
          </BoardItem>
        ))}
    </div>
  )
}
