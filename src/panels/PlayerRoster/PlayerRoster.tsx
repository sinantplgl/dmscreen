import { useState } from 'react'
import './PlayerRoster.css'
import { useStore } from '../../store/store'
import type { Player } from '../../types'
import { SwordsIcon, WarningIcon } from '../../components/icons'
import { ddbId, fetchRendered } from './helpers'
import { PlayerSheetCard } from './SheetCard'
import { CobaltModal, EditModal } from './modals'

export function PlayerRoster({
  config,
  onConfig,
}: {
  config?: Record<string, unknown>
  onConfig: (c: Record<string, unknown>) => void
}) {
  const allPlayers = useStore((s) => s.players)
  const parties = useStore((s) => s.parties)
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
      await refreshOne(targets[i])
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
