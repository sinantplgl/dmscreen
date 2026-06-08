import type { StateCreator } from 'zustand'
import type { Column, PanelType, Tab } from '../../types'
import { uid } from '../../lib/dnd'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export function mapTabs(tabs: Tab[], fn: (t: Tab) => Tab): Tab[] {
  return tabs.map(fn)
}
export function mapTab(tabs: Tab[], tabId: string, fn: (t: Tab) => Tab): Tab[] {
  return tabs.map((t) => (t.id === tabId ? fn(t) : t))
}
export function mapColumns(tab: Tab, fn: (c: Column) => Column): Tab {
  return { ...tab, columns: tab.columns.map(fn) }
}

export interface LayoutActions {
  setActiveTab: (id: string) => void
  addTab: () => void
  renameTab: (id: string, name: string) => void
  deleteTab: (id: string) => void
  moveTab: (id: string, toIndex: number) => void
  addColumn: (tabId: string) => void
  removeColumn: (tabId: string, colId: string) => void
  setColumnWidth: (tabId: string, colId: string, width: number) => void
  addPanel: (tabId: string, colId: string, type: PanelType) => void
  removePanel: (panelId: string) => void
  movePanel: (panelId: string, toTabId: string, toColId: string, toIndex: number) => void
  updatePanelConfig: (panelId: string, config: Record<string, unknown>) => void
  setPanelHeight: (panelId: string, height: number | undefined) => void
}

export const createLayoutSlice: Slice<LayoutActions> = (set) => ({
  setActiveTab: (id) => set({ activeTabId: id }),

  addTab: () =>
    set((s) => {
      const id = uid('tab')
      const tab: Tab = {
        id,
        name: `Tab ${s.tabs.length + 1}`,
        columns: [{ id: uid('col'), width: 1, panels: [] }],
      }
      return { tabs: [...s.tabs, tab], activeTabId: id }
    }),

  renameTab: (id, name) =>
    set((s) => ({ tabs: mapTab(s.tabs, id, (t) => ({ ...t, name })) })),

  deleteTab: (id) =>
    set((s) => {
      if (s.tabs.length <= 1) return s
      const tabs = s.tabs.filter((t) => t.id !== id)
      const activeTabId = s.activeTabId === id ? tabs[0].id : s.activeTabId
      return { tabs, activeTabId }
    }),

  moveTab: (id, toIndex) =>
    set((s) => {
      const from = s.tabs.findIndex((t) => t.id === id)
      if (from < 0) return s
      const tabs = [...s.tabs]
      const [moved] = tabs.splice(from, 1)
      tabs.splice(Math.max(0, Math.min(toIndex, tabs.length)), 0, moved)
      return { tabs }
    }),

  addColumn: (tabId) =>
    set((s) => ({
      tabs: mapTab(s.tabs, tabId, (t) => ({
        ...t,
        columns: [...t.columns, { id: uid('col'), width: 1, panels: [] }],
      })),
    })),

  removeColumn: (tabId, colId) =>
    set((s) => ({
      tabs: mapTab(s.tabs, tabId, (t) =>
        t.columns.length <= 1 ? t : { ...t, columns: t.columns.filter((c) => c.id !== colId) },
      ),
    })),

  setColumnWidth: (tabId, colId, width) =>
    set((s) => ({
      tabs: mapTab(s.tabs, tabId, (t) =>
        mapColumns(t, (c) => (c.id === colId ? { ...c, width: Math.max(0.2, width) } : c)),
      ),
    })),

  addPanel: (tabId, colId, type) =>
    set((s) => ({
      tabs: mapTab(s.tabs, tabId, (t) =>
        mapColumns(t, (c) =>
          c.id === colId ? { ...c, panels: [...c.panels, { id: uid('p'), type }] } : c,
        ),
      ),
    })),

  removePanel: (panelId) =>
    set((s) => ({
      tabs: mapTabs(s.tabs, (t) =>
        mapColumns(t, (c) => ({ ...c, panels: c.panels.filter((p) => p.id !== panelId) })),
      ),
    })),

  movePanel: (panelId, toTabId, toColId, toIndex) =>
    set((s) => {
      let moved: Column['panels'][number] | undefined
      let tabs = mapTabs(s.tabs, (t) =>
        mapColumns(t, (c) => {
          const idx = c.panels.findIndex((p) => p.id === panelId)
          if (idx < 0) return c
          moved = c.panels[idx]
          return { ...c, panels: c.panels.filter((p) => p.id !== panelId) }
        }),
      )
      if (!moved) return s
      tabs = mapTab(tabs, toTabId, (t) =>
        mapColumns(t, (c) => {
          if (c.id !== toColId) return c
          const panels = [...c.panels]
          panels.splice(Math.max(0, Math.min(toIndex, panels.length)), 0, moved!)
          return { ...c, panels }
        }),
      )
      return { tabs }
    }),

  updatePanelConfig: (panelId, config) =>
    set((s) => ({
      tabs: mapTabs(s.tabs, (t) =>
        mapColumns(t, (c) => ({
          ...c,
          panels: c.panels.map((p) =>
            p.id === panelId ? { ...p, config: { ...p.config, ...config } } : p,
          ),
        })),
      ),
    })),

  setPanelHeight: (panelId, height) =>
    set((s) => ({
      tabs: mapTabs(s.tabs, (t) =>
        mapColumns(t, (c) => ({
          ...c,
          panels: c.panels.map((p) => (p.id === panelId ? { ...p, height } : p)),
        })),
      ),
    })),
})
