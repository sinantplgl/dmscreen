import { useRef, useState } from 'react'
import { useStore } from '../../store/store'
import type { SessionNode } from '../../types'
import { EyeIcon, EyeSlashIcon } from '../../components/icons'
import { iconFor, isHidden, displayTitle } from './helpers'

/** Board toolbar control: a popover listing every child of the focused node with
 *  a per-child visibility toggle — an overview alternative to the per-card eye. */
export function ChildVisibility({ children }: { children: SessionNode[] }) {
  const allNodes = useStore((s) => s.sessionNodes)
  const updateNode = useStore((s) => s.updateNode)
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const customTypeNames = new Set(customNodeTypes.map((t) => t.type))
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
    }
    setOpen((v) => !v)
  }

  return (
    <>
      <button
        ref={btnRef}
        className="btn"
        title="Show/hide individual cards"
        onClick={openMenu}
        disabled={children.length === 0}
      >
        Manage
      </button>
      {open && (
        <>
          <div className="ref-lib-overlay" onClick={() => setOpen(false)} />
          <div className="ref-settings-menu child-vis-menu" style={{ top: pos.top, right: pos.right }}>
            <div className="child-vis-title">Card visibility</div>
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
