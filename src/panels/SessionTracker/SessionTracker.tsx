import { useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { StatBlock } from '../StatBlock'
import { Board } from '../../components/Board'
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
const isLeafType = (type: string) => type === 'note' || type === 'statblock' || type === 'image'

/** Effective board visibility: explicit `hidden` wins; otherwise containers are
 *  hidden by default and leaf content nodes are shown. */
const isHidden = (n: SessionNode) => n.hidden ?? !isLeafType(n.type)

const childrenOf = (nodes: SessionNode[], parentId: string | undefined) =>
  nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order)

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
  nodes,
  depth,
  setFocus,
  onPick,
  collapsed,
  toggleCollapsed,
  expand,
}: {
  node: SessionNode
  nodes: SessionNode[]
  depth: number
  setFocus: (id: string | undefined) => void
  onPick: (id: string) => void
  collapsed: Record<string, boolean>
  toggleCollapsed: (id: string) => void
  expand: (id: string) => void
}) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const removeNode = useStore((s) => s.removeNode)
  const moveNodeUp = useStore((s) => s.moveNodeUp)
  const moveNodeDown = useStore((s) => s.moveNodeDown)
  const indentNode = useStore((s) => s.indentNode)
  const outdentNode = useStore((s) => s.outdentNode)
  const addNode = useStore((s) => s.addNode)

  const kids = childrenOf(nodes, node.id)
  const isCollapsed = !!collapsed[node.id]
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const creature = node.creatureId ? bestiary.find((b) => b.id === node.creatureId) : undefined
  const indent = depth * 16

  return (
    <div className="node">
      <div className="node-row" style={{ paddingLeft: indent }}>
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
        <input
          className="node-title"
          value={node.title}
          onChange={(e) => updateNode(node.id, { title: e.target.value })}
        />
        <button className="icon-btn" title="Details" onClick={() => setOpen((v) => !v)}>
          {open ? '▿' : '…'}
        </button>
        <div className="node-actions">
          <button className="icon-btn" title="Move up" onClick={() => moveNodeUp(node.id)}>▲</button>
          <button className="icon-btn" title="Move down" onClick={() => moveNodeDown(node.id)}>▼</button>
          <button className="icon-btn" title="Outdent" onClick={() => outdentNode(node.id)}>⇤</button>
          <button className="icon-btn" title="Indent under previous" onClick={() => indentNode(node.id)}>⇥</button>
          {!isLeafType(node.type) && (
            <button
              className="icon-btn"
              title="Add child"
              onClick={() => {
                addNode(node.id, 'note')
                expand(node.id)
              }}
            >
              ＋
            </button>
          )}
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

      {open && (
        <div className="node-detail" style={{ marginLeft: indent + 22 }}>
          <div className="flex-row" style={{ gap: 6, marginBottom: 4 }}>
            <button className="btn btn-sm" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Preview' : 'Edit'}
            </button>
            <button className="btn btn-sm" onClick={() => onPick(node.id)}>
              {creature ? 'Change creature' : 'Link creature'}
            </button>
            <span className="spacer" />
          </div>
          {editing ? (
            <>
              <textarea
                className="node-body-edit"
                placeholder="Markdown — **bold**, # heading, - list, > quote, `code`"
                value={node.body}
                onChange={(e) => updateNode(node.id, { body: e.target.value })}
              />
              <input
                type="url"
                placeholder="Image URL (map / portrait)…"
                value={node.imageUrl || ''}
                onChange={(e) => updateNode(node.id, { imageUrl: e.target.value })}
                style={{ marginTop: 6 }}
              />
            </>
          ) : node.body ? (
            <Markdown text={node.body} />
          ) : (
            <div className="node-empty">No notes. Click Edit.</div>
          )}
          {node.imageUrl && <img className="node-image" src={node.imageUrl} alt={node.title} />}
          {creature && (
            <div style={{ marginTop: 8 }}>
              <StatBlock creature={creature} />
            </div>
          )}
        </div>
      )}

      {!isCollapsed &&
        kids.map((k) => (
          <NodeRow
            key={k.id}
            node={k}
            nodes={nodes}
            depth={depth + 1}
            setFocus={setFocus}
            onPick={onPick}
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
              {iconFor(n)} {n.title}
              {hasMenu && <span className="crumb-caret">▾</span>}
            </button>
            {open && (
              <>
                <div className="crumb-overlay" onClick={() => setMenuFor(null)} />
                <div className="crumb-menu">
                  {siblings.map((s) => (
                    <button
                      key={s.id}
                      className={'crumb-menu-item' + (s.id === n.id ? ' current' : '')}
                      onClick={() => {
                        setFocus(s.id)
                        setMenuFor(null)
                      }}
                    >
                      {iconFor(s)} {s.title}
                    </button>
                  ))}
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
  const leaf = isLeafType(node.type)
  const hidden = isHidden(node)
  const kids = childrenOf(nodes, node.id)
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
        {!leaf && kids.length > 0 && (
          <button className="icon-btn" title="Open (focus in)" onClick={() => setFocus(node.id)}>
            ⤢
          </button>
        )}
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
      </div>
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
  const atTop = focusId === undefined

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
          boardItems.length === 0 ? (
            <div className="empty-hint">
              {roots.length === 0
                ? atTop
                  ? 'No sessions yet — click “+ Card”.'
                  : 'Nothing here yet — click “+ Card”.'
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
                <NodeCard node={n} nodes={nodes} setFocus={setFocus} onPick={setPickerFor} />
              )}
            />
          )
        ) : roots.length === 0 ? (
          <div className="empty-hint">
            {atTop ? 'No sessions yet. Click “+ Session”.' : 'Nothing here yet. Click “+ Node”.'}
          </div>
        ) : (
          roots.map((n) => (
            <NodeRow
              key={n.id}
              node={n}
              nodes={nodes}
              depth={0}
              setFocus={setFocus}
              onPick={setPickerFor}
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
