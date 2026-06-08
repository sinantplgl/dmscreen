import { useState } from 'react'
import { Markdown } from '../../lib/markdown'
import { PencilIcon, CopyIcon, CheckIcon } from '../../components/icons'
import type { RefImage, RefItem, RefNote, RefTable } from '../../types'

type Update = (id: string, patch: Record<string, unknown>) => void
type CardProps<T> = {
  item: T
  update: Update
  copy: (id: string) => void
  hide: (id: string) => void
}

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

export function RefItemView(props: CardProps<RefItem>) {
  if ('rows' in props.item) return <TableCard {...props} item={props.item} />
  if ('body' in props.item) return <NoteCard {...props} item={props.item} />
  return <ImageCard {...props} item={props.item} />
}
