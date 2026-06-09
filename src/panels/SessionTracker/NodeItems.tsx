import { useState } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { GemIcon } from '../../components/icons'
import type { SessionNode } from '../../types'
import { setItemCount } from './attachments'
import { ItemPicker } from './pickers'
import { ItemEditModal } from '../Items/ItemModals'
import { rarityColor, itemTypeLine } from '../Items/rarity'

/** Magic items attached to an `item` node, each with a quantity. */
export function NodeItems({ node }: { node: SessionNode }) {
  const items = useStore((s) => s.items)
  const updateNode = useStore((s) => s.updateNode)
  const [picking, setPicking] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const list = node.items ?? []
  const setCount = (itemId: string, count: number) =>
    updateNode(node.id, { items: setItemCount(node.items, itemId, count) })
  const editing = items.find((it) => it.id === editId)

  return (
    <div className="node-items">
      <div className="node-items-head">
        <span className="node-items-title">Items</span>
        <span className="spacer" />
        <button className="btn btn-sm" onClick={() => setPicking(true)}>
          + Add item
        </button>
      </div>

      {list.length === 0 ? (
        <div className="node-items-empty">No items yet — click "+ Add item".</div>
      ) : (
        list.map((ref) => {
          const it = items.find((x) => x.id === ref.itemId)
          if (!it) {
            return (
              <div key={ref.itemId} className="attach-row">
                <span className="attach-name muted">⚠ missing item</span>
                <button className="icon-btn danger" title="Remove" onClick={() => setCount(ref.itemId, 0)}>
                  ✕
                </button>
              </div>
            )
          }
          const color = rarityColor(it.rarity)
          const open = openId === it.id
          return (
            <div key={ref.itemId}>
              <div className="attach-row" style={{ ['--rarity' as string]: color }}>
                {it.imageUrl ? (
                  <img className="attach-thumb" src={it.imageUrl} alt={it.name} />
                ) : (
                  <span className="attach-thumb attach-thumb-icon">
                    <GemIcon />
                  </span>
                )}
                <button
                  className="attach-name attach-name-btn"
                  style={{ color }}
                  title={open ? 'Hide details' : 'Show details'}
                  onClick={() => setOpenId(open ? null : it.id)}
                >
                  {it.name}
                  <span className="attach-sub"> — {itemTypeLine(it.itemType, it.rarity, it.attunement)}</span>
                </button>
                <span className="attach-stepper">
                  <button className="ref-stepper-btn" title="Fewer" onClick={() => setCount(it.id, ref.count - 1)}>
                    −
                  </button>
                  <span className="attach-count">{ref.count}</span>
                  <button className="ref-stepper-btn" title="More" onClick={() => setCount(it.id, ref.count + 1)}>
                    +
                  </button>
                </span>
                <button className="icon-btn" title="Edit item" onClick={() => setEditId(it.id)}>
                  ✎
                </button>
                <button className="icon-btn danger" title="Remove from this node" onClick={() => setCount(it.id, 0)}>
                  ✕
                </button>
              </div>
              {open && it.description && (
                <div className="attach-detail markdown-host">
                  <Markdown text={it.description} />
                </div>
              )}
            </div>
          )
        })
      )}

      {picking && <ItemPicker nodeId={node.id} onClose={() => setPicking(false)} />}
      {editing && <ItemEditModal item={editing} onClose={() => setEditId(null)} />}
    </div>
  )
}
