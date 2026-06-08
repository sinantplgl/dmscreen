import type { ReactNode } from 'react'
import { hpClass } from '../../lib/dnd'
import type { CharacterSheet, Player } from '../../types'
import { SwordsIcon } from '../../components/icons'
import { ABBRS, ddbId, relativeTime, sheetFromPlayer } from './helpers'

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="mini-stat">
      <div className="v">{value}</div>
      <div className="l">{label}</div>
    </div>
  )
}

function AbilityTiles({ tiles }: { tiles: { ab: string; mod: string; score: number | string }[] }) {
  return (
    <div className="abil-row">
      {tiles.map((t) => (
        <div className="abil-tile" key={t.ab}>
          <div className="abil-name">{t.ab}</div>
          <div className="abil-mod">{t.mod}</div>
          <div className="abil-score">{t.score}</div>
        </div>
      ))}
    </div>
  )
}

function SheetView({ sheet }: { sheet: CharacterSheet }) {
  const cur = sheet.hpCurrent
  const max = sheet.hpMax
  const pct = max ? Math.max(0, Math.min(100, ((cur ?? 0) / max) * 100)) : 0
  const abilities = sheet.abilities ?? {}
  const saves = sheet.saves ?? {}
  const skills = sheet.skills ?? []
  const senses = sheet.senses ?? []
  const conditions = sheet.conditions ?? []
  return (
    <>
      <AbilityTiles
        tiles={ABBRS.map((ab) => ({
          ab,
          mod: abilities[ab]?.mod ?? '—',
          score: abilities[ab]?.score ?? '—',
        }))}
      />

      <div className="sheet-cols">
        <div className="sheet-col">
          <div className="framed">
            <div className="framed-h">Combat</div>
            <div className="framed-body">
              <div className="combat-flex">
                <div className="ac-shield">
                  <div className="ac-v">{sheet.ac ?? '—'}</div>
                  <div className="ac-l">AC</div>
                </div>
                <div className="combat-rest">
                  <MiniStat label="Init" value={sheet.initiative ?? '—'} />
                  <MiniStat label="Speed" value={sheet.speed ?? '—'} />
                  <MiniStat label="Prof" value={sheet.profBonus != null ? `+${sheet.profBonus}` : '—'} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sheet-col">
          <div className="framed">
            <div className="framed-h">Saving Throws</div>
            <div className="framed-body">
              <div className="saves-grid">
                {ABBRS.map((ab) => {
                  const s = saves[ab]
                  return (
                    <div className={'save-chip' + (s?.proficient ? ' on' : '')} key={ab}>
                      <span className="save-ab">{ab}</span>
                      <span className="save-bonus">{s?.bonus ?? '—'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="framed-body">
            <div className="passives-row">
              <MiniStat label="Pass. Per" value={sheet.passivePerception ?? '—'} />
              <MiniStat label="Pass. Inv" value={sheet.passiveInvestigation ?? '—'} />
              <MiniStat label="Pass. Ins" value={sheet.passiveInsight ?? '—'} />
            </div>
          </div>
        </div>
      </div>

      <div className="hp-line">
        <span className="hp-lbl">HP</span>
        <span className="hp-val">
          {cur ?? '—'}
          <span className="muted"> / {max ?? '—'}</span>
          {sheet.hpTemp ? <span className="hp-temp"> +{sheet.hpTemp}</span> : null}
        </span>
        <div className="hp-bar">
          <div className={'hp-fill ' + hpClass(cur ?? 0, max ?? 1)} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {skills.length > 0 && (
        <details className="sheet-skills">
          <summary>Skills & Senses</summary>
          <div className="skills-grid">
            {skills.map((sk) => {
              const p = sk.proficiency.toLowerCase()
              const cls = /expertise/.test(p)
                ? ' expertise'
                : /half/.test(p)
                  ? ' half'
                  : /proficient/.test(p) && !/not/.test(p)
                    ? ' on'
                    : ''
              return (
                <div className={'skill-row' + cls} key={sk.name} title={sk.proficiency}>
                  <span className="skill-dot" />
                  <span className="skill-name">{sk.name}</span>
                  <span className="skill-bonus">{sk.bonus}</span>
                </div>
              )
            })}
          </div>
          {senses.length > 0 && (
            <div className="senses-line">
              {senses.map((s, i) => (
                <span key={i}>
                  {i > 0 ? ' · ' : ''}
                  <span className="sense-chip">{s}</span>
                </span>
              ))}
            </div>
          )}
        </details>
      )}

      {conditions.length > 0 && (
        <div className="flex-row flex-wrap" style={{ gap: 4, marginTop: 8 }}>
          {conditions.map((c, i) => (
            <span key={i} className="tag tag-red">
              {c}
            </span>
          ))}
        </div>
      )}
    </>
  )
}

export function PlayerSheetCard({
  player,
  loading,
  error,
  inCombat,
  onRefresh,
  onEdit,
  onAddToCombat,
}: {
  player: Player
  loading: boolean
  error?: string
  inCombat: boolean
  onRefresh: () => void
  onEdit: () => void
  onAddToCombat: () => void
}) {
  const href = player.ddbUrl || (ddbId(player) ? `https://www.dndbeyond.com/characters/${ddbId(player)}` : undefined)
  const sheet = player.sheet
  const view = sheet ?? sheetFromPlayer(player)
  return (
    <div className="sheet-card">
      <div className="sheet-head">
        {player.portraitUrl ? (
          <img className="sheet-portrait" src={player.portraitUrl} alt={player.name} />
        ) : (
          <div className="sheet-portrait placeholder">{player.name.charAt(0) || '?'}</div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="sheet-name">{player.name}</div>
          <div className="sheet-sub">
            {player.className}
            {player.level ? ` · Level ${player.level}` : ''}
          </div>
        </div>
        <div className="sheet-head-actions">
          <button
            className="icon-btn"
            title={inCombat ? 'Already in combat tracker' : 'Add to combat tracker'}
            disabled={inCombat}
            onClick={onAddToCombat}
          >
            <SwordsIcon />
          </button>
          <button className="icon-btn" title="Refresh from D&D Beyond" disabled={loading} onClick={onRefresh}>
            {loading ? '…' : '⟳'}
          </button>
          <button className="icon-btn" title="Edit character" onClick={onEdit}>
            ✎
          </button>
        </div>
      </div>

      {error && (
        <div className="tag tag-red" style={{ display: 'block', padding: '4px 8px', margin: '6px 0' }}>
          {error}
        </div>
      )}

      <SheetView sheet={view} />

      {!sheet && (
        <div className="empty-hint" style={{ marginTop: 6 }}>
          {ddbId(player)
            ? 'Manual values — hit ⟳ to pull the exact sheet from D&D Beyond.'
            : 'Manual values — use ✎ to edit, or add a D&D Beyond link to fetch.'}
        </div>
      )}

      <div className="sheet-foot">
        <span className="muted">{sheet ? `updated ${relativeTime(sheet.fetchedAt)}` : ''}</span>
        <span className="spacer" />
        {href && (
          <a className="btn btn-sm" href={href} target="_blank" rel="noreferrer">
            DDB ↗
          </a>
        )}
      </div>
    </div>
  )
}
