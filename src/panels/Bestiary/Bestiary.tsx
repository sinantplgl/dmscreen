import { useState } from 'react'
import './Bestiary.css'
import { useStore } from '../../store/store'
import { StatBlock } from '../StatBlock'
import { SwordsIcon } from '../../components/icons'
import { CreatureEditModal, AddCreatureModal } from './BestiaryModals'

export function Bestiary() {
  const bestiary = useStore((s) => s.bestiary).sort()
  const sendToCombat = useStore((s) => s.sendCreatureToCombat)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = bestiary
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((c1, c2) => c1.name.localeCompare(c2.name))
  const editing = bestiary.find((c) => c.id === editId)

  return (
    <div>
      <div className="flex-row search-input">
        <input
          type="text"
          placeholder="Search bestiary…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-accent" onClick={() => setAdding(true)}>
          + Creature
        </button>
      </div>

      {filtered.map((c) => {
        const open = openId === c.id
        return (
          <div key={c.id} style={{ marginBottom: 10 }}>
            <div className="flex-row" style={{ marginBottom: 4 }}>
              <button
                className="btn"
                style={{ flex: 1, textAlign: 'left', textTransform: 'none', fontSize: 13 }}
                onClick={() => setOpenId(open ? null : c.id)}
              >
                {open ? '▾' : '▸'} {c.name}
                <span className="muted" style={{ fontStyle: 'italic' }}>
                  {' '}
                  — {c.cr.split(' ')[0]} CR
                </span>
              </button>
              <button className="btn btn-sm" onClick={() => sendToCombat(c.id)} title="Add to combat">
                <SwordsIcon />
              </button>
              <button className="btn btn-sm" onClick={() => setEditId(c.id)} title="Edit">
                ✎
              </button>
            </div>
            {open && <StatBlock creature={c} />}
          </div>
        )
      })}
      {filtered.length === 0 && <div className="empty-hint">No creatures match "{search}".</div>}

      {adding && (
        <AddCreatureModal
          onClose={() => setAdding(false)}
          onAdded={(id) => {
            setAdding(false)
            setEditId(id)
          }}
        />
      )}
      {editing && <CreatureEditModal creature={editing} onClose={() => setEditId(null)} />}
    </div>
  )
}
