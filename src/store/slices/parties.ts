import type { StateCreator } from 'zustand'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export interface PartyActions {
  addParty: (name?: string) => string
  renameParty: (id: string, name: string) => void
  deleteParty: (id: string) => void
  setActiveParty: (id: string) => void
}

export const createPartySlice: Slice<PartyActions> = (set) => ({
  addParty: (name) => {
    const id = uid('party')
    set((s) => ({
      parties: [...s.parties, { id, name: name?.trim() || `Party ${s.parties.length + 1}` }],
      activePartyId: id,
    }))
    return id
  },

  renameParty: (id, name) =>
    set((s) => ({ parties: s.parties.map((p) => (p.id === id ? { ...p, name } : p)) })),

  deleteParty: (id) =>
    set((s) => {
      if (s.parties.length <= 1) return s
      const parties = s.parties.filter((p) => p.id !== id)
      const activePartyId = s.activePartyId === id ? parties[0].id : s.activePartyId
      return { parties, activePartyId, players: s.players.filter((p) => p.partyId !== id) }
    }),

  setActiveParty: (id) => set({ activePartyId: id }),
})
