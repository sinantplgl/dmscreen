import { createElement } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { SessionNode } from '../../types'
import {
  BookIcon,
  ScrollIcon,
  SwordIcon,
  SwordsIcon,
  FilmIcon,
  MapIcon,
  DoorIcon,
  MageIcon,
  GemIcon,
  HookIcon,
  MusicIcon,
  NoteIcon,
  ChartIcon,
  ImageIcon,
} from '../../components/icons'

export const NODE_TYPE_PRESETS: { type: string; Icon: ComponentType }[] = [
  { type: 'adventure', Icon: ScrollIcon },
  { type: 'session', Icon: BookIcon },
  { type: 'quest', Icon: SwordIcon },
  { type: 'scene', Icon: FilmIcon },
  { type: 'area', Icon: MapIcon },
  { type: 'room', Icon: DoorIcon },
  { type: 'npc', Icon: MageIcon },
  { type: 'item', Icon: GemIcon },
  { type: 'encounter', Icon: SwordsIcon },
  { type: 'hook', Icon: HookIcon },
  { type: 'beat', Icon: MusicIcon },
  { type: 'note', Icon: NoteIcon },
  { type: 'statblock', Icon: ChartIcon },
  { type: 'image', Icon: ImageIcon },
]

export const PRESET_ICON: Record<string, ComponentType> = Object.fromEntries(
  NODE_TYPE_PRESETS.map((p) => [p.type, p.Icon]),
)

export function iconFor(n: SessionNode): ReactNode {
  if (n.icon) return n.icon
  const Icon = PRESET_ICON[n.type]
  return Icon ? createElement(Icon) : '•'
}

export const isLeafType = (type: string) =>
  type === 'note' || type === 'statblock' || type === 'image' || type === 'item'

export const showsByDefault = (type: string) => isLeafType(type)

export const isHidden = (n: SessionNode) => n.hidden ?? !showsByDefault(n.type)

export const childrenOf = (nodes: SessionNode[], parentId: string | undefined) =>
  nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order)

export const placeholderFor = (n: SessionNode) => `New ${n.type}`

export function displayTitle(n: SessionNode): ReactNode {
  return n.title.trim() ? n.title : createElement('span', { className: 'muted' }, placeholderFor(n))
}

export function siblingNumbers(siblings: SessionNode[]): Map<string, number> {
  const out = new Map<string, number>()
  let n = 0
  for (const s of siblings) {
    n = typeof s.number === 'number' && !Number.isNaN(s.number) ? s.number : n + 1
    out.set(s.id, n)
  }
  return out
}

export function searchNodes(nodes: SessionNode[], q: string): SessionNode[] {
  const t = q.trim().toLowerCase()
  if (!t) return []
  return nodes
    .filter((n) => !n.refId)
    .filter(
      (n) =>
        n.title.toLowerCase().includes(t) ||
        n.type.toLowerCase().includes(t) ||
        n.body.toLowerCase().includes(t),
    )
    .slice(0, 50)
}

export function ancestorTrail(nodes: SessionNode[], n: SessionNode): SessionNode[] {
  const out: SessionNode[] = []
  let cur = n.parentId ? nodes.find((x) => x.id === n.parentId) : undefined
  while (cur) {
    out.unshift(cur)
    cur = cur.parentId ? nodes.find((x) => x.id === cur!.parentId) : undefined
  }
  return out
}

export const NODE_MIME = 'application/x-session-node'
export type DropZone = 'before' | 'after' | 'inside'

// The node currently being dragged — shared across NodeRow instances so a row
// can skip showing drop indicators on itself.
export let draggingNodeId: string | null = null
export const setDraggingNodeId = (id: string | null) => { draggingNodeId = id }
