import { useRef, useState } from 'react'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'

export const DEFAULT_CARD_FONT = 15

const clamp = (lo: number, hi: number, n: number) => Math.max(lo, Math.min(hi, n))

/** ⋯ menu on a node card: per-card font size and (optionally) column count.
 *  Mirrors the Reference panel's card settings; persisted in panel config. */
export function CardSettingsMenu({
  settings,
  onSettings,
  allowColumns,
}: {
  settings: CardSettings
  onSettings: (s: CardSettings) => void
  allowColumns: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  const fontSize = settings.fontSize ?? DEFAULT_CARD_FONT
  const contentCols = settings.contentCols ?? 1
  const setFont = (n: number) => onSettings({ ...settings, fontSize: clamp(8, 28, n) })
  const setCols = (n: number) => onSettings({ ...settings, contentCols: clamp(1, 4, n) })

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
    }
    setOpen((v) => !v)
  }

  return (
    <>
      <button ref={btnRef} className="icon-btn" onClick={openMenu} title="Card display settings">
        ⋯
      </button>
      {open && (
        <>
          <div className="ref-lib-overlay" onClick={() => setOpen(false)} />
          <div className="ref-settings-menu" style={{ top: pos.top, right: pos.right }}>
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
