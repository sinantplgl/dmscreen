import { useState } from 'react'
import type { ReactNode } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { StatBlock } from '../StatBlock'
import { NodeChildren } from './NodeChildren'
import { TypePicker } from './TypePicker'
import { sectionsFor } from './sections'
import type { SessionNode } from '../../types'
import { EyeIcon, EyeSlashIcon, LinkIcon } from '../../components/icons'
import { iconFor, isLeafType, isHidden, placeholderFor, displayTitle, nodeNumber, baseTypeOf } from './helpers'
import { CardSettingsMenu, DEFAULT_CARD_FONT } from './CardSettingsMenu'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'

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

  // Primary content for a node (the scrollable "notes" region). When `editable`
  // is false (alias cards), it's always read-only.
  const notesContent = (n: SessionNode, editable: boolean): ReactNode => {
    const creature = n.creatureId ? bestiary.find((b) => b.id === n.creatureId) : undefined
    const base = baseTypeOf(n.type, customNodeTypes)
    if (base === 'statblock') {
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
      if (editable && (editing || !n.imageUrl)) {
        return (
          <input
            type="url"
            placeholder="Image URL…"
            value={n.imageUrl || ''}
            onChange={(e) => updateNode(n.id, { imageUrl: e.target.value })}
          />
        )
      }
      return n.imageUrl ? (
        <img className="node-card-img" src={n.imageUrl} alt={n.title} />
      ) : (
        <div className="node-empty">No image set.</div>
      )
    }
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

  // The notes + resizable extras + togglable children stack, shared by both
  // branches. `content` is the source node for content (target for aliases);
  // section heights / children-open are always keyed on this card (`node.id`).
  const sections = (content: SessionNode, editable: boolean) => (
    <div className="node-card-sections">
      <div className="node-card-notes" style={bodyStyle}>
        {notesContent(content, editable)}
      </div>
      {sectionsFor(baseTypeOf(content.type, customNodeTypes)).map(({ key, Component }) => (
        <Component
          key={key}
          node={content}
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
        <div className="node-card-head">
          <span className="drag-grip" title="Drag to move">⠿</span>
          <span className="alias-badge node-type-icon">↪</span>
          <span className="node-type-icon" title={target.type}>{iconFor(target)}</span>
          {num != null && <span className="node-card-num">{num}</span>}
          <span className="node-card-num ref-orig" title="Original number">[{nodeNumber(nodes, target) ?? '?'}]</span>
          <span className="node-alias-card-title">{displayTitle(target)}</span>
          <span className="spacer" />
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
            />
          )}
          <button className="icon-btn danger" title="Remove alias" onClick={() => removeNode(node.id)}>✕</button>
        </div>
        {sections(target, false)}
      </div>
    )
  }

  const nodeBase = baseTypeOf(node.type, customNodeTypes)
  const leaf = isLeafType(nodeBase)

  return (
    <div className={'node-card' + (leaf ? ' leaf' : '') + (hidden ? ' hidden' : '')}>
      <div className="node-card-head">
        <span className="drag-grip" title="Drag to move">⠿</span>
        <TypePicker node={node} />
        {num != null && <span className="node-card-num">{num}</span>}
        <input
          className="node-title"
          value={node.title}
          placeholder={placeholderFor(node)}
          onChange={(e) => updateNode(node.id, { title: e.target.value })}
        />
        <span className="spacer" />
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
          />
        )}
        <button
          className="icon-btn danger"
          title="Delete (with everything inside)"
          onClick={() => {
            if (confirm(`Delete "${node.title}" and everything inside it?`)) removeNode(node.id)
          }}
        >
          ✕
        </button>
      </div>

      {sections(node, true)}
    </div>
  )
}
