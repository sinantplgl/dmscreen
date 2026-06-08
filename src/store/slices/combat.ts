import type { StateCreator } from 'zustand'
import type { Combatant } from '../../types'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export function numberDuplicates(
  combatants: Combatant[],
  name: string,
  isPlayer: boolean,
): { combatants: Combatant[]; dupNumber?: number } {
  if (isPlayer) return { combatants }
  const sameName = combatants.filter((c) => !c.isPlayer && c.name === name)
  if (sameName.length === 0) return { combatants }
  let counter = Math.max(0, ...sameName.map((c) => c.dupNumber ?? 0))
  const renumbered = combatants.map((c) =>
    !c.isPlayer && c.name === name && !c.dupNumber ? { ...c, dupNumber: (counter += 1) } : c,
  )
  return { combatants: renumbered, dupNumber: counter + 1 }
}

export interface CombatActions {
  nextTurn: () => void
  prevTurn: () => void
  setRound: (n: number) => void
  addCombatant: (c: Partial<Combatant>) => void
  removeCombatant: (id: string) => void
  updateCombatant: (id: string, patch: Partial<Combatant>) => void
  adjustHp: (id: string, delta: number) => void
  toggleCondition: (id: string, cond: string) => void
  reorderCombatant: (fromId: string, toId: string) => void
  sortByInit: () => void
  sendCreatureToCombat: (creatureId: string) => void
}

export const createCombatSlice: Slice<CombatActions> = (set) => ({
  nextTurn: () =>
    set((s) => {
      if (s.combatants.length === 0) return s
      const next = (s.activeTurn + 1) % s.combatants.length
      return { activeTurn: next, round: next === 0 ? s.round + 1 : s.round }
    }),

  prevTurn: () =>
    set((s) => {
      if (s.combatants.length === 0) return s
      else if (s.activeTurn === 0 && s.round === 1) return s
      const prev = (s.activeTurn - 1 + s.combatants.length) % s.combatants.length
      return { activeTurn: prev, round: Math.max(1, prev === s.combatants.length - 1 ? s.round - 1 : s.round) }
    }),

  setRound: (n) => set({ round: Math.max(1, n) }),

  addCombatant: (c) =>
    set((s) => {
      const hp = c.maxHp ?? c.hp ?? 10
      const isPlayer = c.isPlayer ?? false
      const numbered = numberDuplicates(s.combatants, c.name || 'New Combatant', isPlayer)
      const combatant: Combatant = {
        id: uid('cb'),
        name: c.name || 'New Combatant',
        type: c.type || 'Custom',
        init: c.init ?? 10,
        hp: c.hp ?? hp,
        maxHp: c.maxHp ?? hp,
        ac: c.ac ?? 10,
        conditions: c.conditions ?? [],
        isPlayer,
        dupNumber: numbered.dupNumber,
        portraitUrl: c.portraitUrl,
        creatureId: c.creatureId,
      }
      const combatants = [...numbered.combatants, combatant].sort((a, b) => b.init - a.init)
      return { combatants }
    }),

  removeCombatant: (id) =>
    set((s) => {
      const combatants = s.combatants.filter((c) => c.id !== id)
      const activeTurn = Math.min(s.activeTurn, Math.max(0, combatants.length - 1))
      return { combatants, activeTurn }
    }),

  updateCombatant: (id, patch) =>
    set((s) => ({ combatants: s.combatants.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  adjustHp: (id, delta) =>
    set((s) => ({
      combatants: s.combatants.map((c) =>
        c.id === id ? { ...c, hp: Math.max(0, Math.min(c.maxHp, c.hp + delta)) } : c,
      ),
    })),

  toggleCondition: (id, cond) =>
    set((s) => ({
      combatants: s.combatants.map((c) => {
        if (c.id !== id) return c
        const has = c.conditions.includes(cond)
        return {
          ...c,
          conditions: has ? c.conditions.filter((x) => x !== cond) : [...c.conditions, cond],
        }
      }),
    })),

  reorderCombatant: (fromId, toId) =>
    set((s) => {
      if (fromId === toId) return s
      const from = s.combatants.findIndex((c) => c.id === fromId)
      const to = s.combatants.findIndex((c) => c.id === toId)
      if (from < 0 || to < 0) return s
      const combatants = [...s.combatants]
      const [moved] = combatants.splice(from, 1)
      combatants.splice(to, 0, moved)
      return { combatants }
    }),

  sortByInit: () =>
    set((s) => ({ combatants: [...s.combatants].sort((a, b) => b.init - a.init), activeTurn: 0 })),

  sendCreatureToCombat: (creatureId) =>
    set((s) => {
      const cr = s.bestiary.find((x) => x.id === creatureId)
      if (!cr) return s
      const maxHp = parseInt(cr.hp, 10) || 10
      const ac = parseInt(cr.ac, 10) || 10
      const numbered = numberDuplicates(s.combatants, cr.name, false)
      const combatant: Combatant = {
        id: uid('cb'),
        name: cr.name,
        type: cr.meta.split(',')[0] || 'Monster',
        init: 10,
        hp: maxHp,
        maxHp,
        ac,
        conditions: [],
        isPlayer: false,
        dupNumber: numbered.dupNumber,
        portraitUrl: cr.imageUrl,
        portraitFlip: cr.imageFlip,
        creatureId,
      }
      return { combatants: [...numbered.combatants, combatant].sort((a, b) => b.init - a.init) }
    }),
})
