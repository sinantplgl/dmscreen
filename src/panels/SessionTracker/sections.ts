import type { FC } from 'react'
import type { SessionNode } from '../../types'
import { NodeItems } from './NodeItems'
import { NodeEncounter } from './NodeEncounter'

/** Props every extra-info section component accepts. `resizable` is true on the
 *  board card (drag splitter + persisted height) and false in the focused pane. */
export type SectionProps = {
  node: SessionNode
  height?: number
  onHeight?: (px: number) => void
  resizable?: boolean
}

export type SectionDef = { key: string; Component: FC<SectionProps> }

/**
 * Extra-info sections per node type. To give a NEW card type its own section,
 * add an entry here (a stable key + a component that renders a <ResizableSection>) —
 * NodeCard, FocusedContent and the persistence wiring pick it up automatically,
 * no per-type branching anywhere else.
 */
export const SECTION_REGISTRY: Record<string, SectionDef[]> = {
  item: [{ key: 'items', Component: NodeItems }],
  encounter: [{ key: 'creatures', Component: NodeEncounter }],
}

export const sectionsFor = (type: string): SectionDef[] => SECTION_REGISTRY[type] ?? []
