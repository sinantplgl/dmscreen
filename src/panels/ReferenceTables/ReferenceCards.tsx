import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Markdown } from '../../lib/markdown'
import { PencilIcon, CopyIcon, CheckIcon } from '../../components/icons'
import type { RefImage, RefItem, RefNote, RefTable } from '../../types'

type Update = (id: string, patch: Record<string, unknown>) => void

export type CardSettings = {
  fontSize?: number
  contentCols?: number
  showLabels?: boolean
  /** Per-card title-bar tint (hex). Falls back to the node's legacy `color`. */
  color?: string
}

const DEFAULT_FONT = 13
const DEFAULT_COLS = 1

type CardProps<T> = {
  item: T
  update: Update
  copy: (id: string) => void
  hide: (id: string) => void
  settings: CardSettings
  onSettings: (s: CardSettings) => void
  dimmed?: boolean
  matched?: boolean
}

function CardHeader({
  item,
  editing,
  setEditing,
  update,
  copy,
  hide,
  settings,
  onSettings,
  allowColumns,
}: {
  item: RefItem
  editing: boolean
  setEditing: (fn: (v: boolean) => boolean) => void
  update: Update
  copy: (id: string) => void
  hide: (id: string) => void
  settings: CardSettings
  onSettings: (s: CardSettings) => void
  allowColumns: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  const fontSize = settings.fontSize ?? DEFAULT_FONT
  const contentCols = settings.contentCols ?? DEFAULT_COLS
  const setFont = (n: number) => onSettings({ ...settings, fontSize: Math.max(8, Math.min(20, n)) })
  const setCols = (n: number) => onSettings({ ...settings, contentCols: Math.max(1, Math.min(4, n)) })

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
    }
    setMenuOpen((v) => !v)
  }

  // The menu is rendered as a sibling of .table-title (not inside it) so that
  // .book-table .table-title button in parchment.css doesn't colour stepper buttons.
  return (
    <>
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
          <button className="ref-tool-btn" onClick={() => copy(item.id)} title="Duplicate into the library">
            <CopyIcon />
          </button>
          <button ref={btnRef} className="ref-tool-btn" onClick={openMenu} title="Card display settings">
            ⋯
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
      {menuOpen && (
        <>
          <div className="ref-lib-overlay" onClick={() => setMenuOpen(false)} />
          <div className="ref-settings-menu" style={{ top: menuPos.top, right: menuPos.right }}>
            <span>Font size</span>
            <div className="ref-stepper">
              <button className="ref-stepper-btn" onClick={() => setFont(fontSize - 1)} title="Smaller text">
                A−
              </button>
              <button className="ref-stepper-btn" onClick={() => setFont(fontSize + 1)} title="Larger text">
                A+
              </button>
            </div>
            {allowColumns && (
              <>
                <span>Columns</span>
                <div className="ref-stepper">
                  <button className="ref-stepper-btn" onClick={() => setCols(contentCols - 1)} title="Fewer columns">
                    −
                  </button>
                  <button className="ref-stepper-btn" onClick={() => setCols(contentCols + 1)} title="More columns">
                    +
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}

function bodyStyle(fontSize: number): CSSProperties {
  return { ['--ref-font-size' as string]: `${fontSize}px` } as CSSProperties
}

function TableCard({ item, update, copy, hide, settings, onSettings, dimmed, matched }: CardProps<RefTable>) {
  const [editing, setEditing] = useState(false)
  const fontSize = settings.fontSize ?? DEFAULT_FONT

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
    <div className={'book-table' + (dimmed ? ' ref-dimmed' : '') + (matched ? ' ref-match' : '')}>
      <CardHeader
        item={item}
        editing={editing}
        setEditing={setEditing}
        update={update}
        copy={copy}
        hide={hide}
        settings={settings}
        onSettings={onSettings}
        allowColumns={false}
      />
      <div className="ref-card-body" style={bodyStyle(fontSize)}>
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
    </div>
  )
}

function NoteCard({ item, update, copy, hide, settings, onSettings, dimmed, matched }: CardProps<RefNote>) {
  const [editing, setEditing] = useState(false)
  const fontSize = settings.fontSize ?? DEFAULT_FONT
  const contentCols = settings.contentCols ?? DEFAULT_COLS
  return (
    <div className={'book-table' + (dimmed ? ' ref-dimmed' : '') + (matched ? ' ref-match' : '')}>
      <CardHeader
        item={item}
        editing={editing}
        setEditing={setEditing}
        update={update}
        copy={copy}
        hide={hide}
        settings={settings}
        onSettings={onSettings}
        allowColumns
      />
      <div className="ref-card-body" style={bodyStyle(fontSize)}>
        {editing ? (
          <textarea
            className="ref-note-edit"
            placeholder="Markdown supported — **bold**, *italic*, # heading, - list, > quote, `code`"
            value={item.body}
            onChange={(e) => update(item.id, { body: e.target.value })}
          />
        ) : item.body ? (
          <div
            className="ref-card-content"
            style={{ columnCount: contentCols > 1 ? contentCols : undefined }}
          >
            <Markdown text={item.body} />
          </div>
        ) : (
          <div className="ref-empty">Empty note — click Edit to add text.</div>
        )}
      </div>
    </div>
  )
}

function ImageCard({ item, update, copy, hide, settings, onSettings, dimmed, matched }: CardProps<RefImage>) {
  const [editing, setEditing] = useState(false)
  const fontSize = settings.fontSize ?? DEFAULT_FONT
  return (
    <div className={'book-table' + (dimmed ? ' ref-dimmed' : '') + (matched ? ' ref-match' : '')}>
      <CardHeader
        item={item}
        editing={editing}
        setEditing={setEditing}
        update={update}
        copy={copy}
        hide={hide}
        settings={settings}
        onSettings={onSettings}
        allowColumns={false}
      />
      <div className="ref-card-body" style={bodyStyle(fontSize)}>
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
    </div>
  )
}

export function RefItemView(props: CardProps<RefItem>) {
  if ('rows' in props.item) return <TableCard {...props} item={props.item} />
  if ('body' in props.item) return <NoteCard {...props} item={props.item} />
  return <ImageCard {...props} item={props.item} />
}
