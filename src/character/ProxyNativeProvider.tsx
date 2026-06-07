import { useEffect, useState } from 'react'
import type { CharacterDetailProvider } from './CharacterDetailProvider'
import type { Player } from '../types'
import { parseCharacter, type ParsedCharacter } from './ddbParse'
import { useStore } from '../store/store'
import { ABILITY_KEYS, ABILITY_LABELS, abilityMod } from '../lib/dnd'

function ddbId(player: Player): string | undefined {
  if (player.ddbCharacterId) return player.ddbCharacterId
  const m = player.ddbUrl?.match(/characters\/(\d+)/)
  return m ? m[1] : undefined
}

function NativeSheet({ player }: { player: Player }) {
  const cobalt = useStore((s) => s.ddbCobalt)
  const updatePlayer = useStore((s) => s.updatePlayer)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [error, setError] = useState('')
  const [char, setChar] = useState<ParsedCharacter | null>(null)

  const id = ddbId(player)

  useEffect(() => {
    if (!id) {
      setState('error')
      setError('No D&D Beyond character link set. Add one via the ✎ edit button on the card.')
      return
    }
    let cancelled = false
    setState('loading')
    fetch(`/ddb-api/character/${id}`, {
      headers: cobalt ? { 'x-cobalt': cobalt } : undefined,
    })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}))
        if (!r.ok || json.success === false) {
          throw new Error(
            json.message ||
              `Request failed (${r.status}). For campaign-only characters, set your D&D Beyond cookie via “DDB Auth”.`,
          )
        }
        return json.data ?? json
      })
      .then((data) => {
        if (cancelled) return
        setChar(parseCharacter(data))
        setState('ok')
      })
      .catch((e: Error) => {
        if (cancelled) return
        setError(e.message)
        setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [id, cobalt])

  const href = player.ddbUrl || (id ? `https://www.dndbeyond.com/characters/${id}` : undefined)

  if (state === 'loading') return <div style={{ padding: 24 }} className="muted">Loading character from D&D Beyond…</div>

  if (state === 'error')
    return (
      <div style={{ padding: 24 }}>
        <p className="tag tag-red" style={{ padding: '6px 10px', display: 'block', marginBottom: 12 }}>
          {error}
        </p>
        {href && (
          <a className="btn" href={href} target="_blank" rel="noreferrer">
            Open on D&amp;D Beyond ↗
          </a>
        )}
      </div>
    )

  if (!char) return null

  const importToCard = () => {
    updatePlayer(player.id, {
      name: char.name,
      portraitUrl: char.avatarUrl,
      className: char.classes.map((c) => c.name).join(' / '),
      level: char.totalLevel,
      abilities: { ...char.abilities },
      maxHp: char.maxHp ?? player.maxHp,
      passivePerception: char.passivePerception,
    })
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="flex-row" style={{ alignItems: 'flex-start', gap: 16 }}>
        {char.avatarUrl && (
          <img
            src={char.avatarUrl}
            alt={char.name}
            style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--accent2)' }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: 'var(--gold)' }}>{char.name}</div>
          <div className="muted italic">{char.race}</div>
          <div style={{ marginTop: 4 }}>
            {char.classes.map((c, i) => (
              <span key={i} className="tag tag-gold" style={{ marginRight: 6 }}>
                {c.name}
                {c.subclass ? ` (${c.subclass})` : ''} {c.level}
              </span>
            ))}
          </div>
          <div className="flex-row flex-wrap" style={{ marginTop: 8, gap: 8 }}>
            <span className="tag tag-blue">Level {char.totalLevel}</span>
            <span className="tag tag-blue">Prof +{char.profBonus}</span>
            {char.maxHp != null && <span className="tag tag-green">Max HP ≈ {char.maxHp}</span>}
            <span className="tag tag-gold">
              Passive Perception {char.passivePerception}
              {char.perceptionExpertise ? ' (expertise)' : char.perceptionProficient ? ' (prof)' : ''}
            </span>
          </div>
        </div>
      </div>

      <hr className="divider" />
      <div className="ability-row" style={{ maxWidth: 420 }}>
        {ABILITY_KEYS.map((k) => (
          <div className="ability-box" key={k}>
            <div className="lbl">{ABILITY_LABELS[k]}</div>
            <div className="score">{char.abilities[k]}</div>
            <div className="mod">{abilityMod(char.abilities[k])}</div>
          </div>
        ))}
      </div>

      <hr className="divider" />
      <div className="form-grid">
        <div>
          <div className="section-label">Saving Throw Proficiencies</div>
          <div>{char.saveProf.length ? char.saveProf.join(', ') : <span className="muted">None</span>}</div>
        </div>
        <div>
          <div className="section-label">Skill Proficiencies</div>
          <div>{char.skillProf.length ? char.skillProf.join(', ') : <span className="muted">None</span>}</div>
        </div>
      </div>

      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 13 }}>
          How these ability scores were calculated
        </summary>
        <div style={{ marginTop: 8 }}>
          {ABILITY_KEYS.map((k) => {
            const b = char.abilityBreakdown[k]
            return (
              <div key={k} style={{ marginBottom: 8, fontSize: 13 }}>
                <strong style={{ color: 'var(--gold)' }}>
                  {ABILITY_LABELS[k]} = {b.total}
                </strong>
                {b.override != null ? (
                  <span className="muted"> (manual override)</span>
                ) : (
                  <ul style={{ margin: '2px 0 0 18px', padding: 0 }}>
                    <li>base {b.base}</li>
                    {b.bonusStats !== 0 && <li>flat bonus {b.bonusStats}</li>}
                    {b.contributions.map((c, i) => (
                      <li key={i} style={{ color: c.applied ? 'var(--text)' : 'var(--muted)' }}>
                        {c.applied ? '+' : '✗ +'}
                        {c.value} from {c.source}
                        {c.note ? ` — ${c.note}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </details>

      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 13 }}>
          Raw D&amp;D Beyond JSON
        </summary>
        <div className="flex-row" style={{ margin: '6px 0' }}>
          <button
            className="btn btn-sm"
            onClick={() => navigator.clipboard?.writeText(JSON.stringify(char.raw, null, 2))}
          >
            Copy JSON
          </button>
          <span className="muted" style={{ fontSize: 11 }}>
            the exact response from character-service
          </span>
        </div>
        <pre
          style={{
            maxHeight: 320,
            overflow: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: 8,
            fontSize: 11,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {JSON.stringify(char.raw, null, 2)}
        </pre>
      </details>

      <p className="muted italic" style={{ fontSize: 12, marginTop: 12 }}>
        Final AC and exact max HP depend on armor/feats and aren't computed here — open the full
        sheet for those. Max HP is estimated from base HP + CON per level.
      </p>

      <div className="flex-row" style={{ marginTop: 12 }}>
        <button className="btn btn-accent" onClick={importToCard} title="Copy these stats onto the roster card">
          ⬇ Import to card
        </button>
        <span className="spacer" />
        {href && (
          <a className="btn" href={href} target="_blank" rel="noreferrer">
            Open on D&amp;D Beyond ↗
          </a>
        )}
      </div>
    </div>
  )
}

/** Fetches the DDB character JSON via the /ddb-api proxy and renders a native sheet. */
export const ProxyNativeProvider: CharacterDetailProvider = {
  id: 'proxy',
  label: 'D&D Beyond (native)',
  description: 'Fetches the character JSON through the local proxy and renders the stats here.',
  canRender: (player) => !!ddbId(player),
  render: (player) => <NativeSheet player={player} />,
}
