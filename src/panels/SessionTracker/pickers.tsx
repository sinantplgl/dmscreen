import { useState } from 'react'
import { useStore } from '../../store/store'
import type { SessionNode } from '../../types'
import { searchNodes, ancestorTrail, iconFor, displayTitle } from './helpers'

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
