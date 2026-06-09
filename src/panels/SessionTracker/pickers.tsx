import { useState } from 'react'
import { useStore } from '../../store/store'
import type { SessionNode } from '../../types'
import { searchNodes, ancestorTrail, iconFor, displayTitle } from './helpers'
import { addItemRef, addCreatureRef } from './attachments'
import { ItemEditModal } from '../Items/ItemModals'
import { rarityColor, rarityLabel } from '../Items/rarity'

export function CreaturePicker({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const [q, setQ] = useState('')
  const filtered = bestiary.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(440px, 95vw)' }}>
        <h2>Link a creature</h2>
        <input
          type="text"
          placeholder="Search bestiary…"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="creature-pick-list">
          {filtered.map((c) => (
            <button
              key={c.id}
              className="creature-pick"
              onClick={() => {
                updateNode(nodeId, { creatureId: c.id })
                onClose()
              }}
            >
              {c.name}
              <span className="muted" style={{ fontStyle: 'italic' }}> — {c.cr.split(' ')[0]} CR</span>
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-hint">No creatures match.</div>}
        </div>
        <div className="modal-actions">
          <button
            className="btn"
            onClick={() => {
              updateNode(nodeId, { creatureId: undefined })
              onClose()
            }}
          >
            Clear link
          </button>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function ItemPicker({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const items = useStore((s) => s.items)
  const node = useStore((s) => s.sessionNodes.find((n) => n.id === nodeId))
  const updateNode = useStore((s) => s.updateNode)
  const addItem = useStore((s) => s.addItem)
  const [q, setQ] = useState('')
  const [createdId, setCreatedId] = useState<string | null>(null)
  const filtered = items.filter((it) => it.name.toLowerCase().includes(q.toLowerCase()))

  const attach = (itemId: string) => updateNode(nodeId, { items: addItemRef(node?.items, itemId) })
  const createNew = () => {
    const id = addItem(q.trim() ? { name: q.trim() } : undefined)
    attach(id)
    setCreatedId(id) // open the editor for the fresh item
  }

  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(440px, 95vw)' }}>
        <h2>Add an item</h2>
        <input
          type="text"
          placeholder="Search the item library…"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="creature-pick-list">
          {filtered.map((it) => (
            <button key={it.id} className="creature-pick" onClick={() => attach(it.id)}>
              <span style={{ color: rarityColor(it.rarity), fontWeight: 600 }}>{it.name}</span>
              <span className="muted" style={{ fontStyle: 'italic' }}>
                {' '}
                — {rarityLabel(it.rarity)}
              </span>
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-hint">No items match.</div>}
        </div>
        <div className="modal-actions">
          <button className="btn btn-accent" onClick={createNew}>
            + Create new item
          </button>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      {createdId && (
        <ItemEditModal
          item={items.find((it) => it.id === createdId) ?? { id: createdId, name: 'New Item', itemType: 'Wondrous Item', rarity: 'uncommon', description: '' }}
          onClose={() => {
            setCreatedId(null)
            onClose()
          }}
        />
      )}
    </div>
  )
}

export function EncounterCreaturePicker({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const bestiary = useStore((s) => s.bestiary)
  const node = useStore((s) => s.sessionNodes.find((n) => n.id === nodeId))
  const updateNode = useStore((s) => s.updateNode)
  const [q, setQ] = useState('')
  const filtered = bestiary.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  const attach = (creatureId: string, unique?: boolean) =>
    updateNode(nodeId, { creatures: addCreatureRef(node?.creatures, creatureId, unique) })

  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(440px, 95vw)' }}>
        <h2>Add a creature</h2>
        <input
          type="text"
          placeholder="Search bestiary…"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="creature-pick-list">
          {filtered.map((c) => (
            <button key={c.id} className="creature-pick" onClick={() => attach(c.id, c.unique)}>
              {c.name}
              <span className="muted" style={{ fontStyle: 'italic' }}>
                {' '}
                — {c.cr.split(' ')[0]} CR{c.unique ? ' · unique' : ''}
              </span>
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-hint">No creatures match.</div>}
        </div>
        <div className="modal-actions">
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function ReferencePicker({
  nodes,
  onPick,
  onClose,
}: {
  nodes: SessionNode[]
  onPick: (refId: string) => void
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const results = searchNodes(nodes, q)
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(480px, 95vw)' }}>
        <h2>Add reference alias</h2>
        <p className="modal-hint">Pick a node to place a read-only alias here. Clicking the alias jumps to the original.</p>
        <input
          type="text"
          placeholder="Search nodes…"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="creature-pick-list">
          {q.trim() === '' && <div className="empty-hint">Type to search for a node.</div>}
          {q.trim() !== '' && results.length === 0 && <div className="empty-hint">No matches.</div>}
          {results.map((n) => {
            const trail = ancestorTrail(nodes, n)
            const crumb = ['Top', ...trail.map((a) => (a.title.trim() ? a.title : `New ${a.type}`))]
            return (
              <button
                key={n.id}
                className="creature-pick"
                onClick={() => { onPick(n.id); onClose() }}
              >
                {iconFor(n)} {displayTitle(n)}
                <span className="muted" style={{ fontStyle: 'italic' }}> — {crumb.join(' › ')}</span>
              </button>
            )
          })}
        </div>
        <div className="modal-actions">
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
