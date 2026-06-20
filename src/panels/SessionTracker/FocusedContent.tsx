import { useState } from 'react'
import { useStore } from '../../store/store'
import { GearIcon } from '../../components/icons'
import { baseTypeOf } from './helpers'
import { FieldHost, FieldsEditor, effectiveFields, visibleFieldKeys } from './fields'
import type { CardFieldConfig, FieldKey } from './fields'
import type { SessionNode } from '../../types'

/** The focused-in detail pane: renders the node's visible fields (static, non-
 *  resizable) plus a Fields menu so a hidden field can be re-enabled here. Field
 *  visibility/order is per-card, keyed by the same node id as the board card. */
export function FocusedContent({
  node,
  onPick,
  fields,
  onFields,
  sectionHeights = {},
  onSectionHeight,
}: {
  node: SessionNode
  onPick: (id: string) => void
  fields?: CardFieldConfig
  onFields?: (cfg: CardFieldConfig) => void
  sectionHeights?: Record<string, number>
  onSectionHeight?: (key: string, px: number) => void
}) {
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const base = baseTypeOf(node.type, customNodeTypes)
  const [editingField, setEditingField] = useState<FieldKey | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const keys = visibleFieldKeys(effectiveFields(fields, base, node))

  return (
    <div className="self-content">
      {onFields && (
        <div className="self-fields-bar">
          <button className="icon-btn" title="Fields" onClick={() => setMenuOpen((v) => !v)}>
            <GearIcon />
          </button>
          {menuOpen && (
            <>
              <div className="ref-lib-overlay" onClick={() => setMenuOpen(false)} />
              <div className="self-fields-menu">
                <FieldsEditor fields={fields} base={base} node={node} onFields={onFields} />
              </div>
            </>
          )}
        </div>
      )}
      {keys.map((key) => (
        <div className="self-card" key={key}>
          <FieldHost
            fieldKey={key}
            node={node}
            editable
            editing={editingField === key}
            setEditing={(v) => setEditingField(v ? key : null)}
            cols={1}
            onPick={onPick}
            mode="static"
            height={sectionHeights[key]}
            onHeight={(px) => onSectionHeight?.(key, px)}
          />
        </div>
      ))}
    </div>
  )
}
