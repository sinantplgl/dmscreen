import { useState, useEffect } from 'react'
import { useStore } from '../../store/store'
import { Board } from '../../components/Board'
import { ListIcon, GridIcon, LinkIcon } from '../../components/icons'
import { childrenOf, siblingNumbers, isHidden } from './helpers'
import { Breadcrumb } from './Breadcrumb'
import { SearchBox } from './SearchBox'
import { NodeRow } from './NodeRow'
import { NodeCard } from './NodeCard'
import { FocusedContent } from './FocusedContent'
import { AddMenu } from './AddMenu'
import { BoardOptionsMenu } from './BoardOptionsMenu'
import { MaximizedView } from './MaximizedView'
import { CreaturePicker, ReferencePicker } from './pickers'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'
import type { CardFieldConfig } from './fields'
import './SessionTracker.css'

export function SessionTracker({
  panelId,
  config,
  onConfig,
}: {
  panelId: string
  config?: Record<string, unknown>
  onConfig: (c: Record<string, unknown>) => void
}) {
  const nodes = useStore((s) => s.sessionNodes)
  const addNode = useStore((s) => s.addNode)
  const addAlias = useStore((s) => s.addAlias)
  const updateNode = useStore((s) => s.updateNode)
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const tabs = useStore((s) => s.tabs)
  const updatePanelConfig = useStore((s) => s.updatePanelConfig)
  const customTypeNames = new Set(customNodeTypes.map((t) => t.type))
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [refPickerParent, setRefPickerParent] = useState<string | undefined | null>(null)
  const [maxStack, setMaxStack] = useState<string[]>([])
  const [linkMenuOpen, setLinkMenuOpen] = useState(false)
  const maximize = (id: string) => setMaxStack((s) => (s[s.length - 1] === id ? s : [...s, id]))

  // ── Panel linking ──────────────────────────────────────────────────────────
  // Two session panels can be paired (this one as tree, the target as board) so
  // the tree's expand (⤢) opens the node in the linked board panel. Link state
  // lives in each panel's config; cross-panel writes go through updatePanelConfig.
  const allPanels = tabs.flatMap((t) => t.columns).flatMap((c) => c.panels)
  const findPanel = (id?: string) => (id ? allPanels.find((p) => p.id === id) : undefined)
  const myTab = tabs.find((t) => t.columns.some((c) => c.panels.some((p) => p.id === panelId)))
  const tabSessionPanels = myTab
    ? myTab.columns.flatMap((c) => c.panels).filter((p) => p.type === 'session')
    : []
  const linkLabel = (id: string) => `Tracker ${tabSessionPanels.findIndex((p) => p.id === id) + 1}`

  const linkRoleRaw = config?.linkRole as 'tree' | 'board' | undefined
  const linkedPanel = findPanel(config?.linkedPanelId as string | undefined)
  const linked = !!(linkRoleRaw && linkedPanel && linkedPanel.type === 'session')
  const linkRole = linked ? linkRoleRaw : undefined

  // Self-heal: if our link partner is gone, drop the stale link config.
  useEffect(() => {
    if (linkRoleRaw && !linked) onConfig({ linkRole: undefined, linkedPanelId: undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkRoleRaw, linked])

  const linkTo = (targetId: string) => {
    onConfig({ linkRole: 'tree', linkedPanelId: targetId, view: 'tree' })
    updatePanelConfig(targetId, { linkRole: 'board', linkedPanelId: panelId, view: 'board' })
    setLinkMenuOpen(false)
  }
  const unlink = () => {
    if (linkedPanel) updatePanelConfig(linkedPanel.id, { linkRole: undefined, linkedPanelId: undefined })
    onConfig({ linkRole: undefined, linkedPanelId: undefined })
    setLinkMenuOpen(false)
  }

  const storedFocus = config?.focusId as string | undefined
  const focusId = storedFocus && nodes.some((n) => n.id === storedFocus) ? storedFocus : undefined
  const setFocus = (id: string | undefined) => onConfig({ focusId: id })
  // When linked as the tree panel, route expand to the linked board panel.
  const openInBoard = (id: string) =>
    linkRole === 'tree' && linkedPanel
      ? updatePanelConfig(linkedPanel.id, { focusId: id, view: 'board' })
      : onConfig({ focusId: id, view: 'board' })

  // The node the linked board is currently showing — kept highlighted in the tree.
  const selectedId =
    linkRole === 'tree' && linkedPanel ? (linkedPanel.config?.focusId as string | undefined) : undefined
  useEffect(() => {
    if (!selectedId) return
    document.querySelector(`[data-node-id="${selectedId}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedId])

  const collapsed = (config?.collapsed as Record<string, boolean> | undefined) || {}
  const toggleCollapsed = (id: string) =>
    onConfig({ collapsed: { ...collapsed, [id]: !collapsed[id] } })
  const expand = (id: string) => onConfig({ collapsed: { ...collapsed, [id]: false } })
  const collapseAll = () => {
    const next: Record<string, boolean> = {}
    for (const n of nodes) if (n.parentId) next[n.parentId] = true
    onConfig({ collapsed: next })
  }
  const expandAll = () => onConfig({ collapsed: {} })

  // A linked panel is locked to its role's view; otherwise use the stored view.
  const view = linkRole ?? ((config?.view as 'tree' | 'board') ?? 'tree')
  const boardCols = (config?.boardCols as number) ?? 12
  const showHidden = !!config?.showHidden

  const cardSettings = (config?.cardSettings as Record<string, CardSettings>) || {}
  const setCardSettings = (id: string, s: CardSettings) =>
    onConfig({ cardSettings: { ...cardSettings, [id]: s } })

  const cardSections = (config?.cardSections as Record<string, Record<string, number>>) || {}
  const setSectionHeight = (id: string, key: string, px: number) =>
    onConfig({ cardSections: { ...cardSections, [id]: { ...cardSections[id], [key]: px } } })
  const cardChildrenOpen = (config?.cardChildrenOpen as Record<string, boolean>) || {}
  const toggleChildren = (id: string) =>
    onConfig({ cardChildrenOpen: { ...cardChildrenOpen, [id]: !cardChildrenOpen[id] } })

  const cardFields = (config?.cardFields as Record<string, CardFieldConfig>) || {}
  const setCardFields = (id: string, cfg: CardFieldConfig) =>
    onConfig({ cardFields: { ...cardFields, [id]: cfg } })

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

  const boardItems = showHidden ? roots : roots.filter((n) => !isHidden(n, customTypeNames))
  const hiddenCount = roots.filter((n) => isHidden(n, customTypeNames)).length

  // While a card is maximized, the board UI (options bar + Add actions) targets
  // the *windowed* node and its children rather than the root board.
  const maximizing = view === 'board' && maxStack.length > 0
  const addParent = maximizing ? maxStack[maxStack.length - 1] : focusId
  const optionRoots = maximizing ? childrenOf(nodes, addParent) : roots
  const optionHiddenCount = optionRoots.filter((n) => isHidden(n, customTypeNames)).length

  // Position a freshly-added card at the bottom of the given board so it's
  // visible (defaults to the focused-node board).
  const placeOnBoard = (id: string, siblings: typeof roots = roots) => {
    const bottomY = siblings.reduce((m, n) => Math.max(m, (n.layout?.y ?? 0) + (n.layout?.h ?? 0)), 0)
    updateNode(id, { layout: { x: 0, y: bottomY, w: Math.min(6, boardCols), h: 6 }, hidden: false })
  }

  const addHere = () => {
    const id = addNode(addParent, !maximizing && atTop ? 'session' : 'note')
    if (view === 'board') placeOnBoard(id, optionRoots)
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
          <AddMenu
            view={view}
            onAddHere={addHere}
            onAddRef={() => setRefPickerParent(addParent ?? undefined)}
          />
          <span className="view-toggle">
            <button
              className={'btn' + (view === 'tree' ? ' btn-accent' : '')}
              title={linkRole ? 'View is locked while linked' : maximizing ? 'Close the window to switch views' : 'Tree view'}
              disabled={maximizing || !!linkRole}
              onClick={() => onConfig({ view: 'tree' })}
            >
              <ListIcon />
            </button>
            <button
              className={'btn' + (view === 'board' ? ' btn-accent' : '')}
              title={linkRole ? 'View is locked while linked' : maximizing ? 'Close the window to switch views' : 'Board view'}
              disabled={maximizing || !!linkRole}
              onClick={() => onConfig({ view: 'board' })}
            >
              <GridIcon />
            </button>
          </span>
          <span className="view-toggle link-toggle">
            {linkRole ? (
              <button
                className="btn btn-accent"
                title={`Linked as ${linkRole} with ${linkedPanel ? linkLabel(linkedPanel.id) : 'a panel'} — click to unlink`}
                onClick={unlink}
              >
                <LinkIcon /> {linkRole === 'tree' ? 'Tree' : 'Board'}
              </button>
            ) : (
              <span className="link-menu-wrap">
                <button
                  className="btn"
                  title={
                    tabSessionPanels.length < 2
                      ? 'Add another tracker panel in this tab to link'
                      : 'Link with another tracker panel'
                  }
                  disabled={tabSessionPanels.length < 2}
                  onClick={() => setLinkMenuOpen((v) => !v)}
                >
                  <LinkIcon />
                </button>
                {linkMenuOpen && (
                  <>
                    <div className="ref-lib-overlay" onClick={() => setLinkMenuOpen(false)} />
                    <div className="link-menu">
                      <div className="link-menu-title">Open expands in (board):</div>
                      {tabSessionPanels
                        .filter((p) => p.id !== panelId)
                        .map((p) => (
                          <button key={p.id} className="link-menu-item" onClick={() => linkTo(p.id)}>
                            {linkLabel(p.id)}{' '}
                            <span className="muted">({(p.config?.view as string) ?? 'tree'})</span>
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </span>
            )}
          </span>
          {view === 'tree' && (
            <span className="view-toggle">
              <button className="btn" title="Collapse all" onClick={collapseAll}>
                ⊟
              </button>
              <button className="btn" title="Expand all" onClick={expandAll}>
                ⊞
              </button>
            </span>
          )}
          {view === 'board' && (
            <BoardOptionsMenu
              children={optionRoots}
              boardCols={boardCols}
              onCols={(cols) => onConfig({ boardCols: cols })}
              showHidden={showHidden}
              onToggleHidden={() => onConfig({ showHidden: !showHidden })}
              hiddenCount={optionHiddenCount}
            />
          )}
          <span className="spacer" />
          <span className="session-step">
            <button
              className="btn"
              title="Go up one level"
              disabled={atTop}
              onClick={() => setFocus(focusNode?.parentId)}
            >
              ↑
            </button>
            <button
              className="btn"
              title="Focus the previous sibling"
              disabled={!canCycle}
              onClick={() => cycleSibling(-1)}
            >
              ◀
            </button>
            <button
              className="btn"
              title="Focus the next sibling"
              disabled={!canCycle}
              onClick={() => cycleSibling(1)}
            >
              ▶
            </button>
          </span>
        </div>
        {view === 'tree' && (
          <SearchBox nodes={nodes} query={query} setQuery={setQuery} onPick={goTo} />
        )}
      </div>

      <div className="session-tree-body">
        {view === 'board' && maxStack.length > 0 ? (
          <MaximizedView
            nodes={nodes}
            stack={maxStack}
            setStack={setMaxStack}
            setFocus={setFocus}
            onPick={setPickerFor}
            boardCols={boardCols}
            showHidden={showHidden}
            cardSettings={cardSettings}
            setCardSettings={setCardSettings}
            cardSections={cardSections}
            setSectionHeight={setSectionHeight}
            cardChildrenOpen={cardChildrenOpen}
            toggleChildren={toggleChildren}
            cardFields={cardFields}
            setCardFields={setCardFields}
          />
        ) : view === 'board' ? (
          <>
            {focusNode && (
              <FocusedContent
                node={focusNode}
                onPick={setPickerFor}
                fields={cardFields[focusNode.id]}
                onFields={(cfg) => setCardFields(focusNode.id, cfg)}
                sectionHeights={cardSections[focusNode.id]}
                onSectionHeight={(key, px) => setSectionHeight(focusNode.id, key, px)}
              />
            )}
            {boardItems.length === 0 ? (
              <div className="empty-hint">
                {roots.length === 0
                  ? 'No child cards yet — click "+ Add" to add one.'
                  : `All ${hiddenCount} card(s) hidden — open the filter menu to reveal them.`}
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
                    num={rootNums.get(n.id)}
                    setFocus={setFocus}
                    maximize={maximize}
                    onPick={setPickerFor}
                    settings={cardSettings[n.id]}
                    onSettings={(s) => setCardSettings(n.id, s)}
                    sectionHeights={cardSections[n.id]}
                    onSectionHeight={(key, px) => setSectionHeight(n.id, key, px)}
                    childrenOpen={!!cardChildrenOpen[n.id]}
                    onToggleChildren={() => toggleChildren(n.id)}
                    fields={cardFields[n.id]}
                    onFields={(cfg) => setCardFields(n.id, cfg)}
                  />
                )}
              />
            )}
          </>
        ) : roots.length === 0 ? (
          <div className="empty-hint">
            Nothing here yet. Click "+ Add".
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
              openInBoard={openInBoard}
              goTo={goTo}
              collapsed={collapsed}
              toggleCollapsed={toggleCollapsed}
              expand={expand}
              highlightId={highlightId}
              selectedId={selectedId}
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
            if (view === 'board' && refPickerParent === addParent) placeOnBoard(id, optionRoots)
            if (refPickerParent !== undefined) expand(refPickerParent)
            setHighlightId(id)
          }}
          onClose={() => setRefPickerParent(null)}
        />
      )}
    </div>
  )
}
