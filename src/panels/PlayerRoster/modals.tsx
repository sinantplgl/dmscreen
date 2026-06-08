import { useState } from 'react'
import { useStore } from '../../store/store'
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  abilityMod,
  abilityModValue,
  parseDdbId,
  profBonusForLevel,
} from '../../lib/dnd'
import type { Abilities, Player } from '../../types'
import { Checkbox } from '../../components/Checkbox'

export function CobaltModal({ onClose }: { onClose: () => void }) {
  const cobalt = useStore((s) => s.ddbCobalt)
  const setDdbCobalt = useStore((s) => s.setDdbCobalt)
  const [val, setVal] = useState(cobalt)
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>D&D Beyond Authentication</h2>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>
          To read <strong>campaign-only</strong> characters, paste your D&amp;D Beyond{' '}
          <code>CobaltSession</code> cookie. Stored only in this browser, sent only to the local
          proxy, never included in exports.
        </p>
        <ol className="muted" style={{ fontSize: 12.5, lineHeight: 1.6, margin: '0 0 10px 18px' }}>
          <li>Log in at dndbeyond.com.</li>
          <li>DevTools → Application → Cookies → https://www.dndbeyond.com.</li>
          <li>
            Copy the <code>CobaltSession</code> value and paste it below.
          </li>
        </ol>
        <textarea rows={3} placeholder="Paste CobaltSession…" value={val} onChange={(e) => setVal(e.target.value)} />
        <div className="modal-actions">
          <button className="btn" onClick={() => { setDdbCobalt(''); setVal('') }}>
            Clear
          </button>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={() => { setDdbCobalt(val.trim()); onClose() }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export function EditModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const updatePlayer = useStore((s) => s.updatePlayer)
  const removePlayer = useStore((s) => s.removePlayer)
  const [d, setD] = useState<Player>(player)
  const setAbility = (k: keyof Abilities, v: number) => setD({ ...d, abilities: { ...d.abilities, [k]: v } })
  const toggleSave = (k: keyof Abilities) => {
    const on = new Set(d.saveProficiencies ?? [])
    if (on.has(k)) on.delete(k)
    else on.add(k)
    setD({ ...d, saveProficiencies: ABILITY_KEYS.filter((a) => on.has(a)) })
  }
  const optNum = (raw: string) => (raw === '' ? undefined : parseInt(raw) || 0)
  const save = () => {
    updatePlayer(player.id, { ...d, ddbCharacterId: d.ddbUrl ? parseDdbId(d.ddbUrl) : undefined })
    onClose()
  }

  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Character</h2>
        <div className="form-grid">
          <label className="field full">
            <span>Name</span>
            <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
          </label>
          <label className="field">
            <span>Class / Subclass</span>
            <input value={d.className} onChange={(e) => setD({ ...d, className: e.target.value })} />
          </label>
          <label className="field">
            <span>Level</span>
            <input type="number" value={d.level} onChange={(e) => setD({ ...d, level: parseInt(e.target.value) || 1 })} />
          </label>
          <label className="field">
            <span>Max HP</span>
            <input type="number" value={d.maxHp} onChange={(e) => setD({ ...d, maxHp: parseInt(e.target.value) || 0 })} />
          </label>
          <label className="field">
            <span>Current HP</span>
            <input
              type="number"
              placeholder={String(d.maxHp)}
              value={d.currentHp ?? ''}
              onChange={(e) => setD({ ...d, currentHp: optNum(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>AC</span>
            <input type="number" value={d.ac} onChange={(e) => setD({ ...d, ac: parseInt(e.target.value) || 0 })} />
          </label>
          <label className="field">
            <span>Speed</span>
            <input placeholder="30 ft." value={d.speed ?? ''} onChange={(e) => setD({ ...d, speed: e.target.value })} />
          </label>
          <label className="field">
            <span>Initiative</span>
            <input
              placeholder={abilityMod(d.abilities.dex)}
              value={d.initiative ?? ''}
              onChange={(e) => setD({ ...d, initiative: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Proficiency Bonus</span>
            <input
              type="number"
              placeholder={`+${profBonusForLevel(d.level)}`}
              value={d.profBonus ?? ''}
              onChange={(e) => setD({ ...d, profBonus: optNum(e.target.value) })}
            />
          </label>
          <label className="field full">
            <span>Portrait URL</span>
            <input type="url" placeholder="https://…" value={d.portraitUrl || ''} onChange={(e) => setD({ ...d, portraitUrl: e.target.value })} />
          </label>
          <label className="field full">
            <span>D&D Beyond character URL</span>
            <input type="url" placeholder="https://www.dndbeyond.com/characters/123456" value={d.ddbUrl || ''} onChange={(e) => setD({ ...d, ddbUrl: e.target.value })} />
          </label>
        </div>
        <div className="section-label" style={{ margin: '6px 0' }}>
          Ability Scores (manual)
        </div>
        <div className="ability-row">
          {ABILITY_KEYS.map((k) => (
            <div className="ability-box" key={k}>
              <div className="lbl">{ABILITY_LABELS[k]}</div>
              <input className="mini-input" type="number" value={d.abilities[k]} onChange={(e) => setAbility(k, parseInt(e.target.value) || 0)} />
            </div>
          ))}
        </div>
        <div className="section-label" style={{ margin: '6px 0' }}>
          Saving Throw Proficiencies
        </div>
        <div className="save-prof-row">
          {ABILITY_KEYS.map((k) => (
            <Checkbox
              key={k}
              label={ABILITY_LABELS[k]}
              checked={(d.saveProficiencies ?? []).includes(k)}
              onChange={() => toggleSave(k)}
            />
          ))}
        </div>
        <div className="section-label" style={{ margin: '6px 0' }}>
          Passive Scores <span className="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>— blank = derived</span>
        </div>
        <div className="passive-edit">
          <label className="field">
            <span>Perception</span>
            <input
              type="number"
              placeholder={String(10 + abilityModValue(d.abilities.wis))}
              value={d.passivePerception ?? ''}
              onChange={(e) => setD({ ...d, passivePerception: optNum(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Investigation</span>
            <input
              type="number"
              placeholder={String(10 + abilityModValue(d.abilities.int))}
              value={d.passiveInvestigation ?? ''}
              onChange={(e) => setD({ ...d, passiveInvestigation: optNum(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Insight</span>
            <input
              type="number"
              placeholder={String(10 + abilityModValue(d.abilities.wis))}
              value={d.passiveInsight ?? ''}
              onChange={(e) => setD({ ...d, passiveInsight: optNum(e.target.value) })}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => { if (confirm(`Remove ${player.name}?`)) { removePlayer(player.id); onClose() } }}>
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
