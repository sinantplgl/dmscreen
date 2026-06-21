import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useStore } from '../../store/store'
import { NodeChildren } from './NodeChildren'
import { LabelChips } from './LabelChips'
import { TypePicker } from './TypePicker'
import { confirmDialog } from '../../lib/dialog'
import type { SessionNode } from '../../types'
import { EyeIcon, EyeSlashIcon } from '../../components/icons'
import { iconFor, isLeafType, isHidden, placeholderFor, nodeNumber, baseTypeOf } from './helpers'
import { CardSettingsMenu, DEFAULT_CARD_FONT } from './CardSettingsMenu'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'
import { FieldHost, displayFields, visibleDisplayKeys } from './fields'
import type { CardFieldConfig, FieldKey } from './fields'

/** Tint a card's title bar with an accent color: a translucent fill plus a solid
 *  left edge. `color` is a 6-digit hex; undefined = no highlight. */
function headColorStyle(color?: string): CSSProperties | undefined {
  if (!color) return undefined
  return { background: `${color}33`, boxShadow: `inset 3px 0 0 ${color}` }
}

/**
 * A board card. ONE rendering path serves both real nodes and reference (alias)
 * cards: the only differences are `editable` (an alias's content is read-only)
 * and two intentional reference indicators (the ↪ badge + original-number `[n]`).
 */
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
  // `content` is where icon/title/fields/data come from (the target for aliases);
  // the card itself (`node`) always owns hide/remove and per-card config.
  const content = isAlias ? target! : node
  const editable = !isAlias
  const base = baseTypeOf(content.type, customNodeTypes)
  const leaf = isLeafType(base)
  // Title color is a per-card display setting; fall back to the node's legacy color.
  const cardColor = settings.color ?? content.color

  const visibleKeys = visibleDisplayKeys(displayFields(fields, content, base))
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
      <div className="node-card-head" style={headColorStyle(cardColor)}>
        <span className="drag-grip" title="Drag to move">⠿</span>
        {editable ? (
          <TypePicker node={node} />
        ) : (
          <>
            <span className="alias-badge node-type-icon" title="Reference — click ⊕ to edit the original">↪</span>
            <span className="node-type-icon" title={content.type}>{iconFor(content)}</span>
          </>
        )}
        {num != null && <span className="node-card-num">{num}</span>}
        {isAlias && (
          <span className="node-card-num ref-orig" title="Original number">[{nodeNumber(nodes, content) ?? '?'}]</span>
        )}
        <input
          className="node-title"
          value={content.title}
          placeholder={placeholderFor(content)}
          readOnly={!editable}
          onChange={editable ? (e) => updateNode(node.id, { title: e.target.value }) : undefined}
        />
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
          title={hidden ? 'Show on board' : 'Hide from board'}
          onClick={() => updateNode(node.id, { hidden: !hidden })}
        >
          {hidden ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
        {onSettings && (
          <CardSettingsMenu
            settings={settings}
            onSettings={onSettings}
            allowColumns={visibleKeys.some((k) => k === 'notes' || k === 'dialogue')}
            allowLabels
            color={cardColor}
            onColor={(color) => onSettings({ ...settings, color })}
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
        (editable ? (
          <LabelChips labels={node.labels} onChange={(labels) => updateNode(node.id, { labels })} />
        ) : (
          <LabelChips labels={content.labels} />
        ))}
      {fieldStack}
    </div>
  )
}
