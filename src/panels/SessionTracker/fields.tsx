import { useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { StatBlock } from '../StatBlock'
import { ImageField } from '../../components/ImageField'
import { ResizableSection } from './ResizableSection'
import type { SectionMode } from './ResizableSection'
import { NodeItems } from './NodeItems'
import { NodeEncounter } from './NodeEncounter'
import { NodeDialogue } from './NodeDialogue'
import { confirmDialog } from '../../lib/dialog'
import { ALL_FIELD_KEYS, structureFields, displayFields } from './fieldModel'
import type { FieldKey, CardFieldConfig } from './fieldModel'
import type { SessionNode } from '../../types'

// Re-export the pure field model so existing `./fields` importers keep working.
export type { FieldKey, CardFieldConfig } from './fieldModel'
export { structureFields, displayFields, visibleDisplayKeys, defaultFieldsFor } from './fieldModel'

/**
 * The card field system. A node holds field *data* (body, imageUrl, items, …);
 * each card picks which fields to show, in what order and size. Field types are
 * universal — any field can appear on any node; a node type only seeds defaults.
 */

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

/** Render a field by key in the given mode. */
export function FieldHost({ fieldKey, ...props }: FieldProps & { fieldKey: FieldKey }) {
  const def = FIELD_REGISTRY[fieldKey]
  if (!def) return null
  const Comp = def.Component
  return <Comp {...props} />
}

/** Node-data patch that clears a field's backing data when its slot is removed. */
export function clearFieldData(key: FieldKey): Partial<SessionNode> {
  switch (key) {
    case 'notes':
      return { body: '' }
    case 'image':
      return { imageUrl: undefined }
    case 'statblock':
      return { creatureId: undefined }
    case 'items':
      return { items: undefined }
    case 'creatures':
      return { creatures: undefined }
    case 'dialogue':
      return { dialogue: undefined }
  }
}

// ── Editors (shared draggable row list, two modes) ───────────────────────────

/** A reorderable list of field rows. `onReorder(from, to)` moves `from` into
 *  `to`'s slot; `renderRow` draws everything right of the drag grip. */
function FieldRowList({
  keys,
  onReorder,
  renderRow,
}: {
  keys: FieldKey[]
  onReorder: (from: FieldKey, to: FieldKey) => void
  renderRow: (key: FieldKey) => ReactNode
}) {
  const [dragKey, setDragKey] = useState<FieldKey | null>(null)
  const [overKey, setOverKey] = useState<FieldKey | null>(null)
  return (
    <>
      {keys.map((key) => (
        <div
          key={key}
          className={
            'card-field-row' +
            (dragKey === key ? ' dragging' : '') +
            (overKey === key && dragKey && dragKey !== key ? ' drop-over' : '')
          }
          draggable
          onDragStart={(e) => {
            setDragKey(key)
            e.dataTransfer.effectAllowed = 'move'
          }}
          onDragEnd={() => {
            setDragKey(null)
            setOverKey(null)
          }}
          onDragOver={(e) => {
            if (!dragKey) return
            e.preventDefault()
            setOverKey(key)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (dragKey && dragKey !== key) onReorder(dragKey, key)
            setDragKey(null)
            setOverKey(null)
          }}
        >
          <span className="card-field-grip" title="Drag to reorder">⠿</span>
          {renderRow(key)}
        </div>
      ))}
    </>
  )
}

const reordered = (list: FieldKey[], from: FieldKey, to: FieldKey): FieldKey[] => {
  const next = [...list]
  const fi = next.indexOf(from)
  const ti = next.indexOf(to)
  if (fi < 0 || ti < 0) return list
  const [moved] = next.splice(fi, 1)
  next.splice(ti, 0, moved)
  return next
}

/** Focus-in CONTENT editor: add / remove / reorder the node's field structure.
 *  Removing a field warns, then drops the slot and clears its data. */
export function StructureEditor({ node, base }: { node: SessionNode; base: string }) {
  const updateNode = useStore((s) => s.updateNode)
  const keys = structureFields(node, base)
  const missing = ALL_FIELD_KEYS.filter((k) => !keys.includes(k))

  const setStructure = (next: FieldKey[]) => updateNode(node.id, { fields: next })
  const add = (key: FieldKey) => setStructure([...keys, key])
  const remove = async (key: FieldKey) => {
    const ok = await confirmDialog({
      title: `Remove the ${FIELD_REGISTRY[key]?.label ?? key} field?`,
      message: 'This deletes the field and its content from this node (on every card). This cannot be undone.',
      confirmLabel: 'Remove',
      danger: true,
    })
    if (!ok) return
    updateNode(node.id, { fields: keys.filter((k) => k !== key), ...clearFieldData(key) })
  }

  return (
    <div className="card-fields-editor">
      <div className="card-fields-title">Fields</div>
      <FieldRowList
        keys={keys}
        onReorder={(from, to) => setStructure(reordered(keys, from, to))}
        renderRow={(key) => (
          <>
            <span className="card-field-name card-field-name-static">{FIELD_REGISTRY[key]?.label ?? key}</span>
            <button className="icon-btn danger" title="Remove field (deletes its content)" onClick={() => remove(key)}>
              ✕
            </button>
          </>
        )}
      />
      {missing.length > 0 && (
        <div className="card-fields-add">
          <span className="card-fields-add-label">Add:</span>
          {missing.map((k) => (
            <button key={k} className="btn btn-sm" onClick={() => add(k)}>
              ＋ {FIELD_REGISTRY[k].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Per-card DISPLAY editor: hide / reorder the node's existing fields. */
export function DisplayEditor({
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
  const rows = displayFields(fields, node, base)
  const visibleOf = (key: FieldKey) => rows.find((r) => r.key === key)?.visible ?? true
  const toggle = (key: FieldKey) =>
    onFields(rows.map((r) => (r.key === key ? { ...r, visible: !r.visible } : r)))
  const onReorder = (from: FieldKey, to: FieldKey) => {
    const order = reordered(rows.map((r) => r.key), from, to)
    onFields(order.map((k) => ({ key: k, visible: visibleOf(k) })))
  }

  return (
    <div className="card-fields-editor">
      <div className="card-fields-title">Fields</div>
      <FieldRowList
        keys={rows.map((r) => r.key)}
        onReorder={onReorder}
        renderRow={(key) => (
          <button
            className="card-field-name"
            title={visibleOf(key) ? 'Hide this field' : 'Show this field'}
            onClick={() => toggle(key)}
          >
            <span className={'card-field-dot' + (visibleOf(key) ? ' on' : '')} />
            {FIELD_REGISTRY[key]?.label ?? key}
          </button>
        )}
      />
    </div>
  )
}
