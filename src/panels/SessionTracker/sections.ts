import type { FC } from 'react'
import type { SessionNode } from '../../types'
import { NodeItems } from './NodeItems'
import { NodeEncounter } from './NodeEncounter'
import { NodeDialogue } from './NodeDialogue'

/** Props every extra-info section component accepts. `resizable` is true on the
 *  board card (drag splitter + persisted height) and false in the focused pane. */
export type SectionProps = {
  node: SessionNode
  height?: number
  onHeight?: (px: number) => void
  resizable?: boolean
  /** Card column count — sections that support a multi-column layout honor this. */
  cols?: number
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
  dialogue: [{ key: 'dialogue', Component: NodeDialogue }],
}

export const sectionsFor = (type: string): SectionDef[] => SECTION_REGISTRY[type] ?? []
