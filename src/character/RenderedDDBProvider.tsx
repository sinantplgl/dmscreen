import { useCallback, useEffect, useState } from 'react'
import type { CharacterDetailProvider } from './CharacterDetailProvider'
import type { Abilities, Player } from '../types'
import { useStore } from '../store/store'
import { ABILITY_KEYS, ABILITY_LABELS, abilityMod } from '../lib/dnd'

function ddbId(player: Player): string | undefined {
  if (player.ddbCharacterId) return player.ddbCharacterId
  const m = player.ddbUrl?.match(/characters\/(\d+)/)
  return m ? m[1] : undefined
}

interface Rendered {
  name: string
  summary?: string
  avatarUrl?: string
  ac: number | null
  hpCurrent: number | null
  hpMax: number | null
  abilities: Record<string, number>
  passivePerception: number | null
  passiveInvestigation: number | null
  passiveInsight: number | null
}

function toAbilities(scraped: Record<string, number>): Abilities {
  const get = (k: string, fallback: number) => (typeof scraped[k] === 'number' ? scraped[k] : fallback)
  return {
    str: get('STR', 10),
    dex: get('DEX', 10),
    con: get('CON', 10),
    int: get('INT', 10),
    wis: get('WIS', 10),
    cha: get('CHA', 10),
  }
}

function RenderedSheet({ player }: { player: Player }) {
  const cobalt = useStore((s) => s.ddbCobalt)
  const updatePlayer = useStore((s) => s.updatePlayer)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [error, setError] = useState('')
  const [data, setData] = useState<Rendered | null>(null)

  const id = ddbId(player)
  const href = player.ddbUrl || (id ? `https://www.dndbeyond.com/characters/${id}` : undefined)

  const fetchRendered = useCallback(() => {
    if (!id) {
      setState('error')
      setError('No D&D Beyond character link set. Add one via the ✎ edit button on the card.')
      return
    }
    setState('loading')
    fetch(`/ddb-api/rendered/${id}`, { headers: cobalt ? { 'x-cobalt': cobalt } : undefined })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}))
        if (!r.ok || json.success === false) throw new Error(json.message || `Request failed (${r.status})`)
        return json.data as Rendered
      })
      .then((d) => {
        setData(d)
        setState('ok')
      })
      .catch((e: Error) => {
        setError(e.message)
        setState('error')
      })
  }, [id, cobalt])

  useEffect(() => {
    fetchRendered()
  }, [fetchRendered])

  const importToCard = () => {
    if (!data) return
    updatePlayer(player.id, {
      name: data.name || player.name,
      portraitUrl: data.avatarUrl || player.portraitUrl,
      abilities: toAbilities(data.abilities),
      maxHp: data.hpMax ?? player.maxHp,
      ac: data.ac ?? player.ac,
      passivePerception: data.passivePerception ?? undefined,
    })
  }

  const Refresh = (
    <button className="btn" onClick={fetchRendered} disabled={state === 'loading'} title="Re-scrape from D&D Beyond">
      ⟳ Refresh
    </button>
  )

  if (state === 'loading')
    return (
      <div style={{ padding: 24 }} className="muted">
        Rendering the sheet on D&amp;D Beyond (a headless browser is computing the exact numbers)…
      </div>
    )

  if (state === 'error')
    return (
      <div style={{ padding: 24 }}>
        <p className="tag tag-red" style={{ padding: '6px 10px', display: 'block', marginBottom: 12 }}>
          {error}
        </p>
        <div className="flex-row">
          {Refresh}
          {href && (
            <a className="btn" href={href} target="_blank" rel="noreferrer">
              Open on D&amp;D Beyond ↗
            </a>
          )}
        </div>
      </div>
    )

  if (!data) return null
  const ab = toAbilities(data.abilities)

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="flex-row" style={{ alignItems: 'flex-start', gap: 16 }}>
        {data.avatarUrl && (
          <img
            src={data.avatarUrl}
            alt={data.name}
            style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--accent2)' }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: 'var(--gold)' }}>{data.name}</div>
          {data.summary && <div className="muted italic">{data.summary}</div>}
          <div className="flex-row flex-wrap" style={{ marginTop: 8, gap: 8 }}>
            {data.ac != null && <span className="tag tag-blue">AC {data.ac}</span>}
            {data.hpMax != null && (
              <span className="tag tag-green">
                HP {data.hpCurrent ?? '—'} / {data.hpMax}
              </span>
            )}
            {data.passivePerception != null && (
              <span className="tag tag-gold">Passive Perception {data.passivePerception}</span>
            )}
          </div>
        </div>
        {Refresh}
      </div>

      <hr className="divider" />
      <div className="ability-row" style={{ maxWidth: 420 }}>
        {ABILITY_KEYS.map((k) => (
          <div className="ability-box" key={k}>
            <div className="lbl">{ABILITY_LABELS[k]}</div>
            <div className="score">{ab[k]}</div>
            <div className="mod">{abilityMod(ab[k])}</div>
          </div>
        ))}
      </div>

      <hr className="divider" />
      <div className="flex-row flex-wrap" style={{ gap: 14 }}>
        <span>
          <span className="section-label">Passive Investigation</span> {data.passiveInvestigation ?? '—'}
        </span>
        <span>
          <span className="section-label">Passive Insight</span> {data.passiveInsight ?? '—'}
        </span>
      </div>

      <p className="muted italic" style={{ fontSize: 12, marginTop: 12 }}>
        These are D&amp;D Beyond's own computed values (read from the rendered sheet) — AC, HP and
        ability scores are exactly what the site shows.
      </p>

      <div className="flex-row" style={{ marginTop: 12 }}>
        <button className="btn btn-accent" onClick={importToCard} title="Copy these exact stats onto the roster card">
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

/** DDB-exact view: renders the sheet in a headless browser and reads the computed numbers. */
export const RenderedDDBProvider: CharacterDetailProvider = {
  id: 'rendered',
  label: 'D&D Beyond (exact / rendered)',
  description: "Renders the sheet in a headless browser and reads DDB's own computed AC/HP/stats.",
  canRender: (player) => !!ddbId(player),
  render: (player) => <RenderedSheet player={player} />,
}
