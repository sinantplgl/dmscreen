// Pure helpers for the count-bearing attachment lists on session nodes:
//   `node.items`     — { itemId, count }[]     (item nodes)
//   `node.creatures` — { creatureId, count }[] (encounter nodes)
// Adding an already-present id bumps its count; setting a count ≤ 0 removes it.

import { uid } from '../../lib/dnd'
import type { DialogueLine } from '../../types'

export type ItemRef = { itemId: string; count: number }
export type CreatureRef = { creatureId: string; count: number }

export function addItemRef(list: ItemRef[] | undefined, itemId: string): ItemRef[] {
  const cur = list ?? []
  return cur.some((x) => x.itemId === itemId)
    ? cur.map((x) => (x.itemId === itemId ? { ...x, count: x.count + 1 } : x))
    : [...cur, { itemId, count: 1 }]
}

export function setItemCount(list: ItemRef[] | undefined, itemId: string, count: number): ItemRef[] {
  const cur = list ?? []
  if (count <= 0) return cur.filter((x) => x.itemId !== itemId)
  return cur.map((x) => (x.itemId === itemId ? { ...x, count } : x))
}

export function addCreatureRef(
  list: CreatureRef[] | undefined,
  creatureId: string,
  unique = false,
): CreatureRef[] {
  const cur = list ?? []
  const existing = cur.some((x) => x.creatureId === creatureId)
  if (existing) {
    // A unique creature stays at a count of 1 — don't bump it.
    if (unique) return cur
    return cur.map((x) => (x.creatureId === creatureId ? { ...x, count: x.count + 1 } : x))
  }
  return [...cur, { creatureId, count: 1 }]
}

export function setCreatureCount(
  list: CreatureRef[] | undefined,
  creatureId: string,
  count: number,
): CreatureRef[] {
  const cur = list ?? []
  if (count <= 0) return cur.filter((x) => x.creatureId !== creatureId)
  return cur.map((x) => (x.creatureId === creatureId ? { ...x, count } : x))
}

// ── Dialogue lines (dialogue nodes) ─────────────────────────────────────────
// Append/update/remove/reorder the ordered `node.dialogue` list. Each helper
// returns a new array; the caller persists it via updateNode.

export function addDialogueLine(
  list: DialogueLine[] | undefined,
  kind: DialogueLine['kind'],
): DialogueLine[] {
  return [...(list ?? []), { id: uid('dl'), kind }]
}

export function updateDialogueLine(
  list: DialogueLine[] | undefined,
  id: string,
  patch: Partial<DialogueLine>,
): DialogueLine[] {
  return (list ?? []).map((l) => (l.id === id ? { ...l, ...patch } : l))
}

export function removeDialogueLine(
  list: DialogueLine[] | undefined,
  id: string,
): DialogueLine[] {
  return (list ?? []).filter((l) => l.id !== id)
}

export function moveDialogueLine(
  list: DialogueLine[] | undefined,
  id: string,
  dir: -1 | 1,
): DialogueLine[] {
  const cur = [...(list ?? [])]
  const i = cur.findIndex((l) => l.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= cur.length) return cur
  ;[cur[i], cur[j]] = [cur[j], cur[i]]
  return cur
}
