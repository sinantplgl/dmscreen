import type { StateCreator } from 'zustand'
import type { Item } from '../../types'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export interface ItemActions {
  addItem: (data?: Partial<Item>) => string
  updateItem: (id: string, patch: Partial<Item>) => void
  removeItem: (id: string) => void
  copyItem: (id: string) => string
}

export const createItemSlice: Slice<ItemActions> = (set) => ({
  addItem: (data) => {
    const id = uid('itm')
    set((s) => ({
      items: [
        {
          id,
          name: 'New Item',
          itemType: 'Wondrous Item',
          rarity: 'uncommon',
          description: '',
          ...data,
        },
        ...s.items,
      ],
    }))
    return id
  },

  updateItem: (id, patch) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),

  removeItem: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),

  copyItem: (id) => {
    const newId = uid('itm')
    set((s) => {
      const src = s.items.find((it) => it.id === id)
      if (!src) return s
      return { items: [{ ...src, id: newId, name: `${src.name} (copy)` }, ...s.items] }
    })
    return newId
  },
})
