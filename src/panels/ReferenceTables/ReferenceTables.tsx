import { useState } from 'react'
import './ReferenceTables.css'
import { Board } from '../../components/Board'
import type { Box } from '../../components/Board/Board'
import { Checkbox } from '../../components/Checkbox'
import { PencilIcon, CopyIcon, CheckIcon } from '../../components/icons'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import type { RefImage, RefItem, RefNote, RefTable } from '../../types'

const DEFAULT_COLS = 12
type Update = (id: string, patch: Record<string, unknown>) => void
type CardProps<T> = {
  item: T
  update: Update
  copy: (id: string) => void
  hide: (id: string) => void
}

// ── shared card header: drag grip (handle) + title + edit/copy/remove ─────────
function CardHeader({
  item,
  editing,
  setEditing,
  update,
  copy,
  hide,
}: {
  item: RefItem
  editing: boolean
  setEditing: (fn: (v: boolean) => boolean) => void
  update: Update
  copy: (id: string) => void
  hide: (id: string) => void
}) {
  return (
    <div className="table-title ref-head">
      <span className="drag-grip" title="Drag to move">
        ⠿
      </span>
      {editing ? (
        <input
          value={item.title}
          onChange={(e) => update(item.id, { title: e.target.value })}
          style={{ maxWidth: 160 }}
        />
      ) : (
        <span className="ref-title-text">{item.title}</span>
      )}
      <span className="spacer" />
      <div className="row-tools ref-head-tools">
        <button
          className="ref-tool-btn"
          onClick={() => setEditing((v) => !v)}
          title={editing ? 'Done editing' : 'Edit content (shared everywhere)'}
        >
          {editing ? <CheckIcon /> : <PencilIcon />}
        </button>
        <button
          className="ref-tool-btn"
          onClick={() => copy(item.id)}
          title="Duplicate into the library"
        >
          <CopyIcon />
        </button>
        <button
          className="ref-tool-btn"
          onClick={() => hide(item.id)}
          title="Remove from this panel (kept in the library)"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ── TABLE ────────────────────────────────────────────────────────────────────
function TableCard({ item, update, copy, hide }: CardProps<RefTable>) {
  const [editing, setEditing] = useState(false)

  const setCell = (r: number, c: number, val: string) => {
    const rows = item.rows.map((row) => [...row])
    rows[r][c] = val
    update(item.id, { rows })
  }
  const setHeader = (c: number, val: string) => {
    const columns = [...item.columns]
    columns[c] = val
    update(item.id, { columns })
  }
  const addRow = () => update(item.id, { rows: [...item.rows, item.columns.map(() => '')] })
  const removeRow = (r: number) => update(item.id, { rows: item.rows.filter((_, i) => i !== r) })
  const addColumn = () =>
    update(item.id, {
      columns: [...item.columns, `Column ${item.columns.length + 1}`],
      rows: item.rows.map((row) => [...row, '']),
    })
  const removeColumn = () => {
    if (item.columns.length <= 1) return
    update(item.id, {
      columns: item.columns.slice(0, -1),
      rows: item.rows.map((row) => row.slice(0, -1)),
    })
  }

  return (
    <div className="book-table">
      <CardHeader item={item} editing={editing} setEditing={setEditing} update={update} copy={copy} hide={hide} />
      <table>
        <thead>
          <tr>
            {item.columns.map((col, c) => (
              <th key={c}>
                {editing ? (
                  <input value={col} onChange={(e) => setHeader(c, e.target.value)} />
                ) : (
                  col
                )}
              </th>
            ))}
            {editing && <th style={{ width: 1 }} />}
          </tr>
        </thead>
        <tbody>
          {item.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  {editing ? (
                    <input value={cell} onChange={(e) => setCell(r, c, e.target.value)} />
                  ) : (
                    cell
                  )}
                </td>
              ))}
              {editing && (
                <td>
                  <button className="icon-btn danger" onClick={() => removeRow(r)} title="Remove row">
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <div className="row-tools" style={{ marginTop: 8 }}>
          <button onClick={addRow}>+ Row</button>
          <button onClick={addColumn}>+ Col</button>
          <button onClick={removeColumn}>− Col</button>
        </div>
      )}
    </div>
  )
}

// ── NOTE ───────────────────────────────────────────────────────────────────
function NoteCard({ item, update, copy, hide }: CardProps<RefNote>) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="book-table">
      <CardHeader item={item} editing={editing} setEditing={setEditing} update={update} copy={copy} hide={hide} />
      {editing ? (
        <textarea
          className="ref-note-edit"
          placeholder="Markdown supported — **bold**, *italic*, # heading, - list, > quote, `code`"
          value={item.body}
          onChange={(e) => update(item.id, { body: e.target.value })}
        />
      ) : item.body ? (
        <Markdown text={item.body} />
      ) : (
        <div className="ref-empty">Empty note — click Edit to add text.</div>
      )}
    </div>
  )
}

// ── IMAGE ──────────────────────────────────────────────────────────────────
function ImageCard({ item, update, copy, hide }: CardProps<RefImage>) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="book-table">
      <CardHeader item={item} editing={editing} setEditing={setEditing} update={update} copy={copy} hide={hide} />
      {editing ? (
        <div className="ref-image-edit">
          <input
            type="url"
            placeholder="Image URL — https://…"
            value={item.url}
            onChange={(e) => update(item.id, { url: e.target.value })}
          />
          <input
            placeholder="Caption (optional)"
            value={item.caption ?? ''}
            onChange={(e) => update(item.id, { caption: e.target.value })}
          />
        </div>
      ) : (
        <figure className="ref-image">
          {item.url ? (
            <img src={item.url} alt={item.caption || item.title} />
          ) : (
            <div className="ref-empty">No image URL — click Edit to add one.</div>
          )}
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      )}
    </div>
  )
}

function RefItemView(props: CardProps<RefItem>) {
  if ('rows' in props.item) return <TableCard {...props} item={props.item} />
  if ('body' in props.item) return <NoteCard {...props} item={props.item} />
  return <ImageCard {...props} item={props.item} />
}

export function ReferenceTables({
  config,
  onConfig,
}: {
  config?: Record<string, unknown>
  onConfig: (c: Record<string, unknown>) => void
}) {
  // The shared reference library (every reference item that exists, across all
  // campaigns). This panel just picks WHICH of them to show, and where.
  const library = useStore((s) => s.tables)
  const addRefItem = useStore((s) => s.addRefItem)
  const updateRefItem = useStore((s) => s.updateRefItem)
  const removeRefItem = useStore((s) => s.removeRefItem)
  const copyRefItem = useStore((s) => s.copyRefItem)

  // Per-panel: which library items are shown here, their board layout, grid cols.
  const shownIds = (config?.refShownIds as string[]) ?? []
  const layouts = (config?.refLayouts as Record<string, Box>) ?? {}
  const cols = (config?.refCols as number) ?? DEFAULT_COLS
  const [pickOpen, setPickOpen] = useState(false)

  // Resolve ids → live library items, dropping any that were deleted elsewhere.
  const byId = new Map(library.map((it) => [it.id, it]))
  const shown = shownIds.map((id) => byId.get(id)).filter((it): it is RefItem => !!it)

  const bottomY = shown.reduce((m, it) => {
    const b = layouts[it.id]
    return b ? Math.max(m, b.y + b.h) : m
  }, 0)

  const showOnPanel = (id: string) => {
    if (shownIds.includes(id)) return
    const box: Box = { x: 0, y: bottomY, w: Math.min(6, cols), h: 8 }
    onConfig({ refShownIds: [...shownIds, id], refLayouts: { ...layouts, [id]: box } })
  }
  const hideFromPanel = (id: string) => onConfig({ refShownIds: shownIds.filter((x) => x !== id) })
  const setLayout = (id: string, box: Box) => onConfig({ refLayouts: { ...layouts, [id]: box } })

  // Create a brand-new library item and immediately show it on this panel.
  const createItem = (kind: 'table' | 'note' | 'image') => showOnPanel(addRefItem(kind))
  // Duplicate an item into the library and show the copy here.
  const copyItem = (id: string) => showOnPanel(copyRefItem(id))
  // Delete an item from the library entirely (affects every panel & campaign).
  const deleteFromLibrary = (item: RefItem) => {
    if (!confirm(`Delete "${item.title}" from the reference library? It will disappear from every panel.`))
      return
    removeRefItem(item.id)
    if (shownIds.includes(item.id)) hideFromPanel(item.id)
  }

  return (
    <div>
      <div className="flex-row" style={{ gap: 6, marginBottom: 6 }}>
        <div className="ref-lib-wrap">
          <button
            className={'btn btn-sm' + (pickOpen ? ' btn-accent' : '')}
            onClick={() => setPickOpen((v) => !v)}
            title="Choose which reference items to show on this panel"
          >
            References ▾
          </button>
          {pickOpen && (
            <>
              <div className="ref-lib-overlay" onClick={() => setPickOpen(false)} />
              <div className="ref-lib-menu">
                <div className="ref-lib-head">Show on this panel</div>
                {library.length === 0 ? (
                  <div className="ref-lib-empty">
                    No references yet — create one with the + buttons.
                  </div>
                ) : (
                  library.map((it) => (
                    <div key={it.id} className="ref-lib-item">
                      <Checkbox
                        checked={shownIds.includes(it.id)}
                        onChange={() => (shownIds.includes(it.id) ? hideFromPanel(it.id) : showOnPanel(it.id))}
                        label={it.title}
                      />
                      <button
                        className="icon-btn danger ref-lib-del"
                        title="Delete from library (removes it everywhere)"
                        onClick={() => deleteFromLibrary(it)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        <button className="btn btn-sm" onClick={() => createItem('table')}>
          + Table
        </button>
        <button className="btn btn-sm" onClick={() => createItem('note')}>
          + Note
        </button>
        <button className="btn btn-sm" onClick={() => createItem('image')}>
          + Image
        </button>
        <span className="spacer" />
        <label className="ref-cols-ctl" title="Grid columns — fewer = larger cells">
          Columns
          <input
            type="number"
            min={1}
            max={24}
            value={cols}
            onChange={(e) =>
              onConfig({ refCols: Math.max(1, Math.min(24, parseInt(e.target.value) || DEFAULT_COLS)) })
            }
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <div className="empty-hint">
          Nothing shown here yet — open <strong>References</strong> to pick from your library, or add a
          new table, note, or image with the + buttons.
        </div>
      ) : (
        <Board
          items={shown}
          cols={cols}
          layoutOf={(it) => layouts[it.id]}
          onLayout={setLayout}
          defaultBox={{ x: 0, y: 0, w: Math.min(6, cols), h: 6 }}
          itemClassName="parchment"
          renderItem={(it) => (
            <RefItemView item={it} update={updateRefItem} copy={copyItem} hide={hideFromPanel} />
          )}
        />
      )}
    </div>
  )
}
