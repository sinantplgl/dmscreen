import { useState, useEffect } from 'react'
import { useStore } from '../../store/store'
import { Board } from '../../components/Board'
import { EyeIcon, EyeSlashIcon } from '../../components/icons'
import { childrenOf, siblingNumbers, isHidden } from './helpers'
import { Breadcrumb } from './Breadcrumb'
import { SearchBox } from './SearchBox'
import { NodeRow } from './NodeRow'
import { NodeCard } from './NodeCard'
import { FocusedContent } from './FocusedContent'
import { CreaturePicker, ReferencePicker } from './pickers'
import './SessionTracker.css'

export function SessionTracker({
  config,
  onConfig,
}: {
  config?: Record<string, unknown>
  onConfig: (c: Record<string, unknown>) => void
}) {
  const nodes = useStore((s) => s.sessionNodes)
  const addNode = useStore((s) => s.addNode)
  const addAlias = useStore((s) => s.addAlias)
  const updateNode = useStore((s) => s.updateNode)
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [refPickerParent, setRefPickerParent] = useState<string | undefined | null>(null)

  const storedFocus = config?.focusId as string | undefined
  const focusId = storedFocus && nodes.some((n) => n.id === storedFocus) ? storedFocus : undefined
  const setFocus = (id: string | undefined) => onConfig({ focusId: id })

  const collapsed = (config?.collapsed as Record<string, boolean> | undefined) || {}
  const toggleCollapsed = (id: string) =>
    onConfig({ collapsed: { ...collapsed, [id]: !collapsed[id] } })
  const expand = (id: string) => onConfig({ collapsed: { ...collapsed, [id]: false } })

  const view = (config?.view as 'tree' | 'board') ?? 'tree'
  const boardCols = (config?.boardCols as number) ?? 12
  const showHidden = !!config?.showHidden

  const roots = childrenOf(nodes, focusId)
  const rootNums = siblingNumbers(roots)
  const atTop = focusId === undefined
  const focusNode = focusId ? nodes.find((n) => n.id === focusId) : undefined

  const focusSiblings = focusId
    ? childrenOf(nodes, nodes.find((n) => n.id === focusId)?.parentId)
    : []
  const canCycle = focusSiblings.length > 1
  const cycleSibling = (dir: 1 | -1) => {
    const i = focusSiblings.findIndex((n) => n.id === focusId)
    if (i < 0) return
    setFocus(focusSiblings[(i + dir + focusSiblings.length) % focusSiblings.length].id)
  }

  const boardItems = showHidden ? roots : roots.filter((n) => !isHidden(n))
  const hiddenCount = roots.filter((n) => isHidden(n)).length

  const addHere = () => {
    const id = addNode(focusId, atTop ? 'session' : 'note')
    if (view === 'board') {
      const bottomY = roots.reduce((m, n) => Math.max(m, (n.layout?.y ?? 0) + (n.layout?.h ?? 0)), 0)
      updateNode(id, { layout: { x: 0, y: bottomY, w: Math.min(6, boardCols), h: 6 }, hidden: false })
    }
  }

  const [query, setQuery] = useState('')

  const [highlightId, setHighlightId] = useState<string | null>(null)
  useEffect(() => {
    if (!highlightId) return
    const el = document.querySelector(`[data-node-id="${highlightId}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const t = setTimeout(() => setHighlightId(null), 1500)
    return () => clearTimeout(t)
  }, [highlightId])

  const goTo = (id: string) => {
    const target = nodes.find((n) => n.id === id)
    if (!target) return
    const chain: string[] = []
    let cur = target.parentId ? nodes.find((n) => n.id === target.parentId) : undefined
    while (cur) {
      chain.push(cur.id)
      cur = cur.parentId ? nodes.find((n) => n.id === cur!.parentId) : undefined
    }
    const nextCollapsed = { ...collapsed }
    for (const a of chain) nextCollapsed[a] = false
    onConfig({ focusId: target.parentId, collapsed: nextCollapsed })
    setHighlightId(id)
  }

  return (
    <div className="session-tracker">
      <div className="session-head">
        <Breadcrumb focusId={focusId} nodes={nodes} setFocus={setFocus} />
        <div className="flex-row" style={{ gap: 6, marginTop: 6 }}>
          <button
            className="btn btn-accent"
            onClick={addHere}
            title={view === 'board' ? 'Add a card' : 'Add a child node'}
          >
            {view === 'board' ? '+ Card' : '+ Node'}
          </button>
          {view === 'tree' && (
            <button
              className="btn"
              title="Add a reference alias to an existing node"
              onClick={() => setRefPickerParent(focusId ?? undefined)}
            >
              + Ref
            </button>
          )}
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
                {showHidden ? <><EyeIcon /> Hidden</> : <><EyeSlashIcon />{` Hidden${hiddenCount ? ` (${hiddenCount})` : ''}`}</>}
              </button>
            </>
          )}
          <span className="spacer" />
          <span className="session-step">
            <button
              className="btn"
              title="Go up one level"
              disabled={atTop}
              onClick={() => setFocus(focusNode?.parentId)}
            >
              ↑ Up
            </button>
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
        {view === 'tree' && (
          <SearchBox nodes={nodes} query={query} setQuery={setQuery} onPick={goTo} />
        )}
      </div>

      <div className="session-tree-body">
        {view === 'board' ? (
          <>
            {focusNode && <FocusedContent node={focusNode} onPick={setPickerFor} />}
            {boardItems.length === 0 ? (
              <div className="empty-hint">
                {roots.length === 0
                  ? 'No child cards yet — click "+ Card" to add one.'
                  : `All ${hiddenCount} card(s) hidden — click the "Hidden" toggle to reveal.`}
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
                    nodes={nodes}
                    setFocus={setFocus}
                    onPick={setPickerFor}
                  />
                )}
              />
            )}
          </>
        ) : roots.length === 0 ? (
          <div className="empty-hint">
            Nothing here yet. Click "+ Node".
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
              goTo={goTo}
              collapsed={collapsed}
              toggleCollapsed={toggleCollapsed}
              expand={expand}
              highlightId={highlightId}
            />
          ))
        )}
      </div>

      {pickerFor && <CreaturePicker nodeId={pickerFor} onClose={() => setPickerFor(null)} />}
      {refPickerParent !== null && (
        <ReferencePicker
          nodes={nodes}
          onPick={(refId) => {
            const id = addAlias(refPickerParent, refId)
            if (refPickerParent !== undefined) expand(refPickerParent)
            setHighlightId(id)
          }}
          onClose={() => setRefPickerParent(null)}
        />
      )}
    </div>
  )
}
