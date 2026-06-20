import { useState } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { StatBlock } from '../StatBlock'
import { ImageField } from '../../components/ImageField'
import { sectionsFor } from './sections'
import { baseTypeOf, notesVisible } from './helpers'
import type { SessionNode } from '../../types'

export function FocusedContent({ node, onPick }: { node: SessionNode; onPick: (id: string) => void }) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const base = baseTypeOf(node.type, customNodeTypes)
  const creature = node.creatureId ? bestiary.find((b) => b.id === node.creatureId) : undefined
  const [editingNote, setEditingNote] = useState(false)
  const [editingImage, setEditingImage] = useState(false)

  return (
    <div className="self-content">
      {base === 'image' && (
        <div className="self-card">
          <div className="self-card-head">
            <span className="self-card-title">Image</span>
            <span className="spacer" />
            <button
              className="icon-btn"
              title={editingImage ? 'Done' : 'Edit'}
              onClick={() => setEditingImage((v) => !v)}
            >
              {editingImage ? '▿' : '✎'}
            </button>
          </div>
          <ImageField
            imageUrl={node.imageUrl}
            onImageUrlChange={(url) => updateNode(node.id, { imageUrl: url })}
            editing={editingImage}
            editable
            alt={node.title}
          />
        </div>
      )}
      {base === 'statblock' && (
        <div className="self-card">
          <div className="self-card-head">
            <span className="self-card-title">Stat Block</span>
            <span className="spacer" />
            <button className="btn btn-sm" onClick={() => onPick(node.id)}>
              {creature ? 'Change creature' : 'Link creature'}
            </button>
          </div>
          {creature ? (
            <StatBlock creature={creature} />
          ) : (
            <div className="node-empty">No creature linked — click "Link creature".</div>
          )}
        </div>
      )}
      {notesVisible(node, base) && (
        <div className="self-card">
          <div className="self-card-head">
            <span className="self-card-title">Notes</span>
            <span className="spacer" />
            <button
              className="icon-btn"
              title={editingNote ? 'Preview' : 'Edit'}
              onClick={() => setEditingNote((v) => !v)}
            >
              {editingNote ? '▿' : '✎'}
            </button>
          </div>
          {editingNote ? (
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
        </div>
      )}
      {sectionsFor(base).map(({ key, Component }) => (
        <div className="self-card" key={key}>
          <Component node={node} resizable={false} />
        </div>
      ))}
    </div>
  )
}
