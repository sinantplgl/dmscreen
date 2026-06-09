import { useState } from 'react'
import './ReferenceTables.css'
import { Board } from '../../components/Board'
import type { Box } from '../../components/Board/Board'
import { Checkbox } from '../../components/Checkbox'
import { useStore } from '../../store/store'
import { confirmDialog } from '../../lib/dialog'
import type { RefItem } from '../../types'
import { RefItemView, type CardSettings } from './ReferenceCards'

const DEFAULT_COLS = 12

/** Does a card's text content contain the query? Searches title + type-specific body. */
function cardMatches(item: RefItem, q: string): boolean {
  const hay: string[] = [item.title]
  if ('rows' in item) hay.push(...item.columns, ...item.rows.flat())
  else if ('body' in item) hay.push(item.body)
  else if (item.caption) hay.push(item.caption)
  return hay.join('\n').toLowerCase().includes(q)
}

export function ReferenceTables({
  config,
  onConfig,
}: {
  config?: Record<string, unknown>
  onConfig: (c: Record<string, unknown>) => void
}) {
  const library = useStore((s) => s.tables)
  const addRefItem = useStore((s) => s.addRefItem)
  const updateRefItem = useStore((s) => s.updateRefItem)
  const removeRefItem = useStore((s) => s.removeRefItem)
  const copyRefItem = useStore((s) => s.copyRefItem)

  const shownIds = (config?.refShownIds as string[]) ?? []
  const layouts = (config?.refLayouts as Record<string, Box>) ?? {}
  const cols = (config?.refCols as number) ?? DEFAULT_COLS
  const allCardSettings = (config?.refCardSettings as Record<string, CardSettings>) ?? {}

  const [pickOpen, setPickOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [contentQuery, setContentQuery] = useState('')

  const byId = new Map(library.map((it) => [it.id, it]))
  const shown = shownIds.map((id) => byId.get(id)).filter((it): it is RefItem => !!it)
  const filtered = query
    ? library.filter((it) => it.title.toLowerCase().includes(query.toLowerCase()))
    : library

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
  const setCardSettings = (id: string, s: CardSettings) =>
    onConfig({ refCardSettings: { ...allCardSettings, [id]: s } })

  const createItem = (kind: 'table' | 'note' | 'image') => showOnPanel(addRefItem(kind))
  const copyItem = (id: string) => showOnPanel(copyRefItem(id))
  const deleteFromLibrary = async (item: RefItem) => {
    if (
      !(await confirmDialog({
        title: 'Delete from library?',
        message: `Delete "${item.title}" from the reference library? It will disappear from every panel.`,
        confirmLabel: 'Delete',
        danger: true,
      }))
    )
      return
    removeRefItem(item.id)
    if (shownIds.includes(item.id)) hideFromPanel(item.id)
  }

  const closePicker = () => {
    setPickOpen(false)
    setQuery('')
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
              <div className="ref-lib-overlay" onClick={closePicker} />
              <div className="ref-lib-menu">
                <div className="ref-lib-head">Show on this panel</div>
                <input
                  className="ref-lib-search"
                  placeholder="Filter…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                {library.length === 0 ? (
                  <div className="ref-lib-empty">
                    No references yet — create one with the + buttons.
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="ref-lib-empty">No matches.</div>
                ) : (
                  filtered.map((it) => (
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
        <input
          className="ref-content-search"
          placeholder="Search content…"
          value={contentQuery}
          onChange={(e) => setContentQuery(e.target.value)}
          title="Highlight cards on this panel whose content matches"
        />
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
          renderItem={(it) => {
            const matched = !!contentQuery && cardMatches(it, contentQuery.toLowerCase())
            return (
              <RefItemView
                item={it}
                update={updateRefItem}
                copy={copyItem}
                hide={hideFromPanel}
                settings={allCardSettings[it.id] ?? {}}
                onSettings={(s) => setCardSettings(it.id, s)}
                matched={matched}
                dimmed={!!contentQuery && !matched}
              />
            )
          }}
        />
      )}
    </div>
  )
}
