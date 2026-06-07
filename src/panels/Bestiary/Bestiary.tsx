import { useState } from 'react'
import './Bestiary.css'
import { useStore } from '../../store/store'
import { ABILITY_KEYS, ABILITY_LABELS } from '../../lib/dnd'
import type { Abilities, Creature, StatEntry } from '../../types'
import { StatBlock } from '../StatBlock'
import { SwordsIcon } from '../../components/icons'

// ── editor for a list of named trait/action entries ─────────────────────────
function EntryListEditor({
  label,
  entries,
  onChange,
}: {
  label: string
  entries: StatEntry[]
  onChange: (e: StatEntry[]) => void
}) {
  const set = (i: number, patch: Partial<StatEntry>) =>
    onChange(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="flex-row" style={{ marginBottom: 4 }}>
        <span className="section-label">{label}</span>
        <span className="spacer" />
        <button className="btn btn-sm" onClick={() => onChange([...entries, { name: '', text: '' }])}>
          + Add
        </button>
      </div>
      {entries.map((e, i) => (
        <div key={i} className="flex-row" style={{ alignItems: 'flex-start', marginBottom: 5 }}>
          <input
            style={{ flex: '0 0 34%' }}
            placeholder="Name"
            value={e.name}
            onChange={(ev) => set(i, { name: ev.target.value })}
          />
          <textarea
            rows={2}
            placeholder="Description"
            value={e.text}
            onChange={(ev) => set(i, { text: ev.target.value })}
          />
          <button
            className="icon-btn danger"
            onClick={() => onChange(entries.filter((_, idx) => idx !== i))}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

function CreatureEditModal({ creature, onClose }: { creature: Creature; onClose: () => void }) {
  const updateCreature = useStore((s) => s.updateCreature)
  const removeCreature = useStore((s) => s.removeCreature)
  const [d, setD] = useState<Creature>(creature)
  const f = (patch: Partial<Creature>) => setD({ ...d, ...patch })
  const setAbility = (k: keyof Abilities, v: number) =>
    setD({ ...d, abilities: { ...d.abilities, [k]: v } })

  const save = () => {
    updateCreature(creature.id, d)
    onClose()
  }

  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(640px, 95vw)' }}>
        <h2>Edit Creature</h2>
        <div className="form-grid">
          <label className="field full">
            <span>Name</span>
            <input value={d.name} onChange={(e) => f({ name: e.target.value })} />
          </label>
          <label className="field full">
            <span>Type line (e.g. "Large undead, chaotic evil")</span>
            <input value={d.meta} onChange={(e) => f({ meta: e.target.value })} />
          </label>
          <label className="field full">
            <span>Image URL (backdrop + combat portrait)</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="url"
                placeholder="https://…"
                value={d.imageUrl || ''}
                onChange={(e) => f({ imageUrl: e.target.value })}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className={'btn btn-sm flip-toggle' + (d.imageFlip ? ' on' : '')}
                title="Flip image horizontally"
                aria-pressed={!!d.imageFlip}
                onClick={() => f({ imageFlip: !d.imageFlip })}
              >
                ⇄ Flip
              </button>
            </div>
          </label>
          <label className="field">
            <span>Armor Class</span>
            <input value={d.ac} onChange={(e) => f({ ac: e.target.value })} />
          </label>
          <label className="field">
            <span>Initiative (blank = from DEX)</span>
            <input
              placeholder="+7 (17)"
              value={d.initiative || ''}
              onChange={(e) => f({ initiative: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Hit Points</span>
            <input value={d.hp} onChange={(e) => f({ hp: e.target.value })} />
          </label>
          <label className="field">
            <span>Speed</span>
            <input value={d.speed} onChange={(e) => f({ speed: e.target.value })} />
          </label>
          <label className="field">
            <span>Challenge</span>
            <input value={d.cr} onChange={(e) => f({ cr: e.target.value })} />
          </label>
        </div>

        <div className="section-label" style={{ margin: '8px 0 4px' }}>
          Ability Scores
        </div>
        <div className="ability-row" style={{ marginBottom: 8 }}>
          {ABILITY_KEYS.map((k) => (
            <div className="ability-box" key={k}>
              <div className="lbl">{ABILITY_LABELS[k]}</div>
              <input
                className="mini-input"
                type="number"
                value={d.abilities[k]}
                onChange={(e) => setAbility(k, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Saving Throws</span>
            <input value={d.saves || ''} onChange={(e) => f({ saves: e.target.value })} />
          </label>
          <label className="field">
            <span>Skills</span>
            <input value={d.skills || ''} onChange={(e) => f({ skills: e.target.value })} />
          </label>
          <label className="field">
            <span>Damage Vulnerabilities</span>
            <input
              value={d.damageVulnerabilities || ''}
              onChange={(e) => f({ damageVulnerabilities: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Damage Resistances</span>
            <input value={d.damageResistances || ''} onChange={(e) => f({ damageResistances: e.target.value })} />
          </label>
          <label className="field">
            <span>Damage Immunities</span>
            <input value={d.damageImmunities || ''} onChange={(e) => f({ damageImmunities: e.target.value })} />
          </label>
          <label className="field">
            <span>Condition Immunities</span>
            <input value={d.conditionImmunities || ''} onChange={(e) => f({ conditionImmunities: e.target.value })} />
          </label>
          <label className="field">
            <span>Senses</span>
            <input value={d.senses || ''} onChange={(e) => f({ senses: e.target.value })} />
          </label>
          <label className="field">
            <span>Gear</span>
            <input value={d.gear || ''} onChange={(e) => f({ gear: e.target.value })} />
          </label>
          <label className="field full">
            <span>Languages</span>
            <input value={d.languages || ''} onChange={(e) => f({ languages: e.target.value })} />
          </label>
          <label className="field">
            <span>Habitat</span>
            <input value={d.habitat || ''} onChange={(e) => f({ habitat: e.target.value })} />
          </label>
          <label className="field">
            <span>Treasure</span>
            <input value={d.treasure || ''} onChange={(e) => f({ treasure: e.target.value })} />
          </label>
        </div>

        <hr className="divider" />
        <EntryListEditor label="Traits" entries={d.traits} onChange={(traits) => f({ traits })} />
        <EntryListEditor label="Actions" entries={d.actions} onChange={(actions) => f({ actions })} />
        <EntryListEditor
          label="Bonus Actions"
          entries={d.bonusActions || []}
          onChange={(bonusActions) => f({ bonusActions })}
        />
        <EntryListEditor
          label="Reactions"
          entries={d.reactions || []}
          onChange={(reactions) => f({ reactions })}
        />
        <EntryListEditor
          label="Legendary Actions"
          entries={d.legendary || []}
          onChange={(legendary) => f({ legendary })}
        />

        <div className="modal-actions">
          <button
            className="btn"
            onClick={() => {
              if (confirm(`Delete ${d.name} from the bestiary?`)) {
                removeCreature(creature.id)
                onClose()
              }
            }}
          >
            Delete
          </button>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export function Bestiary() {
  const bestiary = useStore((s) => s.bestiary)
  const addCreature = useStore((s) => s.addCreature)
  const sendToCombat = useStore((s) => s.sendCreatureToCombat)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = bestiary.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
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
        <button className="btn btn-accent" onClick={() => setEditId(addCreature())}>
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
      {filtered.length === 0 && <div className="empty-hint">No creatures match “{search}”.</div>}

      {editing && <CreatureEditModal creature={editing} onClose={() => setEditId(null)} />}
    </div>
  )
}
