import { useState } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { StatBlock } from '../StatBlock'
import { NodeItems } from './NodeItems'
import type { SessionNode } from '../../types'
import { EyeIcon, EyeSlashIcon, LinkIcon } from '../../components/icons'
import { iconFor, isLeafType, isHidden, placeholderFor, displayTitle } from './helpers'

export function NodeCard({
  node,
  nodes,
  setFocus,
  onPick,
}: {
  node: SessionNode
  nodes: SessionNode[]
  setFocus: (id: string | undefined) => void
  onPick: (id: string) => void
}) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const removeNode = useStore((s) => s.removeNode)
  const [editing, setEditing] = useState(false)
  const hidden = isHidden(node)

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
    const targetCreature = target.creatureId ? bestiary.find((b) => b.id === target.creatureId) : undefined
    const targetLeaf = isLeafType(target.type)
    return (
      <div className={'node-card alias' + (targetLeaf ? ' leaf' : '') + (hidden ? ' hidden' : '')}>
        <div className="node-card-head">
          <span className="drag-grip" title="Drag to move">⠿</span>
          <span className="alias-badge node-type-icon">↪</span>
          <span className="node-type-icon" title={target.type}>{iconFor(target)}</span>
          <span className="node-alias-card-title">{displayTitle(target)}</span>
          <span className="spacer" />
          <button className="icon-btn" title="Focus into original" onClick={() => setFocus(target.id)}>⤢</button>
          <button className="icon-btn danger" title="Remove alias" onClick={() => removeNode(node.id)}>✕</button>
        </div>
        <div className="node-card-body">
          {target.type === 'statblock' ? (
            targetCreature ? <StatBlock creature={targetCreature} /> : <div className="node-empty">No creature linked.</div>
          ) : target.type === 'image' ? (
            target.imageUrl
              ? <img className="node-card-img" src={target.imageUrl} alt={target.title} />
              : <div className="node-empty">No image set.</div>
          ) : target.body ? (
            <Markdown text={target.body} />
          ) : (
            <div className="node-empty">No notes.</div>
          )}
          {target.type === 'item' && <NodeItems node={target} />}
        </div>
      </div>
    )
  }

  const leaf = isLeafType(node.type)
  const creature = node.creatureId ? bestiary.find((b) => b.id === node.creatureId) : undefined

  return (
    <div className={'node-card' + (leaf ? ' leaf' : '') + (hidden ? ' hidden' : '')}>
      <div className="node-card-head">
        <span className="drag-grip" title="Drag to move">⠿</span>
        <span className="node-type-icon" title={node.type}>
          {iconFor(node)}
        </span>
        <input
          className="node-title"
          value={node.title}
          placeholder={placeholderFor(node)}
          onChange={(e) => updateNode(node.id, { title: e.target.value })}
        />
        <span className="spacer" />
        {node.type === 'statblock' ? (
          <button className="icon-btn" title="Link creature" onClick={() => onPick(node.id)}>
            <LinkIcon />
          </button>
        ) : (
          <button className="icon-btn" title={editing ? 'Preview' : 'Edit'} onClick={() => setEditing((v) => !v)}>
            {editing ? '▿' : '✎'}
          </button>
        )}
        <button className="icon-btn" title="Open (focus in)" onClick={() => setFocus(node.id)}>
          ⤢
        </button>
        <button
          className="icon-btn"
          title={hidden ? 'Show on board' : 'Hide from board'}
          onClick={() => updateNode(node.id, { hidden: !hidden })}
        >
          {hidden ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
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

      <div className="node-card-body">
        {node.type === 'statblock' ? (
          creature ? (
            <StatBlock creature={creature} />
          ) : (
            <button className="btn btn-sm" onClick={() => onPick(node.id)}>
              Link a creature…
            </button>
          )
        ) : node.type === 'image' ? (
          editing || !node.imageUrl ? (
            <input
              type="url"
              placeholder="Image URL…"
              value={node.imageUrl || ''}
              onChange={(e) => updateNode(node.id, { imageUrl: e.target.value })}
            />
          ) : (
            <img className="node-card-img" src={node.imageUrl} alt={node.title} />
          )
        ) : editing ? (
          <textarea
            className="node-body-edit"
            placeholder="Markdown — **bold**, # heading, - list, > quote"
            value={node.body}
            onChange={(e) => updateNode(node.id, { body: e.target.value })}
          />
        ) : node.body ? (
          <Markdown text={node.body} />
        ) : (
          <div className="node-empty">No notes. Click ✎ to edit.</div>
        )}
        {node.type === 'item' && <NodeItems node={node} />}
      </div>
    </div>
  )
}
