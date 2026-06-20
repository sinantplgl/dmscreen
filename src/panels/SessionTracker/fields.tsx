import type { ComponentType } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { StatBlock } from '../StatBlock'
import { ImageField } from '../../components/ImageField'
import { ResizableSection } from './ResizableSection'
import type { SectionMode } from './ResizableSection'
import { NodeItems } from './NodeItems'
import { NodeEncounter } from './NodeEncounter'
import { NodeDialogue } from './NodeDialogue'
import { notesVisible } from './helpers'
import type { SessionNode } from '../../types'

/**
 * The card field system. A node holds field *data* (body, imageUrl, items, …);
 * each card picks which fields to show, in what order and size. Field types are
 * universal — any field can appear on any node; a node type only seeds defaults.
 */
export type FieldKey = 'notes' | 'image' | 'statblock' | 'items' | 'creatures' | 'dialogue'

/** Props every field component receives. `mode` decides its chrome (see ResizableSection).
 *  `editing`/`setEditing` is the per-field edit toggle (used by notes/image). */
export interface FieldProps {
  node: SessionNode
  editable: boolean
  editing?: boolean
  setEditing?: (v: boolean) => void
  cols?: number
  onPick?: (id: string) => void
  mode: SectionMode
  height?: number
  onHeight?: (px: number) => void
}

export interface FieldDef {
  key: FieldKey
  label: string
  Component: ComponentType<FieldProps>
}

// ── Built-in field components (the list fields live in their own files) ───────

function NotesField({ node, editable, editing, setEditing, cols = 1, mode, height, onHeight }: FieldProps) {
  const updateNode = useStore((s) => s.updateNode)
  const actions = editable ? (
    <button className="icon-btn" title={editing ? 'Preview' : 'Edit'} onClick={() => setEditing?.(!editing)}>
      {editing ? '▿' : '✎'}
    </button>
  ) : null
  return (
    <ResizableSection title="Notes" actions={actions} mode={mode} height={height} onHeight={onHeight}>
      {editable && editing ? (
        <textarea
          className="node-body-edit"
          placeholder="Markdown — **bold**, # heading, - list, > quote"
          value={node.body}
          onChange={(e) => updateNode(node.id, { body: e.target.value })}
        />
      ) : node.body ? (
        <div style={{ columnCount: cols > 1 ? cols : undefined }}>
          <Markdown text={node.body} />
        </div>
      ) : (
        <div className="node-empty">{editable ? 'No notes. Click ✎ to edit.' : 'No notes.'}</div>
      )}
    </ResizableSection>
  )
}

function ImageFieldSection({ node, editable, editing, setEditing, mode, height, onHeight }: FieldProps) {
  const updateNode = useStore((s) => s.updateNode)
  const actions = editable ? (
    <button className="icon-btn" title={editing ? 'Done' : 'Edit'} onClick={() => setEditing?.(!editing)}>
      {editing ? '▿' : '✎'}
    </button>
  ) : null
  return (
    <ResizableSection title="Image" actions={actions} mode={mode} height={height} onHeight={onHeight}>
      <ImageField
        imageUrl={node.imageUrl}
        onImageUrlChange={(url) => updateNode(node.id, { imageUrl: url })}
        editing={!!editing}
        editable={editable}
        alt={node.title}
      />
    </ResizableSection>
  )
}

function StatBlockField({ node, editable, onPick, mode, height, onHeight }: FieldProps) {
  const bestiary = useStore((s) => s.bestiary)
  const creature = node.creatureId ? bestiary.find((b) => b.id === node.creatureId) : undefined
  const actions = editable ? (
    <button className="btn btn-sm" onClick={() => onPick?.(node.id)}>
      {creature ? 'Change' : 'Link'}
    </button>
  ) : null
  return (
    <ResizableSection title="Stat Block" actions={actions} mode={mode} height={height} onHeight={onHeight}>
      {creature ? (
        <StatBlock creature={creature} />
      ) : (
        <div className="node-empty">{editable ? 'No creature linked — click "Link".' : 'No creature linked.'}</div>
      )}
    </ResizableSection>
  )
}

// ── Registry ─────────────────────────────────────────────────────────────────

export const FIELD_REGISTRY: Record<FieldKey, FieldDef> = {
  notes: { key: 'notes', label: 'Notes', Component: NotesField },
  image: { key: 'image', label: 'Image', Component: ImageFieldSection },
  statblock: { key: 'statblock', label: 'Stat Block', Component: StatBlockField },
  items: { key: 'items', label: 'Items', Component: NodeItems },
  creatures: { key: 'creatures', label: 'Creatures', Component: NodeEncounter },
  dialogue: { key: 'dialogue', label: 'Dialogue', Component: NodeDialogue },
}

export const ALL_FIELD_KEYS: FieldKey[] = ['notes', 'image', 'statblock', 'items', 'creatures', 'dialogue']

/** Render a field by key in the given mode. */
export function FieldHost({ fieldKey, ...props }: FieldProps & { fieldKey: FieldKey }) {
  const def = FIELD_REGISTRY[fieldKey]
  if (!def) return null
  const Comp = def.Component
  return <Comp {...props} />
}

// ── Defaults + per-card resolution ───────────────────────────────────────────

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

/** The per-card field config to render: stored override, else the type default —
 *  seeding the legacy per-node `showNotes` so upgrades keep their notes state. */
export function effectiveFields(
  stored: CardFieldConfig | undefined,
  base: string,
  node: SessionNode,
): CardFieldConfig {
  if (stored && stored.length) return stored
  const cfg: CardFieldConfig = defaultFieldsFor(base).map((k) => ({
    key: k,
    visible: k === 'notes' ? notesVisible(node, base) : true,
  }))
  // Preserve a legacy explicit "show notes" on a type whose defaults omit notes
  // (e.g. an image node the user had toggled notes on before the field system).
  if (node.showNotes === true && !cfg.some((f) => f.key === 'notes')) cfg.push({ key: 'notes', visible: true })
  return cfg
}

export const visibleFieldKeys = (cfg: CardFieldConfig): FieldKey[] =>
  cfg.filter((f) => f.visible).map((f) => f.key)

/** Full reorderable list for the Fields editor: effective fields first (in order),
 *  then every remaining registry field appended as hidden. */
export function fieldRows(
  stored: CardFieldConfig | undefined,
  base: string,
  node: SessionNode,
): CardFieldConfig {
  const eff = effectiveFields(stored, base, node)
  const present = new Set(eff.map((f) => f.key))
  const missing = ALL_FIELD_KEYS.filter((k) => !present.has(k)).map((k) => ({ key: k, visible: false }))
  return [...eff, ...missing]
}

/** Per-card field list editor (show/hide + reorder). Shared by the card gear menu
 *  and the focused/maximized pane so a hidden field can be re-added from either. */
export function FieldsEditor({
  fields,
  base,
  node,
  onFields,
}: {
  fields: CardFieldConfig | undefined
  base: string
  node: SessionNode
  onFields: (cfg: CardFieldConfig) => void
}) {
  const rows = fieldRows(fields, base, node)
  const toggle = (key: FieldKey) =>
    onFields(rows.map((r) => (r.key === key ? { ...r, visible: !r.visible } : r)))
  const move = (key: FieldKey, dir: -1 | 1) => {
    const i = rows.findIndex((r) => r.key === key)
    const j = i + dir
    if (i < 0 || j < 0 || j >= rows.length) return
    const next = [...rows]
    ;[next[i], next[j]] = [next[j], next[i]]
    onFields(next)
  }
  return (
    <div className="card-fields-editor">
      <div className="card-fields-title">Fields</div>
      {rows.map((r, i) => (
        <div className="card-field-row" key={r.key}>
          <button
            className="card-field-name"
            title={r.visible ? 'Hide this field' : 'Show this field'}
            onClick={() => toggle(r.key)}
          >
            <span className={'card-field-dot' + (r.visible ? ' on' : '')} />
            {FIELD_REGISTRY[r.key]?.label ?? r.key}
          </button>
          <button className="icon-btn" title="Move up" disabled={i === 0} onClick={() => move(r.key, -1)}>
            ▲
          </button>
          <button
            className="icon-btn"
            title="Move down"
            disabled={i === rows.length - 1}
            onClick={() => move(r.key, 1)}
          >
            ▼
          </button>
        </div>
      ))}
    </div>
  )
}
