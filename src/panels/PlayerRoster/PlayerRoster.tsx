import { useState } from 'react'
import './PlayerRoster.css'
import type { ReactNode } from 'react'
import { useStore } from '../../store/store'
import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  abilityMod,
  abilityModValue,
  hpClass,
  parseDdbId,
  profBonusForLevel,
} from '../../lib/dnd'
import type { Abilities, AbilityStat, CharacterSheet, Player, SaveStat } from '../../types'
import { Checkbox } from '../../components/Checkbox'
import { SwordsIcon, WarningIcon } from '../../components/icons'

const ABBRS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const

function ddbId(player: Player): string | undefined {
  if (player.ddbCharacterId) return player.ddbCharacterId
  const m = player.ddbUrl?.match(/characters\/(\d+)/)
  return m ? m[1] : undefined
}

async function fetchRendered(id: string, cobalt: string): Promise<CharacterSheet> {
  const r = await fetch(`/ddb-api/rendered/${id}`, { headers: cobalt ? { 'x-cobalt': cobalt } : undefined })
  const json = await r.json().catch(() => ({}))
  if (!r.ok || json.success === false) throw new Error(json.message || `Request failed (${r.status})`)
  return { ...(json.data as CharacterSheet), fetchedAt: new Date().toISOString() }
}

function relativeTime(iso?: string): string {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

// ── one compact stat cell (AC / Init / Speed / …) ───────────────────────────
function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="mini-stat">
      <div className="v">{value}</div>
      <div className="l">{label}</div>
    </div>
  )
}

// ── 6 ability tiles: modifier big (primary), score in a pill (DDB style) ─────
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

// ── the rich, DDB-style sheet rendered from a snapshot ──────────────────────
function SheetView({ sheet }: { sheet: CharacterSheet }) {
  const cur = sheet.hpCurrent
  const max = sheet.hpMax
  const pct = max ? Math.max(0, Math.min(100, ((cur ?? 0) / max) * 100)) : 0
  // Defensive defaults so an older/partial snapshot can't crash the render.
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

      {/* Combat (shield + 1×3) | Saving Throws (3×2) + senses — side by side */}
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
              {/* passive scores */}
              <div className="passives-row">
                <MiniStat label="Pass. Per" value={sheet.passivePerception ?? '—'} />
                <MiniStat label="Pass. Inv" value={sheet.passiveInvestigation ?? '—'} />
                <MiniStat label="Pass. Ins" value={sheet.passiveInsight ?? '—'} />
              </div>
          </div>
        </div>
      </div>

      {/* compact HP line */}
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

// ── derive a CharacterSheet-shaped view-model from the manual Player fields ──
// so a character WITHOUT a fetched DDB snapshot renders through the exact same
// SheetView. Anything the DM didn't enter is computed from abilities/level the
// way 5e would (mods, prof bonus, save bonuses, passives); skills/senses/
// conditions stay empty (DDB-only enrichments that simply don't show).
function sheetFromPlayer(p: Player): CharacterSheet {
  const prof = p.profBonus ?? profBonusForLevel(p.level)
  const fmt = (n: number) => (n >= 0 ? '+' : '') + n

  const abilities: Record<string, AbilityStat> = {}
  const saves: Record<string, SaveStat> = {}
  const profSet = new Set(p.saveProficiencies ?? [])
  for (const k of ABILITY_KEYS) {
    const label = ABILITY_LABELS[k]
    const mod = abilityModValue(p.abilities[k])
    abilities[label] = { score: p.abilities[k], mod: fmt(mod) }
    const proficient = profSet.has(k)
    saves[label] = { bonus: fmt(mod + (proficient ? prof : 0)), proficient }
  }
  const wisMod = abilityModValue(p.abilities.wis)
  const intMod = abilityModValue(p.abilities.int)
  return {
    name: p.name,
    summary: null,
    avatarUrl: p.portraitUrl ?? null,
    ac: p.ac,
    hpCurrent: p.currentHp ?? p.maxHp,
    hpMax: p.maxHp,
    hpTemp: null,
    speed: p.speed || '30 ft.',
    initiative: p.initiative || abilityMod(p.abilities.dex),
    profBonus: prof,
    abilities,
    saves,
    skills: [],
    senses: [],
    conditions: [],
    passivePerception: p.passivePerception ?? 10 + wisMod,
    passiveInvestigation: p.passiveInvestigation ?? 10 + intMod,
    passiveInsight: p.passiveInsight ?? 10 + wisMod,
  }
}

function PlayerSheetCard({
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
  // One rendering path: a real DDB snapshot when present, otherwise a derived
  // one from the manual fields. The card looks identical either way.
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
          <div className="sheet-sub">{sheet?.summary || `${player.className} · Lvl ${player.level}`}</div>
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

// ── cobalt cookie modal ─────────────────────────────────────────────────────
function CobaltModal({ onClose }: { onClose: () => void }) {
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

// ── edit character modal (manual fields + DDB link) ─────────────────────────
function EditModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const updatePlayer = useStore((s) => s.updatePlayer)
  const removePlayer = useStore((s) => s.removePlayer)
  const [d, setD] = useState<Player>(player)
  const setAbility = (k: keyof Abilities, v: number) => setD({ ...d, abilities: { ...d.abilities, [k]: v } })
  const toggleSave = (k: keyof Abilities) => {
    const on = new Set(d.saveProficiencies ?? [])
    if (on.has(k)) on.delete(k)
    else on.add(k)
    // keep STR…CHA order canonical so re-renders are stable
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

export function PlayerRoster({
  config,
  onConfig,
}: {
  config?: Record<string, unknown>
  onConfig: (c: Record<string, unknown>) => void
}) {
  const allPlayers = useStore((s) => s.players)
  const parties = useStore((s) => s.parties)
  // The party LIST is shared, but the *selected* party is per-panel (stored in
  // this panel's config). Fall back to the first party if unset or deleted.
  const storedPartyId = config?.activePartyId as string | undefined
  const activePartyId = parties.find((p) => p.id === storedPartyId)?.id ?? parties[0]?.id ?? ''
  const setActiveParty = (id: string) => onConfig({ activePartyId: id })
  const addParty = useStore((s) => s.addParty)
  const renameParty = useStore((s) => s.renameParty)
  const deleteParty = useStore((s) => s.deleteParty)
  const addPlayer = useStore((s) => s.addPlayer)
  const setPlayerSheet = useStore((s) => s.setPlayerSheet)
  const cobalt = useStore((s) => s.ddbCobalt)
  const hasCobalt = !!cobalt
  const combatants = useStore((s) => s.combatants)
  const addCombatant = useStore((s) => s.addCombatant)

  const [editFor, setEditFor] = useState<Player | null>(null)
  const [cobaltOpen, setCobaltOpen] = useState(false)
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null)

  const players = allPlayers.filter((p) => p.partyId === activePartyId)

  const setLoading = (id: string, on: boolean) =>
    setLoadingIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const refreshOne = async (player: Player) => {
    const id = ddbId(player)
    if (!id) {
      setErrors((e) => ({ ...e, [player.id]: 'No D&D Beyond link set (use ✎).' }))
      return
    }
    setLoading(player.id, true)
    setErrors((e) => ({ ...e, [player.id]: '' }))
    try {
      const sheet = await fetchRendered(id, cobalt)
      setPlayerSheet(player.id, sheet)
    } catch (err) {
      setErrors((e) => ({ ...e, [player.id]: (err as Error).message }))
    } finally {
      setLoading(player.id, false)
    }
  }

  const refreshAll = async () => {
    const targets = players.filter((p) => ddbId(p))
    if (targets.length === 0) return
    setBulk({ done: 0, total: targets.length })
    for (let i = 0; i < targets.length; i++) {
      await refreshOne(targets[i]) // sequential — one shared headless browser
      setBulk({ done: i + 1, total: targets.length })
    }
    setBulk(null)
  }

  const inCombatNames = new Set(combatants.map((c) => c.name))
  const addToCombat = (player: Player) => {
    if (inCombatNames.has(player.name)) return
    const maxHp = player.sheet?.hpMax ?? player.maxHp
    const hp = player.sheet?.hpCurrent ?? maxHp
    addCombatant({
      name: player.name,
      type: 'Player',
      init: 10,
      hp,
      maxHp,
      ac: player.sheet?.ac ?? player.ac,
      isPlayer: true,
      portraitUrl: player.sheet?.avatarUrl ?? player.portraitUrl,
    })
  }
  const addPartyToCombat = () => players.forEach(addToCombat)

  const activeParty = parties.find((p) => p.id === activePartyId)

  return (
    <div>
      <div className="roster-toolbar">
        <select value={activePartyId} onChange={(e) => setActiveParty(e.target.value)} title="Active party" style={{ width: 'auto' }}>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="icon-btn" title="New party" onClick={() => setActiveParty(addParty())}>
          ＋
        </button>
        <button
          className="icon-btn"
          title="Rename party"
          onClick={() => {
            const name = prompt('Rename party', activeParty?.name || '')
            if (name && name.trim()) renameParty(activePartyId, name.trim())
          }}
        >
          ✎
        </button>
        {parties.length > 1 && (
          <button
            className="icon-btn danger"
            title="Delete party (and its characters)"
            onClick={() => {
              if (confirm(`Delete party "${activeParty?.name}" and its characters?`)) deleteParty(activePartyId)
            }}
          >
            ✕
          </button>
        )}

        <span className="spacer" />

        <button className="btn" onClick={() => setCobaltOpen(true)} title={hasCobalt ? 'DDB cookie is set' : 'Set DDB cookie'}>
          DDB Auth {hasCobalt ? '✓' : <WarningIcon />}
        </button>
        <button className="btn btn-accent" onClick={refreshAll} disabled={!!bulk}>
          {bulk ? `Refreshing ${bulk.done}/${bulk.total}…` : '⟳ Refresh all'}
        </button>
        <button className="btn" onClick={addPartyToCombat} title="Add this party to the combat tracker">
          <SwordsIcon /> To combat
        </button>
        <button className="btn" onClick={() => addPlayer(activePartyId)}>
          + Character
        </button>
      </div>

      <div className="sheet-grid">
        {players.map((p) => (
          <PlayerSheetCard
            key={p.id}
            player={p}
            loading={loadingIds.has(p.id)}
            error={errors[p.id] || undefined}
            inCombat={inCombatNames.has(p.name)}
            onRefresh={() => refreshOne(p)}
            onEdit={() => setEditFor(p)}
            onAddToCombat={() => addToCombat(p)}
          />
        ))}
      </div>
      {players.length === 0 && <div className="empty-hint">No characters in this party. Add one →</div>}

      {editFor && <EditModal player={editFor} onClose={() => setEditFor(null)} />}
      {cobaltOpen && <CobaltModal onClose={() => setCobaltOpen(false)} />}
    </div>
  )
}
