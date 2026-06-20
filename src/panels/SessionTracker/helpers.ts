import { createElement } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { CustomNodeType, SessionNode } from '../../types'
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
  SpeechIcon,
  ShieldIcon,
  DragonIcon,
  CompassIcon,
  GlobeIcon,
  CastleIcon,
  ElfIcon,
  SparklesIcon,
  LightningIcon,
  TrapIcon,
  PotionIcon,
  KeyIcon,
  CrownIcon,
  SkullIcon,
  ChestIcon,
  CoinsIcon,
  TorchIcon,
  BannerIcon,
  TowerIcon,
  TreeIcon,
  ShipIcon,
  AnchorIcon,
  SpiderIcon,
  WolfIcon,
  BowIcon,
  AxeIcon,
  HelmetIcon,
  RingIcon,
  WandIcon,
  CauldronIcon,
  MugIcon,
  MountainIcon,
  SnakeIcon,
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
  { type: 'dialogue', Icon: SpeechIcon },
]

export const PRESET_ICON: Record<string, ComponentType> = Object.fromEntries(
  NODE_TYPE_PRESETS.map((p) => [p.type, p.Icon]),
)

/** Named, pickable icon set for custom types. A superset of the preset icons plus
 *  extra fantasy glyphs. Keys are stable lowercase identifiers stored on `node.icon`. */
export const ICON_LIBRARY: { key: string; Icon: ComponentType }[] = [
  { key: 'scroll', Icon: ScrollIcon },
  { key: 'book', Icon: BookIcon },
  { key: 'sword', Icon: SwordIcon },
  { key: 'swords', Icon: SwordsIcon },
  { key: 'film', Icon: FilmIcon },
  { key: 'map', Icon: MapIcon },
  { key: 'door', Icon: DoorIcon },
  { key: 'mage', Icon: MageIcon },
  { key: 'gem', Icon: GemIcon },
  { key: 'hook', Icon: HookIcon },
  { key: 'music', Icon: MusicIcon },
  { key: 'note', Icon: NoteIcon },
  { key: 'chart', Icon: ChartIcon },
  { key: 'image', Icon: ImageIcon },
  { key: 'speech', Icon: SpeechIcon },
  { key: 'shield', Icon: ShieldIcon },
  { key: 'dragon', Icon: DragonIcon },
  { key: 'compass', Icon: CompassIcon },
  { key: 'globe', Icon: GlobeIcon },
  { key: 'castle', Icon: CastleIcon },
  { key: 'elf', Icon: ElfIcon },
  { key: 'sparkles', Icon: SparklesIcon },
  { key: 'lightning', Icon: LightningIcon },
  { key: 'trap', Icon: TrapIcon },
  { key: 'potion', Icon: PotionIcon },
  { key: 'key', Icon: KeyIcon },
  { key: 'crown', Icon: CrownIcon },
  { key: 'skull', Icon: SkullIcon },
  { key: 'chest', Icon: ChestIcon },
  { key: 'coins', Icon: CoinsIcon },
  { key: 'torch', Icon: TorchIcon },
  { key: 'banner', Icon: BannerIcon },
  { key: 'tower', Icon: TowerIcon },
  { key: 'tree', Icon: TreeIcon },
  { key: 'ship', Icon: ShipIcon },
  { key: 'anchor', Icon: AnchorIcon },
  { key: 'spider', Icon: SpiderIcon },
  { key: 'wolf', Icon: WolfIcon },
  { key: 'bow', Icon: BowIcon },
  { key: 'axe', Icon: AxeIcon },
  { key: 'helmet', Icon: HelmetIcon },
  { key: 'ring', Icon: RingIcon },
  { key: 'wand', Icon: WandIcon },
  { key: 'cauldron', Icon: CauldronIcon },
  { key: 'mug', Icon: MugIcon },
  { key: 'mountain', Icon: MountainIcon },
  { key: 'snake', Icon: SnakeIcon },
]

export const ICON_BY_KEY: Record<string, ComponentType> = Object.fromEntries(
  ICON_LIBRARY.map((i) => [i.key, i.Icon]),
)

export function iconFor(n: SessionNode): ReactNode {
  if (n.icon) {
    const Icon = ICON_BY_KEY[n.icon]
    return Icon ? createElement(Icon) : n.icon // library key → SVG; else a literal emoji/char
  }
  const Icon = PRESET_ICON[n.type]
  return Icon ? createElement(Icon) : '•'
}

/** Resolve a node type to the built-in type whose behavior it should use. Custom
 *  types return their `base` (default 'note'); built-in types return themselves. */
export const baseTypeOf = (type: string, customTypes: CustomNodeType[]): string => {
  const ct = customTypes.find((t) => t.type === type)
  return ct ? ct.base ?? 'note' : type
}

export const isLeafType = (type: string) =>
  type === 'note' || type === 'statblock' || type === 'image' || type === 'item' || type === "npc" || type === 'dialogue'

/** Whether the markdown notes (body) region should render for a node. Per-node
 *  `showNotes` wins; otherwise `image`/`statblock` default to hidden (their content
 *  is the image / stat block) and everything else defaults to shown. */
export const notesVisible = (n: SessionNode, base: string): boolean =>
  n.showNotes ?? (base !== 'image' && base !== 'statblock')

// Built-in leaf types, plus any user-defined custom type, show on the board by default.
export const showsByDefault = (type: string, customTypes?: Set<string>) =>
  isLeafType(type) || (customTypes?.has(type) ?? false)

// Refs are shown by default (a reference almost always carries something worth
// seeing here); other nodes follow their type default. `hidden` is per-node, so a
// ref's visibility here is independent of the original node's visibility at home.
export const isHidden = (n: SessionNode, customTypes?: Set<string>) =>
  n.hidden ?? (n.refId ? false : !showsByDefault(n.type, customTypes))

export const childrenOf = (nodes: SessionNode[], parentId: string | undefined) =>
  nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order)

export const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

export const placeholderFor = (n: SessionNode) => capitalize(n.type)

/** Where a (shared) custom type is used, grouped by campaign — used to warn before
 *  deleting it. Scans the active campaign's nodes plus every inactive campaign snapshot. */
export interface TypeUsageGroup { campaignId: string; campaignName: string; titles: string[]; count: number }
export function customTypeUsage(
  type: string,
  activeNodes: SessionNode[],
  activeCampaignId: string,
  campaigns: { id: string; name: string }[],
  inactiveCampaigns: Record<string, { sessionNodes: SessionNode[] }>,
): TypeUsageGroup[] {
  const nameOf = (id: string) => campaigns.find((c) => c.id === id)?.name ?? 'Unknown campaign'
  const scan = (campaignId: string, nodes: SessionNode[]): TypeUsageGroup | null => {
    const hits = nodes.filter((n) => !n.refId && n.type === type)
    if (hits.length === 0) return null
    return {
      campaignId,
      campaignName: nameOf(campaignId),
      titles: hits.map((n) => (n.title.trim() ? n.title : placeholderFor(n))),
      count: hits.length,
    }
  }
  const groups: TypeUsageGroup[] = []
  const active = scan(activeCampaignId, activeNodes)
  if (active) groups.push(active)
  for (const [id, cs] of Object.entries(inactiveCampaigns)) {
    const g = scan(id, cs.sessionNodes ?? [])
    if (g) groups.push(g)
  }
  return groups
}

export function displayTitle(n: SessionNode): ReactNode {
  return n.title.trim() ? n.title : createElement('span', { className: 'muted' }, placeholderFor(n))
}

/** A node's own auto/pinned number among its home siblings (as shown in the tree). */
export function nodeNumber(nodes: SessionNode[], node: SessionNode): number | undefined {
  return siblingNumbers(childrenOf(nodes, node.parentId)).get(node.id)
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
  // Precompute each node's sibling number once (grouped by parent) so the
  // implicit `${type}${number}` label is searchable without an O(n²) scan.
  const numbers = new Map<string, number>()
  const byParent = new Map<string | undefined, SessionNode[]>()
  for (const n of nodes) {
    const arr = byParent.get(n.parentId) ?? []
    arr.push(n)
    byParent.set(n.parentId, arr)
  }
  for (const sibs of byParent.values()) {
    for (const [id, num] of siblingNumbers(childrenOf(sibs, sibs[0]?.parentId)))
      numbers.set(id, num)
  }
  return nodes
    .filter((n) => !n.refId)
    .filter((n) => {
      const num = numbers.get(n.id)
      const auto = num != null ? `${n.type}${num} ${n.type} ${num}` : ''
      const labels = (n.labels ?? []).join(' ')
      return [n.title, n.type, n.body, labels, auto]
        .join('\n')
        .toLowerCase()
        .includes(t)
    })
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
