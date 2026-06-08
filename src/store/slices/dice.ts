import type { StateCreator } from 'zustand'
import type { DiceRoll, RollResult } from '../../types'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

function formatPool(dice: number[], modifier: number, times: number): string {
  const counts = new Map<number, number>()
  for (const d of dice) counts.set(d, (counts.get(d) ?? 0) + 1)
  const terms = [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([sides, n]) => `${n}d${sides}`)
  let expr = terms.join(' + ')
  if (modifier > 0) expr += ` + ${modifier}`
  else if (modifier < 0) expr += ` − ${-modifier}`
  if (times > 1) expr += ` ×${times}`
  return expr
}

export interface DiceActions {
  rollPool: (dice: number[], modifier: number, times: number) => void
  clearDice: () => void
}

export const createDiceSlice: Slice<DiceActions> = (set) => ({
  rollPool: (dice, modifier, times) =>
    set((s) => {
      if (dice.length === 0) return s
      const reps = Math.max(1, Math.min(times, 50))
      const results: RollResult[] = []
      for (let i = 0; i < reps; i++) {
        const rolls = dice.map((d) => Math.floor(Math.random() * d) + 1)
        const total = rolls.reduce((a, b) => a + b, 0) + modifier
        results.push({ rolls, total })
      }
      const roll: DiceRoll = {
        id: uid('roll'),
        expr: formatPool(dice, modifier, reps),
        dice,
        modifier,
        results,
      }
      return { diceHistory: [roll, ...s.diceHistory].slice(0, 30) }
    }),

  clearDice: () => set({ diceHistory: [] }),
})
