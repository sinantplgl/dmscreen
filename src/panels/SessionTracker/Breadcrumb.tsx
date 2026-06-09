import { useState, Fragment } from 'react'
import type { SessionNode } from '../../types'
import { childrenOf, siblingNumbers, iconFor, displayTitle, nodeNumber } from './helpers'

export function Breadcrumb({
  focusId,
  nodes,
  setFocus,
}: {
  focusId: string | undefined
  nodes: SessionNode[]
  setFocus: (id: string | undefined) => void
}) {
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const trail: SessionNode[] = []
  let cur = focusId ? nodes.find((n) => n.id === focusId) : undefined
  while (cur) {
    trail.unshift(cur)
    cur = cur.parentId ? nodes.find((n) => n.id === cur!.parentId) : undefined
  }
  return (
    <div className="session-breadcrumb">
      <button className="crumb" onClick={() => setFocus(undefined)}>
        Top
      </button>
      {trail.map((n) => {
        const siblings = childrenOf(nodes, n.parentId)
        const hasMenu = siblings.length > 1
        const open = menuFor === n.id
        return (
          <Fragment key={n.id}>
            <span className="crumb-caret">▸</span>
            <span className="crumb-wrap">
              <button
                className="crumb"
                title="Focus this node"
                onClick={() => { setFocus(n.id); setMenuFor(null) }}
              >
                {iconFor(n)} <span className="muted">{nodeNumber(nodes, n)}.</span> {displayTitle(n)}
              </button>
              {hasMenu && (
                <button
                  className="crumb-caret-btn"
                  title="Switch to a sibling"
                  onClick={() => setMenuFor(open ? null : n.id)}
                >
                  ▾
                </button>
              )}
              {open && (
                <>
                  <div className="crumb-overlay" onClick={() => setMenuFor(null)} />
                  <div className="crumb-menu">
                    {(() => {
                      const nums = siblingNumbers(siblings)
                      return siblings.map((s) => (
                        <button
                          key={s.id}
                          className={'crumb-menu-item' + (s.id === n.id ? ' current' : '')}
                          onClick={() => {
                            setFocus(s.id)
                            setMenuFor(null)
                          }}
                        >
                          <span className="muted">{nums.get(s.id)}.</span> {iconFor(s)} {displayTitle(s)}
                        </button>
                      ))
                    })()}
                  </div>
                </>
              )}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}
