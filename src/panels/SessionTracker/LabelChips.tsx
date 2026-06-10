import { useState } from 'react'
import type { CSSProperties } from 'react'
import { TagIcon } from '../../components/icons'

/** A node's labels shown as small tag chips. Read-only by default (tree rows,
 *  alias cards); when `onChange` is given, each chip gets a remove button and a
 *  trailing input to add new labels (inline editing on a board card).
 *
 *  Read-only mode renders nothing when there are no labels; editable mode always
 *  renders so the add affordance stays reachable. */
export function LabelChips({
  labels,
  onChange,
  className,
  style,
}: {
  labels?: string[]
  onChange?: (next: string[]) => void
  className?: string
  style?: CSSProperties
}) {
  const [draft, setDraft] = useState('')
  const list = labels ?? []
  if (!onChange && list.length === 0) return null

  const add = () => {
    const v = draft.trim()
    if (v && !list.includes(v)) onChange?.([...list, v])
    setDraft('')
  }
  const remove = (l: string) => onChange?.(list.filter((x) => x !== l))

  return (
    <div
      className={'node-labels' + (onChange ? ' editable' : '') + (className ? ' ' + className : '')}
      style={style}
    >
      {list.map((l) => (
        <span key={l} className="node-label-chip">
          <TagIcon />
          {l}
          {onChange && (
            <button className="node-label-x" title="Remove label" onClick={() => remove(l)}>
              ✕
            </button>
          )}
        </span>
      ))}
      {onChange && (
        <input
          className="node-label-add"
          placeholder="+ label"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
            else if (e.key === 'Escape') setDraft('')
          }}
          onBlur={add}
        />
      )}
    </div>
  )
}
