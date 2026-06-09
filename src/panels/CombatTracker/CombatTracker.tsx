import { useState } from 'react'
import './CombatTracker.css'
import { useStore } from '../../store/store'
import { CombatantRow } from './CombatantRow'

export function CombatTracker() {
  const combatants = useStore((s) => s.combatants)
  const round = useStore((s) => s.round)
  const activeTurn = useStore((s) => s.activeTurn)
  const nextTurn = useStore((s) => s.nextTurn)
  const prevTurn = useStore((s) => s.prevTurn)
  const setRound = useStore((s) => s.setRound)
  const addCombatant = useStore((s) => s.addCombatant)
  const sortByInit = useStore((s) => s.sortByInit)
  const clearCombatants = useStore((s) => s.clearCombatants)

  const [expanded, setExpanded] = useState<string | null>(null)
  const [condFor, setCondFor] = useState<string | null>(null)
  const [portraitFor, setPortraitFor] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropId, setDropId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', init: '', hp: '' })

  const submitAdd = () => {
    if (!form.name.trim()) return
    addCombatant({
      name: form.name.trim(),
      init: parseInt(form.init) || 10,
      hp: parseInt(form.hp) || 10,
      maxHp: parseInt(form.hp) || 10,
    })
    setForm({ name: '', init: '', hp: '' })
  }

  return (
    <div>
      <div className="round-counter">
        <span>Round</span>
        <strong>{round}</strong>
        <button className="icon-btn" title="Decrease round" onClick={() => setRound(round - 1)}>
          −
        </button>
        <button className="icon-btn" title="Increase round" onClick={() => setRound(round + 1)}>
          +
        </button>
        <span className="spacer" />
        <button className="btn" onClick={prevTurn}>
          ◀ Prev
        </button>
        <button className="btn btn-accent" onClick={nextTurn}>
          Next ▶
        </button>
      </div>

      {combatants.length === 0 && <div className="empty-hint">No combatants. Add one below.</div>}

      {combatants.map((c, i) => (
        <CombatantRow
          key={c.id}
          combatant={c}
          index={i}
          activeTurn={activeTurn}
          expanded={expanded}
          setExpanded={setExpanded}
          condFor={condFor}
          setCondFor={setCondFor}
          portraitFor={portraitFor}
          setPortraitFor={setPortraitFor}
          dragId={dragId}
          setDragId={setDragId}
          dropId={dropId}
          setDropId={setDropId}
        />
      ))}

      <hr className="divider" />
      <div className="flex-row">
        <span className="section-label">Add Combatant</span>
        <span className="spacer" />
        <button className="btn btn-sm" onClick={sortByInit} title="Sort by initiative">
          Sort ▼
        </button>
        <button
          className="btn btn-sm"
          disabled={combatants.length === 0}
          title="Remove all combatants and reset to round 1"
          onClick={() => {
            if (confirm(`Clear all ${combatants.length} combatant(s) and reset the round?`)) clearCombatants()
          }}
        >
          Clear
        </button>
      </div>
      <div className="add-row">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
        />
        <input
          type="number"
          placeholder="Init"
          value={form.init}
          onChange={(e) => setForm({ ...form, init: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
        />
        <input
          type="number"
          placeholder="HP"
          value={form.hp}
          onChange={(e) => setForm({ ...form, hp: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
        />
        <button className="btn btn-accent" onClick={submitAdd}>
          Add
        </button>
      </div>
    </div>
  )
}
