// Pure (React-free) field model for session-node cards. Kept separate from
// fields.tsx so non-UI code — notably the store's persistence migration — can
// derive a node's field structure without importing React components.

import type { CustomNodeType, SessionNode } from '../../types'

export type FieldKey = 'notes' | 'image' | 'statblock' | 'items' | 'creatures' | 'dialogue'

export const ALL_FIELD_KEYS: FieldKey[] = ['notes', 'image', 'statblock', 'items', 'creatures', 'dialogue']

const FIELD_KEY_SET = new Set<string>(ALL_FIELD_KEYS)

/** Per-card display overlay: order + visibility of the node's structural fields. */
export type CardFieldConfig = { key: FieldKey; visible: boolean }[]

const DEFAULT_FIELDS: Record<string, FieldKey[]> = {
  image: ['image'],
  statblock: ['statblock'],
  item: ['notes', 'items'],
  encounter: ['notes', 'creatures'],
  dialogue: ['notes', 'dialogue'],
}

/** The default ordered field set for a base type (custom types pass their base). */
export const defaultFieldsFor = (base: string): FieldKey[] => DEFAULT_FIELDS[base] ?? ['notes']

/** Whether a node actually holds data for a field. Used so a derived structure
 *  never hides existing content (migration-safety). */
export function hasFieldData(node: SessionNode, key: FieldKey): boolean {
  switch (key) {
    case 'notes':
      return !!node.body && node.body.trim().length > 0
    case 'image':
      return !!node.imageUrl
    case 'statblock':
      return !!node.creatureId
    case 'items':
      return !!node.items && node.items.length > 0
    case 'creatures':
      return !!node.creatures && node.creatures.length > 0
    case 'dialogue':
      return !!node.dialogue && node.dialogue.length > 0
  }
}

/** Derive a default structure for a node with no explicit `fields`: the type
 *  default, unioned with every field that actually holds data (so content is
 *  never hidden), dropping an empty default notes slot when other content exists. */
export function deriveStructure(node: SessionNode, base: string): FieldKey[] {
  const keys = [...defaultFieldsFor(base)]
  for (const k of ALL_FIELD_KEYS) if (hasFieldData(node, k) && !keys.includes(k)) keys.push(k)
  if (keys.includes('notes') && !hasFieldData(node, 'notes') && keys.some((k) => k !== 'notes')) {
    return keys.filter((k) => k !== 'notes')
  }
  return keys.length ? keys : ['notes']
}

/** The node's field STRUCTURE — explicit `node.fields` if present, else derived. */
export function structureFields(node: SessionNode, base: string): FieldKey[] {
  if (node.fields !== undefined) {
    return node.fields.filter((k): k is FieldKey => FIELD_KEY_SET.has(k))
  }
  return deriveStructure(node, base)
}

/** The per-card DISPLAY list — structural fields ordered/hidden by this card's
 *  overlay (display-only; never changes structure). */
export function displayFields(
  overlay: CardFieldConfig | undefined,
  node: SessionNode,
  base: string,
): CardFieldConfig {
  const structure = structureFields(node, base)
  if (!overlay || !overlay.length) return structure.map((k) => ({ key: k, visible: true }))
  const inStruct = new Set(structure)
  const ordered = overlay.filter((o) => inStruct.has(o.key))
  const present = new Set(ordered.map((o) => o.key))
  const missing = structure.filter((k) => !present.has(k)).map((k) => ({ key: k, visible: true }))
  return [...ordered, ...missing]
}

export const visibleDisplayKeys = (cfg: CardFieldConfig): FieldKey[] =>
  cfg.filter((f) => f.visible).map((f) => f.key)

/**
 * One-time bake of node field STRUCTURE: returns a new node array where every
 * non-alias node without explicit `fields` gets its derived structure baked in,
 * folding in (then dropping) the obsolete `showNotes` flag. Only ever ADDS
 * `fields` and strips the `showNotes` boolean — never touches field data, so it
 * cannot lose content. Used by both the persist migration and import/restore so
 * saves become self-describing regardless of how they enter the app.
 */
export function bakeFields(
  nodes: SessionNode[] | undefined,
  customTypes: CustomNodeType[],
): SessionNode[] {
  const baseOf = (type: string) => {
    const c = customTypes.find((t) => t.type === type)
    return c ? c.base ?? 'note' : type
  }
  return (nodes ?? []).map((node) => {
    const { showNotes, ...rest } = node as SessionNode & { showNotes?: boolean }
    if (rest.refId || rest.fields !== undefined) return rest
    let keys = deriveStructure(rest, baseOf(rest.type))
    // `showNotes` only ever governed an EMPTY notes slot — never hide a notes
    // field that actually has body text (that would hide content).
    if (showNotes === false && !hasFieldData(rest, 'notes')) keys = keys.filter((k) => k !== 'notes')
    else if (showNotes === true && !keys.includes('notes')) keys = [...keys, 'notes']
    return { ...rest, fields: keys }
  })
}
