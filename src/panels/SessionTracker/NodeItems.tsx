import type { SessionNode } from '../../types'

/**
 * PROTOTYPE — "items" attached to a node (currently `item`-type nodes).
 * Design is intentionally a stub: the real shape/behaviour is TBD. It just shows
 * a labelled area with a placeholder add button so the slot is visible and wired.
 */
export function NodeItems({ node }: { node: SessionNode }) {
  return (
    <div className="node-items">
      <div className="node-items-head">
        <span className="node-items-title">Items</span>
        <span className="node-items-tag">prototype</span>
        <span className="spacer" />
        <button className="btn btn-sm" title="Coming soon" disabled>
          + Add item
        </button>
      </div>
      <div className="node-items-empty">No items yet — this is a placeholder for {node.type} items.</div>
    </div>
  )
}
