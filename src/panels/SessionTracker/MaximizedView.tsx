import { Board } from '../../components/Board'
import { useStore } from '../../store/store'
import type { SessionNode } from '../../types'
import { childrenOf, iconFor, displayTitle, isHidden, siblingNumbers } from './helpers'
import { FocusedContent } from './FocusedContent'
import { NodeCard } from './NodeCard'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'

/**
 * A windowed "maximize" that covers the board area (not the whole screen).
 * One titlebar per level in `stack` is shown, top-to-bottom; the body shows the
 * deepest (active) node. Clicking any non-active bar pops back to that level, so
 * however deep you nest, every ancestor is one click away.
 */
export function MaximizedView({
  nodes,
  stack,
  setStack,
  setFocus,
  onPick,
  boardCols,
  showHidden,
  cardSettings,
  setCardSettings,
  cardSections,
  setSectionHeight,
  cardChildrenOpen,
  toggleChildren,
}: {
  nodes: SessionNode[]
  stack: string[]
  setStack: (s: string[]) => void
  setFocus: (id: string | undefined) => void
  onPick: (id: string) => void
  boardCols: number
  showHidden: boolean
  cardSettings: Record<string, CardSettings>
  setCardSettings: (id: string, s: CardSettings) => void
  cardSections: Record<string, Record<string, number>>
  setSectionHeight: (id: string, key: string, px: number) => void
  cardChildrenOpen: Record<string, boolean>
  toggleChildren: (id: string) => void
}) {
  const updateNode = useStore((s) => s.updateNode)
  const customTypeNames = new Set(useStore((s) => s.customNodeTypes).map((t) => t.type))
  const activeId = stack[stack.length - 1]
  const active = nodes.find((n) => n.id === activeId)
  const childNums = siblingNumbers(childrenOf(nodes, activeId))
  const children = childrenOf(nodes, activeId).filter(
    (n) => showHidden || !isHidden(n, customTypeNames),
  )

  const maximize = (id: string) => setStack([...stack, id])
  const minimize = () => setStack(stack.slice(0, -1))
  const popTo = (i: number) => setStack(stack.slice(0, i + 1))
  const goToCard = () => {
    setFocus(activeId)
    setStack([])
  }

  return (
    <div className="session-maximized">
      <div className="session-maximized-bars">
        {stack.map((id, i) => {
          const n = nodes.find((x) => x.id === id)
          const isActive = i === stack.length - 1
          return (
            <div
              key={id}
              className={'session-maximized-bar' + (isActive ? ' is-active' : '')}
              onClick={isActive ? undefined : () => popTo(i)}
              title={isActive ? undefined : 'Return to this card'}
            >
              <span className="node-type-icon">{n ? iconFor(n) : '•'}</span>
              <span className="smax-title">{n ? displayTitle(n) : '(deleted)'}</span>
              {isActive && (
                <>
                  <span className="spacer" />
                  <button
                    className="icon-btn"
                    title="Go to this card (navigate the board into it)"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToCard()
                    }}
                  >
                    ⊕
                  </button>
                  <button
                    className="icon-btn"
                    title="Minimize"
                    onClick={(e) => {
                      e.stopPropagation()
                      minimize()
                    }}
                  >
                    ▢
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="session-maximized-body">
        {active ? (
          <>
            <FocusedContent node={active} onPick={onPick} />
            {children.length > 0 && (
              <Board
                items={children}
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
                    num={childNums.get(n.id)}
                    setFocus={setFocus}
                    maximize={maximize}
                    onPick={onPick}
                    settings={cardSettings[n.id]}
                    onSettings={(s) => setCardSettings(n.id, s)}
                    sectionHeights={cardSections[n.id]}
                    onSectionHeight={(key, px) => setSectionHeight(n.id, key, px)}
                    childrenOpen={!!cardChildrenOpen[n.id]}
                    onToggleChildren={() => toggleChildren(n.id)}
                  />
                )}
              />
            )}
          </>
        ) : (
          <div className="empty-hint">This card no longer exists.</div>
        )}
      </div>
    </div>
  )
}
