import { useState } from 'react'
import { useStore } from '../../store/store'
import { SwordsIcon, DragonIcon } from '../../components/icons'
import { StatBlock } from '../StatBlock'
import { setCreatureCount } from './attachments'
import { EncounterCreaturePicker } from './pickers'
import { ResizableSection } from './ResizableSection'
import type { FieldProps } from './fields'

/** Creatures attached to an `encounter` node, each with a quantity, plus a
 *  one-click "send the whole encounter to the combat tracker". */
export function NodeEncounter({ node, height, onHeight, mode }: FieldProps) {
  const bestiary = useStore((s) => s.bestiary)
  const updateNode = useStore((s) => s.updateNode)
  const sendCreaturesToCombat = useStore((s) => s.sendCreaturesToCombat)
  const [picking, setPicking] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const list = node.creatures ?? []
  const setCount = (creatureId: string, count: number) =>
    updateNode(node.id, { creatures: setCreatureCount(node.creatures, creatureId, count) })
  const total = list.reduce((n, c) => n + c.count, 0)

  const actions = (
    <>
      {list.length > 0 && (
        <button
          className="btn btn-sm"
          title="Add every creature to the combat tracker"
          onClick={() => sendCreaturesToCombat(list)}
        >
          <SwordsIcon /> Send all ({total})
        </button>
      )}
      <button className="btn btn-sm" onClick={() => setPicking(true)}>
        + Add creature
      </button>
    </>
  )

  return (
    <ResizableSection title="Creatures" actions={actions} mode={mode} height={height} onHeight={onHeight}>
      {list.length === 0 ? (
        <div className="node-items-empty">No creatures yet — click "+ Add creature".</div>
      ) : (
        list.map((ref) => {
          const cr = bestiary.find((x) => x.id === ref.creatureId)
          if (!cr) {
            return (
              <div key={ref.creatureId} className="attach-row">
                <span className="attach-name muted">⚠ missing creature</span>
                <button
                  className="icon-btn danger"
                  title="Remove"
                  onClick={() => setCount(ref.creatureId, 0)}
                >
                  ✕
                </button>
              </div>
            )
          }
          const open = openId === cr.id
          return (
            <div key={ref.creatureId}>
            <div className="attach-row">
              {cr.imageUrl ? (
                <img
                  className="attach-thumb"
                  src={cr.imageUrl}
                  alt={cr.name}
                  style={cr.imageFlip ? { transform: 'scaleX(-1)' } : undefined}
                />
              ) : (
                <span className="attach-thumb attach-thumb-icon">
                  <DragonIcon />
                </span>
              )}
              <button
                className="attach-name attach-name-btn"
                title={open ? 'Hide stat block' : 'Show stat block'}
                onClick={() => setOpenId(open ? null : cr.id)}
              >
                {cr.name}
                <span className="attach-sub"> — {cr.cr.split(' ')[0]} CR</span>
              </button>
              {cr.unique ? (
                <span className="attach-unique" title="Unique — only one allowed">
                  unique
                </span>
              ) : (
                <span className="attach-stepper">
                  <button className="ref-stepper-btn" title="Fewer" onClick={() => setCount(cr.id, ref.count - 1)}>
                    −
                  </button>
                  <span className="attach-count">{ref.count}</span>
                  <button className="ref-stepper-btn" title="More" onClick={() => setCount(cr.id, ref.count + 1)}>
                    +
                  </button>
                </span>
              )}
              <button
                className="icon-btn"
                title="Send this creature to combat"
                onClick={() => sendCreaturesToCombat([{ creatureId: cr.id, count: ref.count }])}
              >
                <SwordsIcon />
              </button>
              <button className="icon-btn danger" title="Remove from this encounter" onClick={() => setCount(cr.id, 0)}>
                ✕
              </button>
            </div>
            {open && (
              <div className="attach-statblock">
                <StatBlock creature={cr} />
              </div>
            )}
            </div>
          )
        })
      )}

      {picking && <EncounterCreaturePicker nodeId={node.id} onClose={() => setPicking(false)} />}
    </ResizableSection>
  )
}
