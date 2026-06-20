import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useStore } from '../../store/store'
import { NodeChildren } from './NodeChildren'
import { LabelChips } from './LabelChips'
import { TypePicker } from './TypePicker'
import { confirmDialog } from '../../lib/dialog'
import type { SessionNode } from '../../types'
import { EyeIcon, EyeSlashIcon } from '../../components/icons'
import { iconFor, isLeafType, isHidden, placeholderFor, displayTitle, nodeNumber, baseTypeOf } from './helpers'
import { CardSettingsMenu, DEFAULT_CARD_FONT } from './CardSettingsMenu'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'
import { FieldHost, effectiveFields, visibleFieldKeys } from './fields'
import type { CardFieldConfig, FieldKey } from './fields'

/** Tint a card's title bar with the node's accent color: a translucent fill
 *  plus a solid left edge. `color` is a 6-digit hex; undefined = no highlight. */
function headColorStyle(color?: string): CSSProperties | undefined {
  if (!color) return undefined
  return { background: `${color}33`, boxShadow: `inset 3px 0 0 ${color}` }
}

export function NodeCard({
  node,
  nodes,
  num,
  setFocus,
  maximize,
  onPick,
  settings = {},
  onSettings,
  sectionHeights = {},
  onSectionHeight,
  childrenOpen = false,
  onToggleChildren,
  fields,
  onFields,
}: {
  node: SessionNode
  nodes: SessionNode[]
  num?: number
  setFocus: (id: string | undefined) => void
  maximize: (id: string) => void
  onPick: (id: string) => void
  settings?: CardSettings
  onSettings?: (s: CardSettings) => void
  sectionHeights?: Record<string, number>
  onSectionHeight?: (key: string, px: number) => void
  childrenOpen?: boolean
  onToggleChildren?: () => void
  fields?: CardFieldConfig
  onFields?: (cfg: CardFieldConfig) => void
}) {
  const updateNode = useStore((s) => s.updateNode)
  const removeNode = useStore((s) => s.removeNode)
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const [editingField, setEditingField] = useState<FieldKey | null>(null)
  const customTypeNames = new Set(customNodeTypes.map((t) => t.type))
  const hidden = isHidden(node, customTypeNames)
  const fontSize = settings.fontSize ?? DEFAULT_CARD_FONT
  const contentCols = settings.contentCols ?? 1
  const bodyStyle = { ['--ref-font-size' as string]: `${fontSize}px` }

  // Aliases (refId) render the target's content read-only. A broken alias is a
  // minimal stub. Otherwise `content` is the source for icon/title/fields and the
  // card itself (`node`) owns hide/remove/per-card config.
  const isAlias = !!node.refId
  const target = isAlias ? nodes.find((n) => n.id === node.refId) : undefined
  if (isAlias && !target) {
    return (
      <div className="node-card alias leaf">
        <div className="node-card-head">
          <span className="drag-grip" title="Drag to move">⠿</span>
          <span className="node-alias-broken" style={{ flex: 1 }}>⚠ broken reference</span>
          <button className="icon-btn danger" title="Remove alias" onClick={() => removeNode(node.id)}>✕</button>
        </div>
      </div>
    )
  }
  const content = isAlias ? target! : node
  const editable = !isAlias
  const base = baseTypeOf(content.type, customNodeTypes)
  const leaf = isLeafType(base)

  // Field stack: first visible field fills (grow), the rest are resizable, so the
  // card is always fully covered. Section heights / children-open key on this card.
  const visibleKeys = visibleFieldKeys(effectiveFields(fields, base, content))
  const fieldStack = (
    <div className="node-card-sections" style={bodyStyle}>
      {visibleKeys.map((key, i) => (
        <FieldHost
          key={key}
          fieldKey={key}
          node={content}
          editable={editable}
          editing={editingField === key}
          setEditing={(v) => setEditingField(v ? key : null)}
          cols={contentCols}
          onPick={onPick}
          mode={i === 0 ? 'grow' : 'fixed'}
          height={sectionHeights[key]}
          onHeight={(px) => onSectionHeight?.(key, px)}
        />
      ))}
      <NodeChildren
        node={content}
        open={childrenOpen}
        onToggle={() => onToggleChildren?.()}
        maximize={maximize}
      />
    </div>
  )

  return (
    <div className={'node-card' + (isAlias ? ' alias' : '') + (leaf ? ' leaf' : '') + (hidden ? ' hidden' : '')}>
      <div className="node-card-head" style={headColorStyle(content.color)}>
        <span className="drag-grip" title="Drag to move">⠿</span>
        {isAlias ? (
          <>
            <span className="alias-badge node-type-icon">↪</span>
            <span className="node-type-icon" title={content.type}>{iconFor(content)}</span>
          </>
        ) : (
          <TypePicker node={node} />
        )}
        {num != null && <span className="node-card-num">{num}</span>}
        {isAlias && (
          <span className="node-card-num ref-orig" title="Original number">
            [{nodeNumber(nodes, content) ?? '?'}]
          </span>
        )}
        {isAlias ? (
          <span className="node-alias-card-title">{displayTitle(content)}</span>
        ) : (
          <input
            className="node-title"
            value={node.title}
            placeholder={placeholderFor(node)}
            onChange={(e) => updateNode(node.id, { title: e.target.value })}
          />
        )}
        <button className="icon-btn" title="Maximize (focus mode)" onClick={() => maximize(content.id)}>
          ⤢
        </button>
        <button
          className="icon-btn"
          title={isAlias ? 'Go to the original card' : 'Go to card (navigate in)'}
          onClick={() => setFocus(content.id)}
        >
          ⊕
        </button>
        <button
          className="icon-btn"
          title={
            hidden
              ? isAlias ? 'Show this reference on the board' : 'Show on board'
              : isAlias ? 'Hide this reference from the board' : 'Hide from board'
          }
          onClick={() => updateNode(node.id, { hidden: !hidden })}
        >
          {hidden ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
        {onSettings && (
          <CardSettingsMenu
            settings={settings}
            onSettings={onSettings}
            allowColumns={visibleKeys.some((k) => k === 'notes' || k === 'dialogue')}
            allowLabels={isAlias ? !!content.labels?.length : true}
            color={isAlias ? undefined : node.color}
            onColor={isAlias ? undefined : (color) => updateNode(node.id, { color })}
            base={base}
            node={content}
            fields={fields}
            onFields={onFields}
          />
        )}
        <button
          className="icon-btn danger"
          title={isAlias ? 'Remove alias' : 'Delete (with everything inside)'}
          onClick={async () => {
            if (isAlias) {
              removeNode(node.id)
              return
            }
            if (
              await confirmDialog({
                title: 'Delete node?',
                message: `Delete "${node.title || placeholderFor(node)}" and everything inside it?`,
                confirmLabel: 'Delete',
                danger: true,
              })
            )
              removeNode(node.id)
          }}
        >
          ✕
        </button>
      </div>

      {settings.showLabels &&
        (isAlias ? (
          <LabelChips labels={content.labels} />
        ) : (
          <LabelChips labels={node.labels} onChange={(labels) => updateNode(node.id, { labels })} />
        ))}
      {fieldStack}
    </div>
  )
}
