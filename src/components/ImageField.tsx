import { useEffect, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import './ImageField.css'

const MIN = 1
const MAX = 6
const clamp = (n: number) => Math.max(MIN, Math.min(MAX, n))

/**
 * Reusable image display: shows an image with mouse wheel zoom + drag-to-pan
 * (when zoomed in) and overlay zoom controls. The URL input only appears in
 * edit mode. Self-contained zoom/pan state so it can be dropped into any node
 * (or anywhere else) that holds a single image.
 */
export function ImageField({
  imageUrl,
  onImageUrlChange,
  editing,
  editable,
  alt,
}: {
  imageUrl?: string
  onImageUrlChange: (url: string) => void
  editing: boolean
  editable: boolean
  alt?: string
}) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  // Snap pan back to center whenever we're fully zoomed out. Zoom is via the
  // overlay buttons only — no wheel zoom, so the board/card can still scroll.
  useEffect(() => {
    if (scale === 1 && (pos.x !== 0 || pos.y !== 0)) setPos({ x: 0, y: 0 })
  }, [scale, pos.x, pos.y])

  const zoomTo = (next: number) => setScale(clamp(next))

  const onPointerDown = (e: ReactPointerEvent) => {
    if (scale <= 1) return
    e.preventDefault()
    const sx = e.clientX
    const sy = e.clientY
    const start = { ...pos }
    const move = (ev: PointerEvent) => setPos({ x: start.x + (ev.clientX - sx), y: start.y + (ev.clientY - sy) })
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const atRest = scale === 1 && pos.x === 0 && pos.y === 0

  return (
    <div className="imgfield">
      {editable && editing && (
        <input
          className="imgfield-url"
          type="url"
          placeholder="Image URL…"
          value={imageUrl || ''}
          onChange={(e) => onImageUrlChange(e.target.value)}
        />
      )}
      {imageUrl ? (
        <div className="imgfield-view">
          <img
            className="imgfield-img"
            src={imageUrl}
            alt={alt || ''}
            draggable={false}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              cursor: scale > 1 ? 'grab' : 'default',
            }}
            onPointerDown={onPointerDown}
          />
          <div className="imgfield-controls">
            <button className="icon-btn" title="Zoom out" onClick={() => zoomTo(scale / 1.25)} disabled={scale <= MIN}>
              −
            </button>
            <button className="icon-btn" title="Reset" onClick={() => zoomTo(1)} disabled={atRest}>
              ⤢
            </button>
            <button className="icon-btn" title="Zoom in" onClick={() => zoomTo(scale * 1.25)} disabled={scale >= MAX}>
              ＋
            </button>
          </div>
        </div>
      ) : (
        !(editable && editing) && <div className="node-empty">No image set.</div>
      )}
    </div>
  )
}
