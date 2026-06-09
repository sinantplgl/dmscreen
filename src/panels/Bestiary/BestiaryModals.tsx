import { useState } from 'react'
import { useStore } from '../../store/store'
import { Checkbox } from '../../components/Checkbox'
import { ABILITY_KEYS, ABILITY_LABELS } from '../../lib/dnd'
import type { Abilities, Creature } from '../../types'
import { sourceForUrl } from '../../bestiary'
import { EntryListEditor } from './EntryListEditor'

export function CreatureEditModal({ creature, onClose }: { creature: Creature; onClose: () => void }) {
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
          <div className="field full">
            <Checkbox
              checked={!!d.unique}
              onChange={(v) => f({ unique: v })}
              label="Unique — only one can be in combat / an encounter at a time"
            />
          </div>
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
        <label className="field full" style={{ marginBottom: 6 }}>
          <span>Legendary Actions — intro (the "Legendary Action Uses…" preamble)</span>
          <textarea
            rows={2}
            value={d.legendaryIntro || ''}
            onChange={(e) => f({ legendaryIntro: e.target.value })}
          />
        </label>
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

export function AddCreatureModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: (id: string) => void
}) {
  const addCreature = useStore((s) => s.addCreature)
  const addCreatureFrom = useStore((s) => s.addCreatureFrom)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const doImport = async () => {
    const trimmed = url.trim()
    const source = sourceForUrl(trimmed)
    if (!source) {
      setError('No importer matches that link. Currently supported: D&D Beyond monster pages (…/monsters/…).')
      return
    }
    setLoading(true)
    setError(undefined)
    try {
      const data = await source.fetchMonster(trimmed)
      onAdded(addCreatureFrom(data))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(480px, 95vw)' }}>
        <h2>Add Creature</h2>
        <label className="field full">
          <span>Import from a link</span>
          <input
            type="url"
            placeholder="https://www.dndbeyond.com/monsters/…"
            value={url}
            autoFocus
            disabled={loading}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && url.trim()) doImport()
            }}
          />
        </label>
        <div className="muted" style={{ fontSize: 12 }}>
          Paste a public D&D Beyond monster page — the stat block fills in automatically and stays
          fully editable. (More sources later.)
        </div>
        {error && (
          <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{error}</div>
        )}
        <div className="modal-actions">
          <button className="btn" disabled={loading} onClick={() => onAdded(addCreature())}>
            Start blank
          </button>
          <span className="spacer" />
          <button className="btn" disabled={loading} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-accent" disabled={!url.trim() || loading} onClick={doImport}>
            {loading ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
