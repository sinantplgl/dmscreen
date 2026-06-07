import { useState } from 'react'
import './ReferenceTables.css'
import { Board } from '../../components/Board'
import { Checkbox } from '../../components/Checkbox'
import { useStore } from '../../store/store'
import { uid } from '../../lib/dnd'
import { Markdown } from '../../lib/markdown'
import type { RefImage, RefItem, RefNote, RefTable } from '../../types'

const DEFAULT_COLS = 12
type Update = (id: string, patch: Record<string, unknown>) => void
type CardProps<T> = {
  item: T
  update: Update
  remove: (id: string) => void
  copy: (id: string) => void
}

// ── shared card header: drag grip (handle) + title + edit/copy/delete ─────────
function CardHeader({
  item,
  editing,
  setEditing,
  update,
  remove,
  copy,
}: {
  item: RefItem
  editing: boolean
  setEditing: (fn: (v: boolean) => boolean) => void
  update: Update
  remove: (id: string) => void
  copy: (id: string) => void
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
      <div className="row-tools">
        <button onClick={() => setEditing((v) => !v)}>{editing ? 'Done' : 'Edit'}</button>
        <button onClick={() => copy(item.id)} title="Duplicate">
          Copy
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${item.title}"?`)) remove(item.id)
          }}
        >
          Del
        </button>
      </div>
    </div>
  )
}

// ── TABLE ────────────────────────────────────────────────────────────────────
function TableCard({ item, update, remove, copy }: CardProps<RefTable>) {
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
      <CardHeader item={item} editing={editing} setEditing={setEditing} update={update} remove={remove} copy={copy} />
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
function NoteCard({ item, update, remove, copy }: CardProps<RefNote>) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="book-table">
      <CardHeader item={item} editing={editing} setEditing={setEditing} update={update} remove={remove} copy={copy} />
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
function ImageCard({ item, update, remove, copy }: CardProps<RefImage>) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="book-table">
      <CardHeader item={item} editing={editing} setEditing={setEditing} update={update} remove={remove} copy={copy} />
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
  // The app's built-in reference tables — the library a panel can pull from.
  // A fresh panel starts EMPTY; the user opts into the bits they want.
  const library = useStore((s) => s.tables)
  const stored = config?.refItems as RefItem[] | undefined
  const cols = (config?.refCols as number) ?? DEFAULT_COLS
  const [libOpen, setLibOpen] = useState(false)

  const items = stored ?? []
  const setItems = (next: RefItem[]) => onConfig({ refItems: next })
  const update: Update = (id, patch) =>
    setItems(items.map((it) => (it.id === id ? (Object.assign({}, it, patch) as RefItem) : it)))
  const removeItem = (id: string) => setItems(items.filter((it) => it.id !== id))
  const copyItem = (id: string) => {
    const src = items.find((it) => it.id === id)
    if (!src) return
    const base = src.layout ?? { x: 0, y: 0, w: 6, h: 8 }
    const layout = { x: base.x, y: base.y + base.h, w: base.w, h: base.h }
    const title = `${src.title} (copy)`
    let copy: RefItem
    if ('rows' in src) {
      copy = {
        ...src,
        id: uid('ref'),
        title,
        layout,
        rows: src.rows.map((r) => [...r]),
        columns: [...src.columns],
      }
    } else {
      copy = { ...src, id: uid('ref'), title, layout }
    }
    setItems([...items, copy])
  }

  const bottomY = items.reduce((m, it) => Math.max(m, (it.layout?.y ?? 0) + (it.layout?.h ?? 0)), 0)
  const addItem = (kind: 'table' | 'note' | 'image') => {
    const id = uid('ref')
    const layout = { x: 0, y: bottomY, w: Math.min(6, cols), h: 6 }
    const it: RefItem =
      kind === 'table'
        ? { id, kind: 'table', title: 'New Table', columns: ['Column A', 'Column B'], rows: [['', '']], layout }
        : kind === 'note'
          ? { id, kind: 'note', title: 'New Note', body: '', layout }
          : { id, kind: 'image', title: 'New Image', url: '', caption: '', layout }
    setItems([...items, it])
  }

  // A built-in item keeps its stable id when placed, so its checkbox reflects
  // whether it's currently on the board. Toggling adds or removes that card.
  const onBoardIds = new Set(items.map((it) => it.id))
  const toggleBuiltin = (src: RefItem) => {
    if (onBoardIds.has(src.id)) {
      setItems(items.filter((it) => it.id !== src.id))
      return
    }
    const layout = { x: 0, y: bottomY, w: Math.min(6, cols), h: 8 }
    const placed: RefItem =
      'rows' in src
        ? { ...src, builtin: false, layout, rows: src.rows.map((r) => [...r]), columns: [...src.columns] }
        : { ...src, builtin: false, layout }
    setItems([...items, placed])
  }

  return (
    <div>
      <div className="flex-row" style={{ gap: 6, marginBottom: 6 }}>
        {library.length > 0 && (
          <div className="ref-lib-wrap">
            <button
              className={'btn btn-sm' + (libOpen ? ' btn-accent' : '')}
              onClick={() => setLibOpen((v) => !v)}
              title="Pick which built-in reference tables to show"
            >
              Built-in ▾
            </button>
            {libOpen && (
              <>
                <div className="ref-lib-overlay" onClick={() => setLibOpen(false)} />
                <div className="ref-lib-menu">
                  <div className="ref-lib-head">Built-in references</div>
                  {library.map((tbl) => (
                    <div key={tbl.id} className="ref-lib-item">
                      <Checkbox
                        checked={onBoardIds.has(tbl.id)}
                        onChange={() => toggleBuiltin(tbl)}
                        label={tbl.title}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <button className="btn btn-sm" onClick={() => addItem('table')}>
          + Table
        </button>
        <button className="btn btn-sm" onClick={() => addItem('note')}>
          + Note
        </button>
        <button className="btn btn-sm" onClick={() => addItem('image')}>
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

      {items.length === 0 ? (
        <div className="empty-hint">
          Empty board — pick from <strong>Built-in</strong> references, or add your own table, note,
          or image.
        </div>
      ) : (
        <Board
          items={items}
          cols={cols}
          layoutOf={(it) => it.layout}
          onLayout={(id, b) => update(id, { layout: b })}
          defaultBox={{ x: 0, y: 0, w: Math.min(6, cols), h: 6 }}
          itemClassName="parchment"
          renderItem={(it) => (
            <RefItemView item={it} update={update} remove={removeItem} copy={copyItem} />
          )}
        />
      )}
    </div>
  )
}
