import type { StateCreator } from 'zustand'
import type { RefItem } from '../../types'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export interface ReferenceActions {
  addRefItem: (kind: 'table' | 'note' | 'image') => string
  updateRefItem: (id: string, patch: Partial<RefItem>) => void
  removeRefItem: (id: string) => void
  copyRefItem: (id: string) => string
}

export const createReferenceSlice: Slice<ReferenceActions> = (set) => ({
  addRefItem: (kind) => {
    const id = uid('ref')
    const item: RefItem =
      kind === 'table'
        ? { id, kind: 'table', title: 'New Table', columns: ['Column A', 'Column B'], rows: [['', '']] }
        : kind === 'note'
          ? { id, kind: 'note', title: 'New Note', body: '' }
          : { id, kind: 'image', title: 'New Image', url: '', caption: '' }
    set((s) => ({ tables: [...s.tables, item] }))
    return id
  },

  updateRefItem: (id, patch) =>
    set((s) => ({
      tables: s.tables.map((it) => (it.id === id ? (Object.assign({}, it, patch) as RefItem) : it)),
    })),

  removeRefItem: (id) => set((s) => ({ tables: s.tables.filter((it) => it.id !== id) })),

  copyRefItem: (id) => {
    const newId = uid('ref')
    set((s) => {
      const src = s.tables.find((it) => it.id === id)
      if (!src) return s
      const title = `${src.title} (copy)`
      const copy: RefItem =
        'rows' in src
          ? { ...src, id: newId, title, builtin: false, rows: src.rows.map((r) => [...r]), columns: [...src.columns] }
          : { ...src, id: newId, title, builtin: false }
      return { tables: [...s.tables, copy] }
    })
    return newId
  },
})
