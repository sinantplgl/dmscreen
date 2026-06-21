import { useState } from 'react'
import { useStore } from '../../store/store'
import { GearIcon } from '../../components/icons'
import { baseTypeOf } from './helpers'
import { FieldHost, StructureEditor, structureFields } from './fields'
import type { FieldKey } from './fields'
import type { SessionNode } from '../../types'

/** The focused-in detail pane: this is where you edit the node's CONTENT — its
 *  field structure (add/remove/reorder via the Fields menu) and the field data.
 *  Renders every structural field (static, non-resizable). Display tweaks
 *  (hide/order/color) live on the board card, not here. */
export function FocusedContent({ node, onPick }: { node: SessionNode; onPick: (id: string) => void }) {
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const base = baseTypeOf(node.type, customNodeTypes)
  const [editingField, setEditingField] = useState<FieldKey | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const keys = structureFields(node, base)

  return (
    <div className="self-content">
      <div className="self-fields-bar">
        <button className="icon-btn" title="Fields" onClick={() => setMenuOpen((v) => !v)}>
          <GearIcon />
        </button>
        {menuOpen && (
          <>
            <div className="ref-lib-overlay" onClick={() => setMenuOpen(false)} />
            <div className="self-fields-menu">
              <StructureEditor node={node} base={base} />
            </div>
          </>
        )}
      </div>
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
          />
        </div>
      ))}
      {keys.length === 0 && <div className="empty-hint">No fields — add one from the Fields menu.</div>}
    </div>
  )
}
