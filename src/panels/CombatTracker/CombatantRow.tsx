import { useStore } from '../../store/store'
import { hpClass, CONDITIONS } from '../../lib/dnd'
import { StatBlock } from '../StatBlock'
import { LightningIcon } from '../../components/icons'
import type { Combatant } from '../../types'

export function CombatantRow({
  combatant: c,
  index: i,
  activeTurn,
  expanded,
  setExpanded,
  condFor,
  setCondFor,
  portraitFor,
  setPortraitFor,
  dragId,
  setDragId,
  setDropId,
  dropId,
}: {
  combatant: Combatant
  index: number
  activeTurn: number
  expanded: string | null
  setExpanded: (id: string | null) => void
  condFor: string | null
  setCondFor: (id: string | null) => void
  portraitFor: string | null
  setPortraitFor: (id: string | null) => void
  dragId: string | null
  setDragId: (id: string | null) => void
  dropId: string | null
  setDropId: (id: string | null) => void
}) {
  const bestiary = useStore((s) => s.bestiary)
  const adjustHp = useStore((s) => s.adjustHp)
  const updateCombatant = useStore((s) => s.updateCombatant)
  const removeCombatant = useStore((s) => s.removeCombatant)
  const toggleCondition = useStore((s) => s.toggleCondition)
  const reorderCombatant = useStore((s) => s.reorderCombatant)

  const creature = c.creatureId ? bestiary.find((b) => b.id === c.creatureId) : undefined

  return (
    <div>
      <div
        className={
          'combatant' +
          (i === activeTurn ? ' active-turn' : '') +
          (dropId === c.id ? ' drop-target' : '')
        }
        onDragOver={(e) => {
          if (dragId) {
            e.preventDefault()
            setDropId(c.id)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          if (dragId) reorderCombatant(dragId, c.id)
          setDragId(null)
          setDropId(null)
        }}
      >
        <div
          className="combat-portrait-cell"
          title="Set portrait"
          onClick={() => setPortraitFor(portraitFor === c.id ? null : c.id)}
        >
          {c.portraitUrl ? (
            <img
              className="combat-portrait"
              src={c.portraitUrl}
              alt={c.name}
              style={{ transform: c.portraitFlip ? 'scaleX(-1)' : undefined }}
            />
          ) : (
            <div className="combat-portrait placeholder">{c.name.charAt(0) || '?'}</div>
          )}
        </div>

        <div className="init-cell">
          <input
            className={'init-input' + (i === activeTurn ? ' active' : '')}
            type="number"
            value={c.init}
            title="Initiative (editable)"
            onChange={(e) => updateCombatant(c.id, { init: parseInt(e.target.value) || 0 })}
          />
          <span
            className="init-grip"
            draggable
            title="Drag to reorder"
            onDragStart={() => setDragId(c.id)}
            onDragEnd={() => {
              setDragId(null)
              setDropId(null)
            }}
          >
            ⠿
          </span>
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            className={'c-name' + (creature ? ' c-name-link' : '')}
            onClick={() => creature && setExpanded(expanded === c.id ? null : c.id)}
            title={creature ? 'Show stat block' : undefined}
          >
            {c.name}
            {c.dupNumber ? <span className="dup-num">#{c.dupNumber}</span> : null}
          </div>
          <div className="c-type">{c.type}</div>
          {c.conditions.length > 0 && (
            <div>
              {c.conditions.map((cd) => (
                <span
                  key={cd}
                  className="condition-tag"
                  title="Click to remove"
                  onClick={() => toggleCondition(c.id, cd)}
                >
                  {cd} ✕
                </span>
              ))}
            </div>
          )}
          <div className="hp-bar">
            <div
              className={'hp-fill ' + hpClass(c.hp, c.maxHp)}
              style={{ width: `${Math.max(0, (c.hp / c.maxHp) * 100)}%` }}
            />
          </div>
          <div className="combat-row-2">
            <button className="btn btn-sm" onClick={() => adjustHp(c.id, -5)} title="Damage 5">
              −5
            </button>
            <button className="btn btn-sm" onClick={() => adjustHp(c.id, -1)}>
              −1
            </button>
            <input
              className="mini-input"
              type="number"
              value={c.hp}
              onChange={(e) => updateCombatant(c.id, { hp: parseInt(e.target.value) || 0 })}
            />
            {c.isPlayer ? (
              <span className="hp-text">/ {c.maxHp}</span>
            ) : (
              <>
                <span className="hp-text">/</span>
                <input
                  className="mini-input"
                  type="number"
                  value={c.maxHp}
                  title="Max HP (editable)"
                  onChange={(e) => {
                    const maxHp = Math.max(1, parseInt(e.target.value) || 0)
                    updateCombatant(c.id, { maxHp, hp: Math.min(c.hp, maxHp) })
                  }}
                />
              </>
            )}
            <button className="btn btn-sm" onClick={() => adjustHp(c.id, 1)}>
              +1
            </button>
            <button className="btn btn-sm" onClick={() => adjustHp(c.id, 5)} title="Heal 5">
              +5
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className="ac-badge">AC {c.ac}</span>
          <button
            className="icon-btn"
            title="Conditions"
            onClick={() => setCondFor(condFor === c.id ? null : c.id)}
          >
            <LightningIcon />
          </button>
          <button
            className="icon-btn danger"
            title="Remove"
            onClick={() => removeCombatant(c.id)}
          >
            ✕
          </button>
        </div>
      </div>

      {portraitFor === c.id && (
        <div className="portrait-edit">
          <input
            type="url"
            placeholder="Portrait image URL…"
            value={c.portraitUrl || ''}
            onChange={(e) => updateCombatant(c.id, { portraitUrl: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && setPortraitFor(null)}
          />
          {c.portraitUrl && (
            <button
              className="btn btn-sm"
              onClick={() => updateCombatant(c.id, { portraitUrl: '' })}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {condFor === c.id && (
        <div className="cond-picker">
          {CONDITIONS.map((cond) => (
            <span
              key={cond}
              className={'cond-pick' + (c.conditions.includes(cond) ? ' on' : '')}
              onClick={() => toggleCondition(c.id, cond)}
            >
              {cond}
            </span>
          ))}
        </div>
      )}

      {expanded === c.id && creature && (
        <div style={{ margin: '6px 0 10px' }}>
          <StatBlock creature={creature} />
        </div>
      )}
    </div>
  )
}
