import { useRef, useState } from 'react'
import { GearIcon } from '../../components/icons'
import type { CardSettings } from '../ReferenceTables/ReferenceCards'
import { DisplayEditor } from './fields'
import type { CardFieldConfig } from './fields'
import type { SessionNode } from '../../types'
import { useMenuAnchor } from '../../lib/anchorMenu'

export const DEFAULT_CARD_FONT = 15

/** Title-bar accent swatches. Muted, parchment-friendly tones. */
const TITLE_COLORS = ['#b4543a', '#c8893a', '#caa83a', '#5f8f4e', '#3f8f8a', '#3f6fb0', '#7a5bb0', '#a8517e']

const clamp = (lo: number, hi: number, n: number) => Math.max(lo, Math.min(hi, n))

/** Gear menu on a node card: a per-card Fields editor (show/hide + reorder),
 *  font size, optional column count, title color, and the inline labels toggle.
 *  All persist in panel config; field DATA stays on the node. */
export function CardSettingsMenu({
  settings,
  onSettings,
  allowColumns,
  allowLabels,
  color,
  onColor,
  base,
  node,
  fields,
  onFields,
}: {
  settings: CardSettings
  onSettings: (s: CardSettings) => void
  allowColumns: boolean
  allowLabels?: boolean
  color?: string
  onColor?: (next: string | undefined) => void
  /** When provided, shows the per-card Fields editor. */
  base?: string
  node?: SessionNode
  fields?: CardFieldConfig
  onFields?: (cfg: CardFieldConfig) => void
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuStyle = useMenuAnchor(open, btnRef, menuRef, 'right')

  const fontSize = settings.fontSize ?? DEFAULT_CARD_FONT
  const contentCols = settings.contentCols ?? 1
  const setFont = (n: number) => onSettings({ ...settings, fontSize: clamp(8, 28, n) })
  const setCols = (n: number) => onSettings({ ...settings, contentCols: clamp(1, 4, n) })

  const showFields = !!(onFields && node && base != null)

  const openMenu = () => setOpen((v) => !v)

  return (
    <>
      <button ref={btnRef} className="icon-btn" onClick={openMenu} title="Card settings">
        <GearIcon />
      </button>
      {open && (
        <>
          <div className="ref-lib-overlay" onClick={() => setOpen(false)} />
          <div ref={menuRef} className="ref-settings-menu" style={menuStyle}>
            {showFields && <DisplayEditor fields={fields} base={base!} node={node!} onFields={onFields!} />}
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
            {onColor && (
              <>
                <span>Title color</span>
                <div className="card-color-swatches">
                  {TITLE_COLORS.map((c) => (
                    <button
                      key={c}
                      className={'card-color-swatch' + (color === c ? ' on' : '')}
                      style={{ background: c }}
                      title={c}
                      onClick={() => onColor(color === c ? undefined : c)}
                    />
                  ))}
                  <button
                    className={'card-color-swatch none' + (!color ? ' on' : '')}
                    title="No color"
                    onClick={() => onColor(undefined)}
                  >
                    ✕
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
