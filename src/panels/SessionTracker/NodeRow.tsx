import { useState } from 'react'
import type { DragEvent } from 'react'
import { useStore } from '../../store/store'
import type { SessionNode } from '../../types'
import { TypePicker } from './TypePicker'
import {
  NODE_MIME,
  type DropZone,
  draggingNodeId,
  setDraggingNodeId,
  iconFor,
  isLeafType,
  childrenOf,
  siblingNumbers,
  placeholderFor,
  displayTitle,
} from './helpers'

function NumberPrefix({ node, num }: { node: SessionNode; num: number }) {
  const updateNode = useStore((s) => s.updateNode)
  const overridden = typeof node.number === 'number'
  return (
    <input
      className={'node-number' + (overridden ? ' overridden' : '')}
      value={num}
      inputMode="numeric"
      title={overridden ? 'Pinned number — clear to auto-number' : 'Auto-numbered — type to pin'}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const v = e.target.value.trim()
        const parsed = parseInt(v, 10)
        updateNode(node.id, { number: v === '' || Number.isNaN(parsed) ? undefined : parsed })
      }}
    />
  )
}

export function NodeRow({
  node,
  num,
  nodes,
  depth,
  setFocus,
  goTo,
  collapsed,
  toggleCollapsed,
  expand,
  highlightId,
}: {
  node: SessionNode
  num: number
  nodes: SessionNode[]
  depth: number
  setFocus: (id: string | undefined) => void
  goTo: (id: string) => void
  collapsed: Record<string, boolean>
  toggleCollapsed: (id: string) => void
  expand: (id: string) => void
  highlightId: string | null
}) {
  const updateNode = useStore((s) => s.updateNode)
  const removeNode = useStore((s) => s.removeNode)
  const moveNodeUp = useStore((s) => s.moveNodeUp)
  const moveNodeDown = useStore((s) => s.moveNodeDown)
  const indentNode = useStore((s) => s.indentNode)
  const outdentNode = useStore((s) => s.outdentNode)
  const moveNode = useStore((s) => s.moveNode)
  const addNode = useStore((s) => s.addNode)

  const isAlias = !!node.refId
  const aliasTarget = isAlias ? nodes.find((n) => n.id === node.refId) : undefined
  const kids = isAlias ? [] : childrenOf(nodes, node.id)
  const kidNums = siblingNumbers(kids)
  const isCollapsed = !!collapsed[node.id]
  const [dragging, setDragging] = useState(false)
  const [dropZone, setDropZone] = useState<DropZone | null>(null)
  const indent = depth * 16

  const onDragStart = (e: DragEvent) => {
    setDraggingNodeId(node.id)
    e.dataTransfer.setData(NODE_MIME, node.id)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }
  const onDragEnd = () => {
    setDraggingNodeId(null)
    setDragging(false)
    setDropZone(null)
  }
  const onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes(NODE_MIME) || draggingNodeId === node.id) return
    e.preventDefault()
    const r = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - r.top
    const raw = y < r.height * 0.3 ? 'before' : y > r.height * 0.7 ? 'after' : 'inside'
    setDropZone(isAlias && raw === 'inside' ? 'after' : raw)
  }
  const onDrop = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes(NODE_MIME)) return
    e.preventDefault()
    e.stopPropagation()
    const dragged = e.dataTransfer.getData(NODE_MIME)
    const zone = dropZone
    setDropZone(null)
    if (!dragged || dragged === node.id || !zone) return
    if (zone === 'inside') {
      moveNode(dragged, node.id, undefined)
      expand(node.id)
    } else {
      const sibs = childrenOf(nodes, node.parentId)
      const idx = sibs.findIndex((s) => s.id === node.id)
      const beforeId = zone === 'before' ? node.id : sibs[idx + 1]?.id
      moveNode(dragged, node.parentId, beforeId)
    }
  }

  const highlighted = highlightId === node.id

  return (
    <div className="node">
      <div
        className={
          'node-row' +
          (isAlias ? ' alias' : '') +
          (dragging ? ' dragging' : '') +
          (dropZone ? ' drop-' + dropZone : '') +
          (highlighted ? ' highlighted' : '')
        }
        data-node-id={node.id}
        style={{ paddingLeft: indent }}
        onDragOver={onDragOver}
        onDragLeave={() => setDropZone(null)}
        onDrop={onDrop}
      >
        <span
          className="drag-grip"
          title="Drag to move / nest"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          ⠿
        </span>
        {!isAlias && kids.length > 0 ? (
          <button
            className="node-caret"
            title={isCollapsed ? 'Expand' : 'Collapse'}
            onClick={() => toggleCollapsed(node.id)}
          >
            {isCollapsed ? '▸' : '▾'}
          </button>
        ) : (
          <span className="node-caret" />
        )}

        {isAlias ? (
          aliasTarget ? (
            <>
              <span className="node-type-icon alias-badge" title="Alias — click to jump to original">↪</span>
              <button
                className="node-alias-label"
                title={`Alias of "${aliasTarget.title || placeholderFor(aliasTarget)}" — click to jump`}
                onClick={() => goTo(aliasTarget.id)}
              >
                {iconFor(aliasTarget)} {displayTitle(aliasTarget)}
              </button>
            </>
          ) : (
            <span className="node-alias-broken">⚠ broken reference</span>
          )
        ) : (
          <>
            <TypePicker node={node} />
            <NumberPrefix node={node} num={num} />
            <input
              className="node-title"
              value={node.title}
              placeholder={placeholderFor(node)}
              onChange={(e) => updateNode(node.id, { title: e.target.value })}
            />
          </>
        )}

        <div className="node-actions">
          <button className="icon-btn" title="Move up" onClick={() => moveNodeUp(node.id)}>▲</button>
          <button className="icon-btn" title="Move down" onClick={() => moveNodeDown(node.id)}>▼</button>
          <button className="icon-btn" title="Outdent" onClick={() => outdentNode(node.id)}>⇤</button>
          {!isAlias && (
            <>
              <button className="icon-btn" title="Indent under previous" onClick={() => indentNode(node.id)}>⇥</button>
              <button className="icon-btn" title="Add child" onClick={() => { addNode(node.id, 'note'); expand(node.id) }}>＋</button>
              <button className="icon-btn" title="Focus / zoom in" onClick={() => setFocus(node.id)}>⤢</button>
            </>
          )}
          <button
            className="icon-btn danger"
            title={isAlias ? 'Remove alias' : 'Delete (with everything inside)'}
            onClick={() => {
              if (isAlias || confirm(`Delete "${node.title}" and everything inside it?`)) removeNode(node.id)
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {!isAlias && !isCollapsed &&
        kids.map((k) => (
          <NodeRow
            key={k.id}
            node={k}
            num={kidNums.get(k.id)!}
            nodes={nodes}
            depth={depth + 1}
            setFocus={setFocus}
            goTo={goTo}
            collapsed={collapsed}
            toggleCollapsed={toggleCollapsed}
            expand={expand}
            highlightId={highlightId}
          />
        ))}
    </div>
  )
}

// Re-export for leaf checks used by NodeRow's type logic
export { isLeafType }
