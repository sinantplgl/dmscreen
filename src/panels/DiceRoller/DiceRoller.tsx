import { useState } from 'react'
import './DiceRoller.css'
import { useStore } from '../../store/store'
import type { DiceRoll, RollResult } from '../../types'

const DICE = [4, 6, 8, 10, 12, 20, 100]

/** Crit/fumble class for a single-die pool (e.g. a lone d20). */
function rollClass(roll: DiceRoll, res: RollResult): string {
  if (roll.dice.length !== 1) return ''
  const face = res.rolls[0]
  if (face === roll.dice[0]) return 'crit'
  if (face === 1) return 'fumble'
  return ''
}

/** "[4 + 5] + 2" style breakdown for a single result. */
function breakdown(roll: DiceRoll, res: RollResult): string {
  let s = res.rolls.join(' + ')
  if (roll.dice.length > 1 || roll.modifier !== 0) s = `[${s}]`
  if (roll.modifier > 0) s += ` + ${roll.modifier}`
  else if (roll.modifier < 0) s += ` − ${-roll.modifier}`
  return s
}

/** Compact label, e.g. "2d6 + 1d8". */
// function formatTerms(pool: Record<number, number>): string {
//   return DICE.filter((d) => pool[d] > 0)
//     .map((d) => `${pool[d]}d${d}`)
//     .join(' + ')
// }

export function DiceRoller() {
  const history = useStore((s) => s.diceHistory)
  const rollPool = useStore((s) => s.rollPool)
  const clearDice = useStore((s) => s.clearDice)

  // pool: die size → count
  const [pool, setPool] = useState<Record<number, number>>({})
  const [modifier, setModifier] = useState(0)
  const [times, setTimes] = useState(1)

  const poolDice = DICE.flatMap((d) => Array(pool[d] || 0).fill(d))
  const hasPool = poolDice.length > 0

  const addDie = (d: number) => setPool((p) => ({ ...p, [d]: (p[d] || 0) + 1 }))
  const removeDie = (d: number) => setPool((p) => ({ ...p, [d]: Math.max(0, (p[d] || 0) - 1) }))
  const clearPool = () => {
    setPool({})
    setModifier(0)
    setTimes(1)
  }

  const roll = () => {
    if (hasPool) rollPool(poolDice, modifier, times)
  }

  return (
    <div className="dice-roller">
      <div className="dice-row">
        {DICE.map((d) => (
          <button
            key={d}
            className="btn dice-btn"
            title={`Add a d${d} to the pool`}
            onClick={() => addDie(d)}
          >
            d{d}
            {pool[d] ? <span className="dice-btn-count">{pool[d]}</span> : null}
          </button>
        ))}
      </div>

      <div className="dice-pool">
        {!hasPool && <span className="muted">Tap dice to build a pool…</span>}
        {DICE.filter((d) => pool[d] > 0).map((d) => (
          <span className="pool-chip" key={d}>
            <button className="pool-step" title={`Remove a d${d}`} onClick={() => removeDie(d)}>
              −
            </button>
            <span className="pool-chip-label">
              {pool[d]}d{d}
            </span>
            <button className="pool-step" title={`Add a d${d}`} onClick={() => addDie(d)}>
              +
            </button>
          </span>
        ))}
      </div>

      <div className="dice-controls">
        <label className="dice-field">
          <span>Mod</span>
          <input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
          />
        </label>
        <label className="dice-field">
          <span>Rolls</span>
          <input
            type="number"
            min={1}
            max={50}
            value={times}
            onChange={(e) => setTimes(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
          />
        </label>
        <span className="spacer" />
        <button className="btn btn-sm" disabled={!hasPool} onClick={clearPool}>
          Clear
        </button>
        <button className="btn btn-accent" disabled={!hasPool} onClick={roll}>
          Roll {/* {hasPool ? ` ${formatTerms(pool)}` : ''} */}
        </button>
      </div>

      <div className="flex-row" style={{ marginBottom: 6, marginTop: 10 }}>
        <span className="section-label">History</span>
        <span className="spacer" />
        {history.length > 0 && (
          <button className="icon-btn" title="Clear history" onClick={clearDice}>
            ✕
          </button>
        )}
      </div>

      <div className="roll-history">
        {history.length === 0 && <em className="muted">No rolls yet…</em>}
        {history.map((r) => {
          const totals = r.results.map((res) => res.total)
          const high = Math.max(...totals)
          const low = Math.min(...totals)
          const sum = totals.reduce((a, b) => a + b, 0)
          const multi = r.results.length > 1
          return (
            <div className="roll-card" key={r.id}>
              <div className="roll-card-head">
                <span className="roll-expr">{r.expr}</span>
                <button
                  className="icon-btn"
                  title="Roll these dice again"
                  onClick={() => rollPool(r.dice, r.modifier, r.results.length)}
                >
                  ⟳
                </button>
              </div>
              <div className="roll-results">
                {r.results.map((res, i) => (
                  <span
                    className={'roll-chip ' + rollClass(r, res)}
                    key={i}
                    title={breakdown(r, res)}
                  >
                    {res.total}
                  </span>
                ))}
              </div>
              {multi ? (
                <div className="roll-stats">
                  high {high} · low {low} · sum {sum} · avg {Math.round(sum / totals.length)}
                </div>
              ) : (
                <div className="roll-stats">{breakdown(r, r.results[0])}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
