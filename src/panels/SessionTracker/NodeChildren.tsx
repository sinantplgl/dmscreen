import { useStore } from '../../store/store'
import type { SessionNode } from '../../types'
import { childrenOf, isHidden, iconFor, displayTitle, siblingNumbers, nodeNumber } from './helpers'

/**
 * Collapsed-by-default footer listing a card's visible children, so you can jump
 * into one (maximize) without navigating the board. Only renders when there's at
 * least one visible child.
 */
export function NodeChildren({
  node,
  open,
  onToggle,
  maximize,
}: {
  node: SessionNode
  open: boolean
  onToggle: () => void
  maximize: (id: string) => void
}) {
  const nodes = useStore((s) => s.sessionNodes)
  const nums = siblingNumbers(childrenOf(nodes, node.id))
  const kids = childrenOf(nodes, node.id).filter((n) => !isHidden(n))
  if (kids.length === 0) return null

  return (
    <div className="node-children">
      <button className="node-children-head" onClick={onToggle} title={open ? 'Collapse' : 'Expand'}>
        <span className="node-children-caret">{open ? '▾' : '▸'}</span>
        <span className="node-children-label">Children ({kids.length})</span>
      </button>
      {open && (
        <div className="node-children-list">
          {kids.map((n) => {
            const target = n.refId ? nodes.find((x) => x.id === n.refId) ?? null : null
            const labelNode = n.refId ? target : n
            return (
              <div key={n.id} className="node-children-row">
                <span className="node-type-icon" title={labelNode?.type ?? n.type}>
                  {n.refId ? '↪' : iconFor(n)}
                </span>
                <span className="node-card-num">{nums.get(n.id)}</span>
                {n.refId && (
                  <span className="node-card-num ref-orig" title="Original number">
                    [{target ? nodeNumber(nodes, target) ?? '?' : '?'}]
                  </span>
                )}
                <span className="node-children-name">
                  {labelNode ? displayTitle(labelNode) : <span className="muted">(broken ref)</span>}
                </span>
                <button
                  className="icon-btn"
                  title="Maximize (focus mode)"
                  onClick={() => maximize(n.refId ? n.refId : n.id)}
                  disabled={!!n.refId && !target}
                >
                  ⤢
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
