import { useState } from 'react'
import type { ComponentType, DragEvent, ReactNode } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { StatBlock } from '../StatBlock'
import { Board } from '../../components/Board'
import { NodeItems } from './NodeItems'
import type { SessionNode } from '../../types'
import './SessionTracker.css'
import {
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  BookIcon,
  SwordIcon,
  SwordsIcon,
  FilmIcon,
  MapIcon,
  DoorIcon,
  MageIcon,
  GemIcon,
  HookIcon,
  MusicIcon,
  NoteIcon,
  ChartIcon,
  ImageIcon,
} from '../../components/icons'

// Suggested types (icon + label). Mostly cosmetic — a node may use ANY custom
// `type` string and ANY `icon`. The exception: the LEAF content types below
// (note / statblock / image) render dedicated content and never hold children.
const NODE_TYPE_PRESETS: { type: string; Icon: ComponentType }[] = [
  { type: 'session', Icon: BookIcon },
  { type: 'quest', Icon: SwordIcon },
  { type: 'scene', Icon: FilmIcon },
  { type: 'area', Icon: MapIcon },
  { type: 'room', Icon: DoorIcon },
  { type: 'npc', Icon: MageIcon },
  { type: 'item', Icon: GemIcon },
  { type: 'encounter', Icon: SwordsIcon },
  { type: 'hook', Icon: HookIcon },
  { type: 'beat', Icon: MusicIcon },
  { type: 'note', Icon: NoteIcon },
  { type: 'statblock', Icon: ChartIcon },
  { type: 'image', Icon: ImageIcon },
]
const PRESET_ICON: Record<string, ComponentType> = Object.fromEntries(
  NODE_TYPE_PRESETS.map((p) => [p.type, p.Icon]),
)
/** A node's icon: a user-set custom character wins (any single glyph/emoji the
 *  DM types); otherwise the built-in SVG icon for its type; else a neutral dot. */
function iconFor(n: SessionNode): ReactNode {
  if (n.icon) return n.icon
  const Icon = PRESET_ICON[n.type]
  return Icon ? <Icon /> : '•'
}

/** Leaf content types: always leaves (no children / Open / add-child); render
 *  dedicated content (markdown body / stat block / image). */
const isLeafType = (type: string) => type === 'note' || type === 'statblock' || type === 'image' || type === 'item'

/** Board visibility default (decoupled from leaf-ness): leaf content types plus
 *  `item` show by default; other containers are hidden until revealed. */
const showsByDefault = (type: string) => isLeafType(type)

/** Effective board visibility: explicit `hidden` wins; otherwise per the default. */
const isHidden = (n: SessionNode) => n.hidden ?? !showsByDefault(n.type)

const childrenOf = (nodes: SessionNode[], parentId: string | undefined) =>
  nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order)

// Placeholder shown when a node has no title (names start empty now).
const placeholderFor = (n: SessionNode) => `New ${n.type}`
/** Title for read-only spots: the name, or a faded placeholder when empty. */
function displayTitle(n: SessionNode): ReactNode {
  return n.title.trim() ? n.title : <span className="muted">{placeholderFor(n)}</span>
}

/**
 * Displayed number for each node in a sibling group. Auto-increments, but a node
 * with an explicit `number` pins that value and the following siblings continue
 * from it (e.g. overrides at position 3 = 5 → 1,2,5,6,7…).
 */
function siblingNumbers(siblings: SessionNode[]): Map<string, number> {
  const out = new Map<string, number>()
  let n = 0
  for (const s of siblings) {
    n = typeof s.number === 'number' && !Number.isNaN(s.number) ? s.number : n + 1
    out.set(s.id, n)
  }
  return out
}

// ── tree drag-and-drop ───────────────────────────────────────────────────────
const NODE_MIME = 'application/x-session-node'
type DropZone = 'before' | 'after' | 'inside'
// The node currently being dragged (single drag at a time) — lets a row skip
// showing drop indicators on itself.
let draggingNodeId: string | null = null

/** Editable sibling-number prefix. Typing pins an override; clearing reverts. */
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

// ── creature link picker ─────────────────────────────────────────────────────
function CreaturePicker({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const [q, setQ] = useState('')
  const filtered = bestiary.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(440px, 95vw)' }}>
        <h2>Link a creature</h2>
        <input
          type="text"
          placeholder="Search bestiary…"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="creature-pick-list">
          {filtered.map((c) => (
            <button
              key={c.id}
              className="creature-pick"
              onClick={() => {
                updateNode(nodeId, { creatureId: c.id })
                onClose()
              }}
            >
              {c.name}
              <span className="muted" style={{ fontStyle: 'italic' }}> — {c.cr.split(' ')[0]} CR</span>
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-hint">No creatures match.</div>}
        </div>
        <div className="modal-actions">
          <button
            className="btn"
            onClick={() => {
              updateNode(nodeId, { creatureId: undefined })
              onClose()
            }}
          >
            Clear link
          </button>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── one node row (recurses into its children) ────────────────────────────────
function NodeRow({
  node,
  num,
  nodes,
  depth,
  setFocus,
  collapsed,
  toggleCollapsed,
  expand,
}: {
  node: SessionNode
  num: number
  nodes: SessionNode[]
  depth: number
  setFocus: (id: string | undefined) => void
  collapsed: Record<string, boolean>
  toggleCollapsed: (id: string) => void
  expand: (id: string) => void
}) {
  const updateNode = useStore((s) => s.updateNode)
  const removeNode = useStore((s) => s.removeNode)
  const moveNodeUp = useStore((s) => s.moveNodeUp)
  const moveNodeDown = useStore((s) => s.moveNodeDown)
  const indentNode = useStore((s) => s.indentNode)
  const outdentNode = useStore((s) => s.outdentNode)
  const moveNode = useStore((s) => s.moveNode)
  const addNode = useStore((s) => s.addNode)

  const kids = childrenOf(nodes, node.id)
  const kidNums = siblingNumbers(kids)
  const isCollapsed = !!collapsed[node.id]
  const [typeOpen, setTypeOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dropZone, setDropZone] = useState<DropZone | null>(null)
  const indent = depth * 16

  const onDragStart = (e: DragEvent) => {
    draggingNodeId = node.id
    e.dataTransfer.setData(NODE_MIME, node.id)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }
  const onDragEnd = () => {
    draggingNodeId = null
    setDragging(false)
    setDropZone(null)
  }
  const onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes(NODE_MIME) || draggingNodeId === node.id) return
    e.preventDefault()
    const r = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - r.top
    setDropZone(y < r.height * 0.3 ? 'before' : y > r.height * 0.7 ? 'after' : 'inside')
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

  return (
    <div className="node">
      <div
        className={'node-row' + (dragging ? ' dragging' : '') + (dropZone ? ' drop-' + dropZone : '')}
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
        {kids.length > 0 ? (
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
        <span className="node-type-icon" title={node.type + ' — click to change'} onClick={() => setTypeOpen((v) => !v)}>
          {iconFor(node)}
        </span>
        <NumberPrefix node={node} num={num} />
        <input
          className="node-title"
          value={node.title}
          placeholder={placeholderFor(node)}
          onChange={(e) => updateNode(node.id, { title: e.target.value })}
        />
        <div className="node-actions">
          <button className="icon-btn" title="Move up" onClick={() => moveNodeUp(node.id)}>▲</button>
          <button className="icon-btn" title="Move down" onClick={() => moveNodeDown(node.id)}>▼</button>
          <button className="icon-btn" title="Outdent" onClick={() => outdentNode(node.id)}>⇤</button>
          <button className="icon-btn" title="Indent under previous" onClick={() => indentNode(node.id)}>⇥</button>
          <button className="icon-btn" title="Add child" onClick={() => { addNode(node.id, 'note'); expand(node.id)}}>＋</button>
          <button className="icon-btn" title="Focus / zoom in" onClick={() => setFocus(node.id)}>⤢</button>
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
      </div>

      {typeOpen && (
        <div className="node-type-popover" style={{ marginLeft: indent + 22 }}>
          {NODE_TYPE_PRESETS.map((p) => (
            <button
              key={p.type}
              className="type-preset"
              onClick={() => {
                updateNode(node.id, { type: p.type, icon: undefined })
                setTypeOpen(false)
              }}
            >
              <p.Icon /> {p.type}
            </button>
          ))}
          <div className="type-custom">
            <input
              placeholder="custom type"
              defaultValue={node.type}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateNode(node.id, { type: (e.target as HTMLInputElement).value.trim() || node.type })
                  setTypeOpen(false)
                }
              }}
            />
            <input
              placeholder="icon"
              title="Custom icon — type any emoji or character to override the built-in icon. Leave blank to use the default."
              defaultValue={node.icon || ''}
              style={{ width: 64 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateNode(node.id, { icon: (e.target as HTMLInputElement).value.trim() || undefined })
                  setTypeOpen(false)
                }
              }}
            />
          </div>
        </div>
      )}

      {!isCollapsed &&
        kids.map((k) => (
          <NodeRow
            key={k.id}
            node={k}
            num={kidNums.get(k.id)!}
            nodes={nodes}
            depth={depth + 1}
            setFocus={setFocus}
            collapsed={collapsed}
            toggleCollapsed={toggleCollapsed}
            expand={expand}
          />
        ))}
    </div>
  )
}

// ── breadcrumb trail to the focused node ─────────────────────────────────────
function Breadcrumb({
  focusId,
  nodes,
  setFocus,
}: {
  focusId: string | undefined
  nodes: SessionNode[]
  setFocus: (id: string | undefined) => void
}) {
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const trail: SessionNode[] = []
  let cur = focusId ? nodes.find((n) => n.id === focusId) : undefined
  while (cur) {
    trail.unshift(cur)
    cur = cur.parentId ? nodes.find((n) => n.id === cur!.parentId) : undefined
  }
  return (
    <div className="session-breadcrumb">
      <button className="crumb" onClick={() => setFocus(undefined)}>
        Top
      </button>
      {trail.map((n) => {
        const siblings = childrenOf(nodes, n.parentId)
        const hasMenu = siblings.length > 1
        const open = menuFor === n.id
        return (<>
          <span className="crumb-caret">▸</span>
          <span className="crumb-wrap" key={n.id}>
            <button
              className="crumb"
              title={hasMenu ? 'Switch to a sibling' : undefined}
              onClick={() => (hasMenu ? setMenuFor(open ? null : n.id) : setFocus(n.id))}
            >
              {iconFor(n)} {displayTitle(n)}
              {hasMenu && <span className="crumb-caret">▾</span>}
            </button>
            {open && (
              <>
                <div className="crumb-overlay" onClick={() => setMenuFor(null)} />
                <div className="crumb-menu">
                  {(() => {
                    const nums = siblingNumbers(siblings)
                    return siblings.map((s) => (
                      <button
                        key={s.id}
                        className={'crumb-menu-item' + (s.id === n.id ? ' current' : '')}
                        onClick={() => {
                          setFocus(s.id)
                          setMenuFor(null)
                        }}
                      >
                        <span className="muted">{nums.get(s.id)}.</span> {iconFor(s)} {displayTitle(s)}
                      </button>
                    ))
                  })()}
                </div>
              </>
            )}
          </span>
        </>
        )
      })}
    </div>
  )
}

// ── one card in the board view (renders a single node's content by type) ──────
function NodeCard({
  node,
  setFocus,
  onPick,
}: {
  node: SessionNode
  setFocus: (id: string | undefined) => void
  onPick: (id: string) => void
}) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const removeNode = useStore((s) => s.removeNode)
  const [editing, setEditing] = useState(false)
  const leaf = isLeafType(node.type)
  const hidden = isHidden(node)
  const creature = node.creatureId ? bestiary.find((b) => b.id === node.creatureId) : undefined

  return (
    <div
      className={'node-card' + (leaf ? ' leaf' : '') + (hidden ? ' hidden' : '')}
    >
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
          {hidden ? <EyeSlashIcon/> : <EyeIcon/>}
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

// ── focused node's OWN content, shown atop its board ─────────────────────────
// When you zoom into a node, the board shows its children — but a node usually
// carries its own info (notes, a linked creature, an image, items). This surfaces
// those as editable cards so you can attach a creature to a statblock, add items
// to an item node, jot notes, etc. directly, instead of staring at empty space.
function FocusedContent({ node, onPick }: { node: SessionNode; onPick: (id: string) => void }) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const creature = node.creatureId ? bestiary.find((b) => b.id === node.creatureId) : undefined
  const [editingNote, setEditingNote] = useState(false)

  return (
    <div className="self-content">
      {/* Notes — every node carries a body. */}
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
      {node.type === 'statblock' && (
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
            <div className="node-empty">No creature linked — click “Link creature”.</div>
          )}
        </div>
      )}
      {node.type === 'image' && (
        <div className="self-card">
          <div className="self-card-head">
            <span className="self-card-title">Image</span>
          </div>
          <input
            type="url"
            placeholder="Image URL…"
            value={node.imageUrl || ''}
            onChange={(e) => updateNode(node.id, { imageUrl: e.target.value })}
          />
          {node.imageUrl && (
            <img className="node-card-img" src={node.imageUrl} alt={node.title} style={{ marginTop: 6 }} />
          )}
        </div>
      )}
      {node.type === 'item' && (
        <div className="self-card">
          <NodeItems node={node} />
        </div>
      )}
    </div>
  )
}

export function SessionTracker({
  config,
  onConfig,
}: {
  config?: Record<string, unknown>
  onConfig: (c: Record<string, unknown>) => void
}) {
  const nodes = useStore((s) => s.sessionNodes)
  const addNode = useStore((s) => s.addNode)
  const updateNode = useStore((s) => s.updateNode)
  const [pickerFor, setPickerFor] = useState<string | null>(null)

  // Per-panel focus (zoom). Fall back to top level if the stored id is gone.
  const storedFocus = config?.focusId as string | undefined
  const focusId = storedFocus && nodes.some((n) => n.id === storedFocus) ? storedFocus : undefined
  const setFocus = (id: string | undefined) => onConfig({ focusId: id })

  // Per-panel collapse state (which node ids are collapsed), so two trackers
  // don't share expand/collapse. Lives in this panel's config, not on the node.
  const collapsed = (config?.collapsed as Record<string, boolean> | undefined) || {}
  const toggleCollapsed = (id: string) =>
    onConfig({ collapsed: { ...collapsed, [id]: !collapsed[id] } })
  const expand = (id: string) => onConfig({ collapsed: { ...collapsed, [id]: false } })

  // Per-panel view (tree | board) + board column count + reveal-hidden toggle.
  const view = (config?.view as 'tree' | 'board') ?? 'tree'
  const boardCols = (config?.boardCols as number) ?? 12
  const showHidden = !!config?.showHidden

  const roots = childrenOf(nodes, focusId)
  const rootNums = siblingNumbers(roots)
  const atTop = focusId === undefined
  const focusNode = focusId ? nodes.find((n) => n.id === focusId) : undefined

  // Prev/Next move focus through the focused node's siblings (wrapping). Only
  // meaningful when zoomed into a node that has siblings to cycle between.
  const focusSiblings = focusId
    ? childrenOf(nodes, nodes.find((n) => n.id === focusId)?.parentId)
    : []
  const canCycle = focusSiblings.length > 1
  const cycleSibling = (dir: 1 | -1) => {
    const i = focusSiblings.findIndex((n) => n.id === focusId)
    if (i < 0) return
    setFocus(focusSiblings[(i + dir + focusSiblings.length) % focusSiblings.length].id)
  }
  // Board cards: hide containers by default (leaves shown); reveal all when toggled.
  const boardItems = showHidden ? roots : roots.filter((n) => !isHidden(n))
  const hiddenCount = roots.filter((n) => isHidden(n)).length

  const addHere = () => {
    const id = addNode(focusId, atTop ? 'session' : 'note')
    if (view === 'board') {
      // Explicitly visible — a card you added to the board should show even if its
      // type would otherwise default to hidden.
      const bottomY = roots.reduce((m, n) => Math.max(m, (n.layout?.y ?? 0) + (n.layout?.h ?? 0)), 0)
      updateNode(id, { layout: { x: 0, y: bottomY, w: Math.min(6, boardCols), h: 6 }, hidden: false })
    } else {
      setFocus(id)
    }
  }

  return (
    <div className="session-tracker">
      <div className="session-head">
        <Breadcrumb focusId={focusId} nodes={nodes} setFocus={setFocus} />
        <div className="flex-row" style={{ gap: 6, marginTop: 6 }}>
          <button
            className="btn btn-accent"
            onClick={addHere}
            title={view === 'board' ? 'Add a card' : atTop ? 'Add a top-level session' : 'Add a child node'}
          >
            {view === 'board' ? '+ Card' : atTop ? '+ Session' : '+ Node'}
          </button>
          <span className="view-toggle">
            <button
              className={'btn' + (view === 'tree' ? ' btn-accent' : '')}
              onClick={() => onConfig({ view: 'tree' })}
            >
              Tree
            </button>
            <button
              className={'btn' + (view === 'board' ? ' btn-accent' : '')}
              onClick={() => onConfig({ view: 'board' })}
            >
              Board
            </button>
          </span>
          {view === 'board' && (
            <>
              <label className="ref-cols-ctl" title="Board columns — fewer = larger cards">
                Cols
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={boardCols}
                  onChange={(e) =>
                    onConfig({ boardCols: Math.max(1, Math.min(24, parseInt(e.target.value) || 12)) })
                  }
                />
              </label>
              <button
                className={'btn' + (showHidden ? ' btn-accent' : '')}
                title="Reveal cards hidden from the board"
                onClick={() => onConfig({ showHidden: !showHidden })}
              >
                {showHidden ? <><EyeIcon/> Hidden</> : <><EyeSlashIcon/>{` Hidden${hiddenCount ? ` (${hiddenCount})` : ''}`}</>}
              </button>
            </>
          )}
          <span className="spacer" />
          <span className="session-step">
            <button
              className="btn"
              title="Focus the previous sibling"
              disabled={!canCycle}
              onClick={() => cycleSibling(-1)}
            >
              ◀ Prev
            </button>
            <button
              className="btn"
              title="Focus the next sibling"
              disabled={!canCycle}
              onClick={() => cycleSibling(1)}
            >
              Next ▶
            </button>
          </span>
        </div>
      </div>

      <div className="session-tree-body">
        {view === 'board' ? (
          <>
            {focusNode && <FocusedContent node={focusNode} onPick={setPickerFor} />}
            {boardItems.length === 0 ? (
              <div className="empty-hint">
                {roots.length === 0
                  ? atTop
                    ? 'No sessions yet — click “+ Card”.'
                    : 'No child cards yet — click “+ Card” to add one.'
                  : `All ${hiddenCount} card(s) hidden — click the “Hidden” toggle to reveal.`}
              </div>
            ) : (
            <Board
              items={boardItems}
              cols={boardCols}
              layoutOf={(n) => n.layout}
              onLayout={(id, box) => updateNode(id, { layout: box })}
              defaultBox={(_, i) => ({
                x: (i % 2) * 6,
                y: Math.floor(i / 2) * 6,
                w: Math.min(6, boardCols),
                h: 6,
              })}
              renderItem={(n) => (
                <NodeCard
                  node={n}
                  setFocus={setFocus}
                  onPick={setPickerFor}
                />
              )}
            />
            )}
          </>
        ) : roots.length === 0 ? (
          <div className="empty-hint">
            {atTop ? 'No sessions yet. Click “+ Session”.' : 'Nothing here yet. Click “+ Node”.'}
          </div>
        ) : (
          roots.map((n) => (
            <NodeRow
              key={n.id}
              node={n}
              num={rootNums.get(n.id)!}
              nodes={nodes}
              depth={0}
              setFocus={setFocus}
              collapsed={collapsed}
              toggleCollapsed={toggleCollapsed}
              expand={expand}
            />
          ))
        )}
      </div>

      {pickerFor && <CreaturePicker nodeId={pickerFor} onClose={() => setPickerFor(null)} />}
    </div>
  )
}
