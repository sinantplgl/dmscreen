import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { StatBlock } from '../StatBlock'
import { NodeChildren } from './NodeChildren'
import { LabelChips } from './LabelChips'
import { TypePicker } from './TypePicker'
import { sectionsFor } from './sections'
import { confirmDialog } from '../../lib/dialog'
import type { SessionNode } from '../../types'
import { EyeIcon, EyeSlashIcon, LinkIcon } from '../../components/icons'
import { ImageField } from '../../components/ImageField'
import { iconFor, isLeafType, isHidden, placeholderFor, displayTitle, nodeNumber, baseTypeOf, notesVisible } from './helpers'
import { CardSettingsMenu, DEFAULT_CARD_FONT } from './CardSettingsMenu'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'

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
}) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const removeNode = useStore((s) => s.removeNode)
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const [editing, setEditing] = useState(false)
  const customTypeNames = new Set(customNodeTypes.map((t) => t.type))
  const hidden = isHidden(node, customTypeNames)
  const fontSize = settings.fontSize ?? DEFAULT_CARD_FONT
  const contentCols = settings.contentCols ?? 1
  const bodyStyle = { ['--ref-font-size' as string]: `${fontSize}px` }

  // A node's primary field — the image / stat block whose content IS the node.
  // Returns null for plain content types, whose primary content is the notes.
  const primaryField = (n: SessionNode, editable: boolean): ReactNode => {
    const base = baseTypeOf(n.type, customNodeTypes)
    if (base === 'statblock') {
      const creature = n.creatureId ? bestiary.find((b) => b.id === n.creatureId) : undefined
      return creature ? (
        <StatBlock creature={creature} />
      ) : editable ? (
        <button className="btn btn-sm" onClick={() => onPick(n.id)}>
          Link a creature…
        </button>
      ) : (
        <div className="node-empty">No creature linked.</div>
      )
    }
    if (base === 'image') {
      return (
        <ImageField
          imageUrl={n.imageUrl}
          onImageUrlChange={(url) => updateNode(n.id, { imageUrl: url })}
          editing={editable && editing}
          editable={editable}
          alt={n.title}
        />
      )
    }
    return null
  }

  // The markdown notes (body) region. When `editable` is false (alias cards),
  // it's always read-only.
  const notesField = (n: SessionNode, editable: boolean): ReactNode => {
    if (editable && editing) {
      return (
        <textarea
          className="node-body-edit"
          placeholder="Markdown — **bold**, # heading, - list, > quote"
          value={n.body}
          onChange={(e) => updateNode(n.id, { body: e.target.value })}
        />
      )
    }
    return n.body ? (
      <div style={{ columnCount: contentCols > 1 ? contentCols : undefined }}>
        <Markdown text={n.body} />
      </div>
    ) : (
      <div className="node-empty">{editable ? 'No notes. Click ✎ to edit.' : 'No notes.'}</div>
    )
  }

  // The primary field + (toggleable) notes + resizable extras + togglable
  // children stack, shared by both branches. `content` is the source node for
  // content (target for aliases); section heights / children-open are always
  // keyed on this card (`node.id`).
  const sections = (content: SessionNode, editable: boolean) => {
    const base = baseTypeOf(content.type, customNodeTypes)
    const primary = primaryField(content, editable)
    return (
      <div className="node-card-sections">
        {primary != null && <div className="node-card-notes" style={bodyStyle}>{primary}</div>}
        {notesVisible(content, base) && (
          <div className="node-card-notes" style={bodyStyle}>{notesField(content, editable)}</div>
        )}
        {sectionsFor(base).map(({ key, Component }) => (
          <Component
            key={key}
            node={content}
            height={sectionHeights[key]}
            onHeight={(px) => onSectionHeight?.(key, px)}
            cols={contentCols}
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
  }

  if (node.refId) {
    const target = nodes.find((n) => n.id === node.refId)
    if (!target) {
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
    const targetBase = baseTypeOf(target.type, customNodeTypes)
    const targetLeaf = isLeafType(targetBase)
    return (
      <div className={'node-card alias' + (targetLeaf ? ' leaf' : '') + (hidden ? ' hidden' : '')}>
        <div className="node-card-head" style={headColorStyle(target.color)}>
          <span className="drag-grip" title="Drag to move">⠿</span>
          <span className="alias-badge node-type-icon">↪</span>
          <span className="node-type-icon" title={target.type}>{iconFor(target)}</span>
          {num != null && <span className="node-card-num">{num}</span>}
          <span className="node-card-num ref-orig" title="Original number">[{nodeNumber(nodes, target) ?? '?'}]</span>
          <span className="node-alias-card-title">{displayTitle(target)}</span>
          <button className="icon-btn" title="Maximize (focus mode)" onClick={() => maximize(target.id)}>⤢</button>
          <button className="icon-btn" title="Go to the original card" onClick={() => setFocus(target.id)}>⊕</button>
          <button
            className="icon-btn"
            title={hidden ? 'Show this reference on the board' : 'Hide this reference from the board'}
            onClick={() => updateNode(node.id, { hidden: !hidden })}
          >
            {hidden ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
          {onSettings && (
            <CardSettingsMenu
              settings={settings}
              onSettings={onSettings}
              allowColumns={targetBase !== 'statblock' && targetBase !== 'image'}
              allowLabels={!!target.labels?.length}
            />
          )}
          <button className="icon-btn danger" title="Remove alias" onClick={() => removeNode(node.id)}>✕</button>
        </div>
        {settings.showLabels && <LabelChips labels={target.labels} />}
        {sections(target, false)}
      </div>
    )
  }

  const nodeBase = baseTypeOf(node.type, customNodeTypes)
  const leaf = isLeafType(nodeBase)

  return (
    <div className={'node-card' + (leaf ? ' leaf' : '') + (hidden ? ' hidden' : '')}>
      <div className="node-card-head" style={headColorStyle(node.color)}>
        <span className="drag-grip" title="Drag to move">⠿</span>
        <TypePicker node={node} />
        {num != null && <span className="node-card-num">{num}</span>}
        <input
          className="node-title"
          value={node.title}
          placeholder={placeholderFor(node)}
          onChange={(e) => updateNode(node.id, { title: e.target.value })}
        />
        {nodeBase === 'statblock' ? (
          <button className="icon-btn" title="Link creature" onClick={() => onPick(node.id)}>
            <LinkIcon />
          </button>
        ) : (
          <button className="icon-btn" title={editing ? 'Preview' : 'Edit'} onClick={() => setEditing((v) => !v)}>
            {editing ? '▿' : '✎'}
          </button>
        )}
        <button className="icon-btn" title="Maximize (focus mode)" onClick={() => maximize(node.id)}>
          ⤢
        </button>
        <button className="icon-btn" title="Go to card (navigate in)" onClick={() => setFocus(node.id)}>
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
            allowColumns={nodeBase !== 'statblock' && nodeBase !== 'image'}
            allowLabels
            color={node.color}
            onColor={(color) => updateNode(node.id, { color })}
            showNotes={notesVisible(node, nodeBase)}
            onShowNotes={(v) => updateNode(node.id, { showNotes: v })}
          />
        )}
        <button
          className="icon-btn danger"
          title="Delete (with everything inside)"
          onClick={async () => {
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

      {settings.showLabels && (
        <LabelChips labels={node.labels} onChange={(labels) => updateNode(node.id, { labels })} />
      )}
      {sections(node, true)}
    </div>
  )
}
