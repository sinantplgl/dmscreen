import type { StateCreator } from 'zustand'
import type { CampaignState, SessionNode } from '../../types'
import { uid } from '../../lib/dnd'
import { NODE_TYPE_PRESETS } from '../../panels/SessionTracker/helpers'
import type { Store } from '../store'

type Slice<T> = StateCreator<Store, [['zustand/persist', unknown]], [], T>

export function childrenOf(nodes: SessionNode[], parentId: string | undefined): SessionNode[] {
  return nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order)
}

export function normalizeOrders(nodes: SessionNode[], parentId: string | undefined): SessionNode[] {
  const ordered = childrenOf(nodes, parentId)
  const orderById = new Map(ordered.map((n, i) => [n.id, i]))
  return nodes.map((n) => (orderById.has(n.id) ? { ...n, order: orderById.get(n.id)! } : n))
}

export function swapSibling(nodes: SessionNode[], id: string, dir: -1 | 1): SessionNode[] {
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

export function descendantIds(nodes: SessionNode[], id: string): string[] {
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

export interface SessionActions {
  addNode: (parentId: string | undefined, type: string) => string
  addAlias: (parentId: string | undefined, refId: string) => string
  updateNode: (id: string, patch: Partial<SessionNode>) => void
  removeNode: (id: string) => void
  moveNodeUp: (id: string) => void
  moveNodeDown: (id: string) => void
  indentNode: (id: string) => void
  outdentNode: (id: string) => void
  /** Reparent `id` under `newParentId`, placing it before `beforeId` (append if absent). */
  moveNode: (id: string, newParentId: string | undefined, beforeId?: string) => void
  /** Register (or update) a shared custom node type that extends a built-in `base`. */
  addCustomNodeType: (type: string, icon?: string, base?: string) => void
  /** Remove a custom node type and reset every node using it (in ALL campaigns) to its base. */
  removeCustomNodeType: (type: string) => void
}

const BUILTIN_TYPES = new Set(NODE_TYPE_PRESETS.map((p) => p.type))

export const createSessionSlice: Slice<SessionActions> = (set) => ({
  addNode: (parentId, type) => {
    const id = uid('sn')
    set((s) => {
      const order = childrenOf(s.sessionNodes, parentId).length
      const node: SessionNode = { id, parentId, order, type, title: '', body: '' }
      return { sessionNodes: [...s.sessionNodes, node] }
    })
    return id
  },

  addAlias: (parentId, refId) => {
    const id = uid('sn')
    set((s) => {
      const target = s.sessionNodes.find((n) => n.id === refId)
      const order = childrenOf(s.sessionNodes, parentId).length
      const node: SessionNode = {
        id,
        parentId,
        order,
        type: target?.type ?? 'note',
        title: '',
        body: '',
        refId,
      }
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
      const remaining = s.sessionNodes.filter((n) => !doomed.has(n.id) && !(n.refId && doomed.has(n.refId)))
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
      if (idx <= 0) return s
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
      const moved = s.sessionNodes.map((n) =>
        n.id === id ? { ...n, parentId: parent.parentId, order: parent.order + 0.5 } : n,
      )
      return { sessionNodes: normalizeOrders(normalizeOrders(moved, parent.parentId), parent.id) }
    }),

  moveNode: (id, newParentId, beforeId) =>
    set((s) => {
      const node = s.sessionNodes.find((n) => n.id === id)
      if (!node) return s
      if (id === newParentId) return s
      if (newParentId && descendantIds(s.sessionNodes, id).includes(newParentId)) return s
      const oldParentId = node.parentId

      const target = childrenOf(s.sessionNodes, newParentId).filter((n) => n.id !== id)
      let insertAt = beforeId ? target.findIndex((n) => n.id === beforeId) : -1
      if (insertAt < 0) insertAt = target.length
      const orderedIds = [
        ...target.slice(0, insertAt).map((n) => n.id),
        id,
        ...target.slice(insertAt).map((n) => n.id),
      ]
      const orderInNewGroup = new Map(orderedIds.map((nid, i) => [nid, i]))

      let nodes = s.sessionNodes.map((n) => {
        if (n.id === id) return { ...n, parentId: newParentId, order: orderInNewGroup.get(n.id)! }
        if (orderInNewGroup.has(n.id)) return { ...n, order: orderInNewGroup.get(n.id)! }
        return n
      })
      if (oldParentId !== newParentId) nodes = normalizeOrders(nodes, oldParentId)
      return { sessionNodes: nodes }
    }),

  addCustomNodeType: (type, icon, base) =>
    set((s) => {
      const name = type.trim()
      if (!name || BUILTIN_TYPES.has(name)) return s
      const entry = { type: name, icon, base: base || 'note' }
      const existing = s.customNodeTypes.findIndex((t) => t.type === name)
      const next = [...s.customNodeTypes]
      if (existing >= 0) next[existing] = entry
      else next.push(entry)
      return { customNodeTypes: next }
    }),

  removeCustomNodeType: (type) =>
    set((s) => {
      const fallback = s.customNodeTypes.find((t) => t.type === type)?.base ?? 'note'
      const reset = (n: SessionNode): SessionNode =>
        !n.refId && n.type === type ? { ...n, type: fallback, icon: undefined } : n
      const inactiveCampaigns: Record<string, CampaignState> = {}
      for (const [id, cs] of Object.entries(s.inactiveCampaigns)) {
        inactiveCampaigns[id] = { ...cs, sessionNodes: cs.sessionNodes.map(reset) }
      }
      return {
        customNodeTypes: s.customNodeTypes.filter((t) => t.type !== type),
        sessionNodes: s.sessionNodes.map(reset),
        inactiveCampaigns,
      }
    }),
})
