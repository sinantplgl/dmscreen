import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppData,
  CampaignState,
  CharacterSheet,
  Column,
  Combatant,
  Creature,
  DiceRoll,
  RollResult,
  PanelType,
  Party,
  Player,
  RefItem,
  SessionNode,
  Tab,
} from '../types'
import { makeDefaultData, makeFreshCampaign } from './defaultData'
import { uid } from '../lib/dnd'

const STORAGE_KEY = 'dm-screen-v1'

// ── Campaigns ────────────────────────────────────────────────────────────────
/** Pull the active campaign's slice out of the live store state. Used to stash
 *  the current campaign before switching to (or hydrating) another one. */
function snapshotCampaign(s: CampaignState): CampaignState {
  return {
    tabs: s.tabs,
    activeTabId: s.activeTabId,
    combatants: s.combatants,
    round: s.round,
    activeTurn: s.activeTurn,
    parties: s.parties,
    activePartyId: s.activePartyId,
    players: s.players,
    sessionNodes: s.sessionNodes,
    diceHistory: s.diceHistory,
  }
}

// ── Dice ────────────────────────────────────────────────────────────────────────
/** Builds a readable label for a pool, e.g. [6,6,8] +2 ×5 → "2d6 + 1d8 + 2 ×5". */
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

// ── Combatant duplicate numbering ───────────────────────────────────────────────
/**
 * When a non-player combatant shares a name with existing ones, number them so
 * five "Giant Rat"s become #1…#5 (shown as a grayed badge, names left untouched).
 * Returns the (possibly renumbered) existing list and the number for the new one.
 */
function numberDuplicates(
  combatants: Combatant[],
  name: string,
  isPlayer: boolean,
): { combatants: Combatant[]; dupNumber?: number } {
  if (isPlayer) return { combatants }
  const sameName = combatants.filter((c) => !c.isPlayer && c.name === name)
  if (sameName.length === 0) return { combatants }
  let counter = Math.max(0, ...sameName.map((c) => c.dupNumber ?? 0))
  // Number any not-yet-numbered duplicates (e.g. the lone first "Giant Rat").
  const renumbered = combatants.map((c) =>
    !c.isPlayer && c.name === name && !c.dupNumber ? { ...c, dupNumber: (counter += 1) } : c,
  )
  return { combatants: renumbered, dupNumber: counter + 1 }
}

// ── Session-tree helpers (flat array, parentId + order) ──────────────────────────
/** Children of a node (or top-level when parentId is undefined), ordered. */
function childrenOf(nodes: SessionNode[], parentId: string | undefined): SessionNode[] {
  return nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order)
}
/** Re-index one sibling group's `order` to 0..n-1; returns a new node array. */
function normalizeOrders(nodes: SessionNode[], parentId: string | undefined): SessionNode[] {
  const ordered = childrenOf(nodes, parentId)
  const orderById = new Map(ordered.map((n, i) => [n.id, i]))
  return nodes.map((n) => (orderById.has(n.id) ? { ...n, order: orderById.get(n.id)! } : n))
}
/** Swap a node's order with its previous (-1) or next (+1) sibling. */
function swapSibling(nodes: SessionNode[], id: string, dir: -1 | 1): SessionNode[] {
  const node = nodes.find((n) => n.id === id)
  if (!node) return nodes
  const siblings = childrenOf(nodes, node.parentId)
  const idx = siblings.findIndex((n) => n.id === id)
  const swapIdx = idx + dir
  if (swapIdx < 0 || swapIdx >= siblings.length) return nodes
  const a = siblings[idx]
  const b = siblings[swapIdx]
  return nodes.map((n) =>
    n.id === a.id ? { ...n, order: b.order } : n.id === b.id ? { ...n, order: a.order } : n,
  )
}
/** All descendant ids of a node (not including the node itself). */
function descendantIds(nodes: SessionNode[], id: string): string[] {
  const out: string[] = []
  const stack = [id]
  while (stack.length) {
    const pid = stack.pop()!
    for (const n of nodes) {
      if (n.parentId === pid) {
        out.push(n.id)
        stack.push(n.id)
      }
    }
  }
  return out
}

// ── Immutable layout helpers ──────────────────────────────────────────────────
function mapTabs(tabs: Tab[], fn: (t: Tab) => Tab): Tab[] {
  return tabs.map(fn)
}
function mapTab(tabs: Tab[], tabId: string, fn: (t: Tab) => Tab): Tab[] {
  return tabs.map((t) => (t.id === tabId ? fn(t) : t))
}
function mapColumns(tab: Tab, fn: (c: Column) => Column): Tab {
  return { ...tab, columns: tab.columns.map(fn) }
}

interface Actions {
  // campaigns
  addCampaign: (name?: string) => string
  renameCampaign: (id: string, name: string) => void
  deleteCampaign: (id: string) => void
  switchCampaign: (id: string) => void

  // layout
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

  // combat
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

  // parties
  addParty: (name?: string) => string
  renameParty: (id: string, name: string) => void
  deleteParty: (id: string) => void
  setActiveParty: (id: string) => void

  // players
  addPlayer: (partyId?: string) => void
  updatePlayer: (id: string, patch: Partial<Player>) => void
  removePlayer: (id: string) => void
  setPlayerSheet: (id: string, sheet: CharacterSheet) => void

  // bestiary
  addCreature: () => string
  addCreatureFrom: (data: Partial<Creature>) => string
  updateCreature: (id: string, patch: Partial<Creature>) => void
  removeCreature: (id: string) => void

  // reference library (shared pool — panels pick which items to display)
  addRefItem: (kind: 'table' | 'note' | 'image') => string
  updateRefItem: (id: string, patch: Partial<RefItem>) => void
  removeRefItem: (id: string) => void
  copyRefItem: (id: string) => string

  // session tracker (nested tree)
  addNode: (parentId: string | undefined, type: string) => string
  updateNode: (id: string, patch: Partial<SessionNode>) => void
  removeNode: (id: string) => void
  moveNodeUp: (id: string) => void
  moveNodeDown: (id: string) => void
  indentNode: (id: string) => void
  outdentNode: (id: string) => void

  // dice
  rollPool: (dice: number[], modifier: number, times: number) => void
  clearDice: () => void

  // meta
  setDdbCobalt: (cobalt: string) => void
  exportData: () => string
  importData: (data: AppData) => void
  resetData: () => void
}

export type Store = AppData & Actions

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...makeDefaultData(),

      // ── campaigns ─────────────────────────────────────────────────────────
      // The active campaign's data lives directly on the store (tabs, players,
      // combat, …). Inactive campaigns are stashed in `inactiveCampaigns`.
      // Switching stashes the current slice and hydrates the target's.
      addCampaign: (name) => {
        const id = uid('camp')
        set((s) => ({
          ...makeFreshCampaign(),
          campaigns: [...s.campaigns, { id, name: name?.trim() || `Campaign ${s.campaigns.length + 1}` }],
          activeCampaignId: id,
          inactiveCampaigns: { ...s.inactiveCampaigns, [s.activeCampaignId]: snapshotCampaign(s) },
        }))
        return id
      },

      renameCampaign: (id, name) =>
        set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, name } : c)) })),

      deleteCampaign: (id) =>
        set((s) => {
          if (s.campaigns.length <= 1) return s // keep at least one campaign
          const campaigns = s.campaigns.filter((c) => c.id !== id)
          const inactiveCampaigns = { ...s.inactiveCampaigns }
          delete inactiveCampaigns[id]
          if (id !== s.activeCampaignId) return { campaigns, inactiveCampaigns }
          // Deleting the active campaign — hydrate another in its place.
          const nextId = campaigns[0].id
          const target = inactiveCampaigns[nextId] ?? makeFreshCampaign()
          delete inactiveCampaigns[nextId]
          return { ...target, campaigns, activeCampaignId: nextId, inactiveCampaigns }
        }),

      switchCampaign: (id) =>
        set((s) => {
          if (id === s.activeCampaignId) return s
          const target = s.inactiveCampaigns[id]
          if (!target) return s // unknown campaign id
          const inactiveCampaigns = { ...s.inactiveCampaigns, [s.activeCampaignId]: snapshotCampaign(s) }
          delete inactiveCampaigns[id]
          return { ...target, activeCampaignId: id, inactiveCampaigns }
        }),

      // ── layout ──────────────────────────────────────────────────────────────
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
          if (s.tabs.length <= 1) return s // never delete the last tab
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
          // find + detach the panel from wherever it currently lives
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

      // ── combat ────────────────────────────────────────────────────────────
      nextTurn: () =>
        set((s) => {
          if (s.combatants.length === 0) return s
          const next = (s.activeTurn + 1) % s.combatants.length
          return { activeTurn: next, round: next === 0 ? s.round + 1 : s.round }
        }),

      prevTurn: () =>
        set((s) => {
          if (s.combatants.length === 0) return s
          const prev = (s.activeTurn - 1 + s.combatants.length) % s.combatants.length
          return { activeTurn: prev }
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

      // ── parties ─────────────────────────────────────────────────────────────
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
          if (s.parties.length <= 1) return s // keep at least one party
          const parties = s.parties.filter((p) => p.id !== id)
          const activePartyId = s.activePartyId === id ? parties[0].id : s.activePartyId
          // also remove the players that belonged to the deleted party
          return { parties, activePartyId, players: s.players.filter((p) => p.partyId !== id) }
        }),

      setActiveParty: (id) => set({ activePartyId: id }),

      // ── players ─────────────────────────────────────────────────────────────
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

      // Apply a DDB-rendered snapshot: store it + sync the card's base fields.
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

      // ── bestiary ──────────────────────────────────────────────────────────
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

      // Create a creature from imported/partial data, filling any gaps with the
      // same blank defaults addCreature uses. Returns the new id.
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
              ...data
            },
            ...s.bestiary,
          ],
        }))
        return id
      },

      updateCreature: (id, patch) =>
        set((s) => ({ bestiary: s.bestiary.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

      removeCreature: (id) => set((s) => ({ bestiary: s.bestiary.filter((c) => c.id !== id) })),

      // ── reference library ───────────────────────────────────────────────────
      // A single shared pool of reference items. Reference panels each pick which
      // of these to show (and where) — see ReferenceTables. Editing/deleting here
      // affects every panel that displays the item, in every campaign.
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

      // ── session tracker (nested tree) ──────────────────────────────────────
      addNode: (parentId, type) => {
        const id = uid('sn')
        set((s) => {
          const order = childrenOf(s.sessionNodes, parentId).length
          const node: SessionNode = { id, parentId, order, type, title: `New ${type}`, body: '' }
          return { sessionNodes: [...s.sessionNodes, node] }
        })
        return id
      },

      updateNode: (id, patch) =>
        set((s) => ({ sessionNodes: s.sessionNodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),

      removeNode: (id) =>
        set((s) => {
          const node = s.sessionNodes.find((n) => n.id === id)
          const doomed = new Set([id, ...descendantIds(s.sessionNodes, id)])
          const remaining = s.sessionNodes.filter((n) => !doomed.has(n.id))
          return { sessionNodes: normalizeOrders(remaining, node?.parentId) }
        }),

      moveNodeUp: (id) => set((s) => ({ sessionNodes: swapSibling(s.sessionNodes, id, -1) })),
      moveNodeDown: (id) => set((s) => ({ sessionNodes: swapSibling(s.sessionNodes, id, 1) })),

      indentNode: (id) =>
        set((s) => {
          const node = s.sessionNodes.find((n) => n.id === id)
          if (!node) return s
          const siblings = childrenOf(s.sessionNodes, node.parentId)
          const idx = siblings.findIndex((n) => n.id === id)
          if (idx <= 0) return s // nothing to nest under
          const prev = siblings[idx - 1]
          const newOrder = childrenOf(s.sessionNodes, prev.id).length
          const moved = s.sessionNodes.map((n) =>
            n.id === id
              ? { ...n, parentId: prev.id, order: newOrder }
              : n.id === prev.id
                ? { ...n, collapsed: false }
                : n,
          )
          return { sessionNodes: normalizeOrders(moved, node.parentId) }
        }),

      outdentNode: (id) =>
        set((s) => {
          const node = s.sessionNodes.find((n) => n.id === id)
          if (!node || node.parentId === undefined) return s
          const parent = s.sessionNodes.find((n) => n.id === node.parentId)
          if (!parent) return s
          // Insert right after the parent within the grandparent group.
          const moved = s.sessionNodes.map((n) =>
            n.id === id ? { ...n, parentId: parent.parentId, order: parent.order + 0.5 } : n,
          )
          // Renormalize both the old parent group and the new (grandparent) group.
          return { sessionNodes: normalizeOrders(normalizeOrders(moved, parent.parentId), parent.id) }
        }),

      // ── dice ─────────────────────────────────────────────────────────────
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

      // ── meta ─────────────────────────────────────────────────────────────
      setDdbCobalt: (cobalt) => set({ ddbCobalt: cobalt }),

      exportData: () => {
        const s = get()
        const data: AppData = {
          campaigns: s.campaigns,
          activeCampaignId: s.activeCampaignId,
          inactiveCampaigns: s.inactiveCampaigns,
          tabs: s.tabs,
          activeTabId: s.activeTabId,
          combatants: s.combatants,
          round: s.round,
          activeTurn: s.activeTurn,
          parties: s.parties,
          activePartyId: s.activePartyId,
          players: s.players,
          sessionNodes: s.sessionNodes,
          diceHistory: s.diceHistory,
          bestiary: s.bestiary,
          tables: s.tables,
          ddbCobalt: '', // never export the credential
        }
        return JSON.stringify(data, null, 2)
      },

      // Preserve the locally-stored cobalt cookie across import/reset.
      importData: (data) =>
        set((s) => {
          // Tolerate pre-campaign export files: wrap them in a single campaign.
          const campaigns =
            Array.isArray(data.campaigns) && data.campaigns.length > 0
              ? data.campaigns
              : [{ id: 'camp_1', name: 'Imported Campaign' }]
          const activeCampaignId = campaigns.some((c) => c.id === data.activeCampaignId)
            ? data.activeCampaignId
            : campaigns[0].id
          return {
            ...data,
            campaigns,
            activeCampaignId,
            inactiveCampaigns: data.inactiveCampaigns ?? {},
            ddbCobalt: s.ddbCobalt,
          }
        }),

      resetData: () => set((s) => ({ ...makeDefaultData(), ddbCobalt: s.ddbCobalt })),
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      // Persist only data, never the action functions.
      partialize: (s) => ({
        campaigns: s.campaigns,
        activeCampaignId: s.activeCampaignId,
        inactiveCampaigns: s.inactiveCampaigns,
        tabs: s.tabs,
        activeTabId: s.activeTabId,
        combatants: s.combatants,
        round: s.round,
        activeTurn: s.activeTurn,
        parties: s.parties,
        activePartyId: s.activePartyId,
        players: s.players,
        sessionNodes: s.sessionNodes,
        diceHistory: s.diceHistory,
        bestiary: s.bestiary,
        tables: s.tables,
        ddbCobalt: s.ddbCobalt,
      }),
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as Record<string, unknown>
        // v2: pre-parties saves — create a default party and assign all players.
        if (version < 2 || !Array.isArray(state.parties) || state.parties.length === 0) {
          const party: Party = { id: 'party_1', name: 'Main Party' }
          state.parties = [party]
          state.activePartyId = party.id
          state.players = ((state.players as Player[]) ?? []).map((p) => ({
            ...p,
            partyId: p.partyId || party.id,
          }))
        }
        // v3: wrap the flat workspace in a single campaign; drop the retired
        // notes + sessionInfo data and any panels of the removed types.
        if (version < 3 || !Array.isArray(state.campaigns)) {
          const sessionInfo = state.sessionInfo as { campaign?: string } | undefined
          const name = sessionInfo?.campaign?.trim() || 'My Campaign'
          state.campaigns = [{ id: 'camp_1', name }]
          state.activeCampaignId = 'camp_1'
          state.inactiveCampaigns = {}
          delete state.notes
          delete state.sessionInfo
          const removed = new Set(['notes', 'sessionInfo'])
          state.tabs = ((state.tabs as Tab[]) ?? []).map((t) => ({
            ...t,
            columns: (t.columns ?? []).map((c) => ({
              ...c,
              panels: (c.panels ?? []).filter((p) => !removed.has(p.type)),
            })),
          }))
        }
        return state as unknown as AppData
      },
    },
  ),
)
