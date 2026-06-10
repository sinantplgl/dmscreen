import { useRef, useState } from 'react'
import { GearIcon } from '../../components/icons'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'

export const DEFAULT_CARD_FONT = 15

const clamp = (lo: number, hi: number, n: number) => Math.max(lo, Math.min(hi, n))

/** Gear menu on a node card: per-card font size, optional column count, and a
 *  toggle for the inline labels row. All persist in panel config; the labels
 *  themselves live on the node and are edited inline on the card. */
export function CardSettingsMenu({
  settings,
  onSettings,
  allowColumns,
  allowLabels,
}: {
  settings: CardSettings
  onSettings: (s: CardSettings) => void
  allowColumns: boolean
  allowLabels?: boolean
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
      <button ref={btnRef} className="icon-btn" onClick={openMenu} title="Card settings">
        <GearIcon />
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
            {allowLabels && (
              <>
                <span>Labels</span>
                <button
                  className={'ref-toggle-pill' + (settings.showLabels ? ' on' : '')}
                  title={settings.showLabels ? 'Hide the labels row' : 'Show the labels row'}
                  onClick={() => onSettings({ ...settings, showLabels: !settings.showLabels })}
                >
                  {settings.showLabels ? 'On' : 'Off'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}
