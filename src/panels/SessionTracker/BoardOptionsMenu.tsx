import { useRef, useState } from 'react'
import { useStore } from '../../store/store'
import type { SessionNode } from '../../types'
import { EyeIcon, EyeSlashIcon, FilterIcon } from '../../components/icons'
import { iconFor, isHidden, displayTitle } from './helpers'

/** Board toolbar "options" popover — groups Columns, Show-hidden, and a per-card
 *  visibility list (icon + title + eye toggle) under one FilterIcon button. */
export function BoardOptionsMenu({
  children,
  boardCols,
  onCols,
  showHidden,
  onToggleHidden,
  hiddenCount,
}: {
  children: SessionNode[]
  boardCols: number
  onCols: (cols: number) => void
  showHidden: boolean
  onToggleHidden: () => void
  hiddenCount: number
}) {
  const allNodes = useStore((s) => s.sessionNodes)
  const updateNode = useStore((s) => s.updateNode)
  const customTypeNames = new Set(useStore((s) => s.customNodeTypes).map((t) => t.type))
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      // Anchor to the button's left edge (menu extends rightward), then clamp to
      // the viewport so it never runs off-page on a left- or right-docked panel.
      const W = 260
      const left = Math.max(8, Math.min(r.left, window.innerWidth - W - 8))
      setPos({ top: r.bottom + 4, left })
    }
    setOpen((v) => !v)
  }

  return (
    <>
      <button
        ref={btnRef}
        className={'btn' + (showHidden ? ' btn-accent' : '')}
        title="Board options — columns, hidden cards"
        onClick={openMenu}
      >
        <FilterIcon />
        {hiddenCount ? ` (${hiddenCount})` : ''}
      </button>
      {open && (
        <>
          <div className="ref-lib-overlay" onClick={() => setOpen(false)} />
          <div className="board-opt-menu" style={{ top: pos.top, left: pos.left }}>
            <div className="board-opt-row" title="Board columns — fewer = larger cards">
              <span>Columns</span>
              <span className="ref-stepper">
                <button
                  className="ref-stepper-btn"
                  title="Fewer columns"
                  disabled={boardCols <= 1}
                  onClick={() => onCols(Math.max(1, boardCols - 1))}
                >
                  −
                </button>
                <span className="board-opt-cols">{boardCols}</span>
                <button
                  className="ref-stepper-btn"
                  title="More columns"
                  disabled={boardCols >= 24}
                  onClick={() => onCols(Math.min(24, boardCols + 1))}
                >
                  +
                </button>
              </span>
            </div>
            <button className="board-opt-row board-opt-toggle" onClick={onToggleHidden}>
              <span>Show hidden{hiddenCount ? ` (${hiddenCount})` : ''}</span>
              {showHidden ? <EyeIcon /> : <EyeSlashIcon />}
            </button>

            {children.length > 0 && <div className="child-vis-title">Cards</div>}
            {children.map((n) => {
              const hidden = isHidden(n, customTypeNames)
              const target = n.refId ? allNodes.find((c) => c.id === n.refId) ?? null : null
              const labelNode = n.refId ? target : n
              return (
                <div key={n.id} className="child-vis-row">
                  <span className="node-type-icon" title={labelNode?.type ?? n.type}>
                    {n.refId ? '↪' : iconFor(n)}
                  </span>
                  <span className="child-vis-name">
                    {labelNode ? displayTitle(labelNode) : <span className="muted">(broken ref)</span>}
                  </span>
                  <button
                    className="icon-btn"
                    title={hidden ? 'Show on board' : 'Hide from board'}
                    onClick={() => updateNode(n.id, { hidden: !hidden })}
                  >
                    {hidden ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
