import type { StateCreator } from 'zustand'
import type { CharacterSheet, Player } from '../../types'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export interface PlayerActions {
  addPlayer: (partyId?: string) => void
  updatePlayer: (id: string, patch: Partial<Player>) => void
  removePlayer: (id: string) => void
  setPlayerSheet: (id: string, sheet: CharacterSheet) => void
}

export const createPlayerSlice: Slice<PlayerActions> = (set) => ({
  addPlayer: (partyId) =>
    set((s) => ({
      players: [
        ...s.players,
        {
          id: uid('pl'),
          partyId: partyId ?? s.activePartyId,
          name: 'New Character',
          className: 'Class',
          level: 1,
          abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          maxHp: 10,
          ac: 10,
        },
      ],
    })),

  updatePlayer: (id, patch) =>
    set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

  removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

  setPlayerSheet: (id, sheet) =>
    set((s) => ({
      players: s.players.map((p) => {
        if (p.id !== id) return p
        const ab = sheet.abilities
        const n = (k: string, fb: number) =>
          ab[k] && typeof ab[k].score === 'number' ? ab[k].score : fb
        return {
          ...p,
          sheet,
          name: sheet.name || p.name,
          className: sheet.classSummary || p.className,
          level: sheet.level ?? p.level,
          portraitUrl: sheet.avatarUrl || p.portraitUrl,
          ac: sheet.ac ?? p.ac,
          maxHp: sheet.hpMax ?? p.maxHp,
          passivePerception: sheet.passivePerception ?? p.passivePerception,
          abilities: {
            str: n('STR', p.abilities.str),
            dex: n('DEX', p.abilities.dex),
            con: n('CON', p.abilities.con),
            int: n('INT', p.abilities.int),
            wis: n('WIS', p.abilities.wis),
            cha: n('CHA', p.abilities.cha),
          },
        }
      }),
    })),
})
