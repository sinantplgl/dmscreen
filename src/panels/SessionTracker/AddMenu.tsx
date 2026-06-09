import { useRef, useState } from 'react'
import { PlusIcon, LinkIcon } from '../../components/icons'

/** Toolbar "+ Add" button with a flyout to add a child node/card or a reference alias. */
export function AddMenu({
  view,
  onAddHere,
  onAddRef,
}: {
  view: 'tree' | 'board'
  onAddHere: () => void
  onAddRef: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  const toggle = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left })
    }
    setOpen((v) => !v)
  }
  const pick = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  return (
    <>
      <button ref={btnRef} className="btn btn-accent" title="Add a card or reference" onClick={toggle}>
        <PlusIcon /> Add
      </button>
      {open && (
        <>
          <div className="ref-lib-overlay" onClick={() => setOpen(false)} />
          <div className="toolbar-menu" style={{ top: pos.top, left: pos.left }}>
            <button className="toolbar-menu-item" onClick={() => pick(onAddHere)}>
              <PlusIcon /> {view === 'board' ? 'Add card' : 'Add node'}
            </button>
            <button className="toolbar-menu-item" onClick={() => pick(onAddRef)}>
              <LinkIcon /> Add reference
            </button>
          </div>
        </>
      )}
    </>
  )
}
