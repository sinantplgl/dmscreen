import type { StateCreator } from 'zustand'
import type { Creature } from '../../types'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export interface BestiaryActions {
  addCreature: () => string
  addCreatureFrom: (data: Partial<Creature>) => string
  updateCreature: (id: string, patch: Partial<Creature>) => void
  removeCreature: (id: string) => void
}

export const createBestiarySlice: Slice<BestiaryActions> = (set) => ({
  addCreature: () => {
    const id = uid('cr')
    set((s) => ({
      bestiary: [
        {
          id,
          name: 'New Creature',
          meta: 'Medium humanoid, unaligned',
          ac: '10',
          hp: '10 (3d8)',
          speed: '30 ft.',
          abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          cr: '0 (10 XP)',
          traits: [],
          actions: [],
        },
        ...s.bestiary,
      ],
    }))
    return id
  },

  addCreatureFrom: (data) => {
    const id = uid('cr')
    set((s) => ({
      bestiary: [
        {
          id,
          name: 'New Creature',
          meta: 'Medium humanoid, unaligned',
          ac: '10',
          hp: '10 (3d8)',
          speed: '30 ft.',
          abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          cr: '0 (10 XP)',
          traits: [],
          actions: [],
          ...data,
        },
        ...s.bestiary,
      ],
    }))
    return id
  },

  updateCreature: (id, patch) =>
    set((s) => ({ bestiary: s.bestiary.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  removeCreature: (id) => set((s) => ({ bestiary: s.bestiary.filter((c) => c.id !== id) })),
})
