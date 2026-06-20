import { createElement, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useStore } from '../../store/store'
import type { CustomNodeType, SessionNode } from '../../types'
import { NODE_TYPE_PRESETS, ICON_LIBRARY, ICON_BY_KEY, iconFor, customTypeUsage } from './helpers'
import { confirmDialog } from '../../lib/dialog'
import { useMenuAnchor } from '../../lib/anchorMenu'

const renderIcon = (icon?: string): ReactNode => {
  if (!icon) return null
  const Icon = ICON_BY_KEY[icon]
  return Icon ? createElement(Icon) : icon // library key → SVG; else a literal emoji/char
}

/** Clickable node type-icon that opens a dropdown menu to change the node's type.
 *  Built-in and custom types are listed alphabetically; new custom types are
 *  registered (shared across campaigns) and pick an icon from the library or an emoji. */
export function TypePicker({ node }: { node: SessionNode }) {
  const updateNode = useStore((s) => s.updateNode)
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const addCustomNodeType = useStore((s) => s.addCustomNodeType)
  const removeCustomNodeType = useStore((s) => s.removeCustomNodeType)
  const sessionNodes = useStore((s) => s.sessionNodes)
  const campaigns = useStore((s) => s.campaigns)
  const activeCampaignId = useStore((s) => s.activeCampaignId)
  const inactiveCampaigns = useStore((s) => s.inactiveCampaigns)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [iconKey, setIconKey] = useState<string | undefined>(undefined)
  const [emoji, setEmoji] = useState('')
  const [base, setBase] = useState('note')
  const triggerRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuStyle = useMenuAnchor(open, triggerRef, menuRef, 'left')

  const openMenu = () => setOpen((v) => !v)
  const close = () => {
    setOpen(false)
    setName('')
    setIconKey(undefined)
    setEmoji('')
    setBase('note')
  }

  const builtins = [...NODE_TYPE_PRESETS].sort((a, b) => a.type.localeCompare(b.type))
  const customs = [...customNodeTypes].sort((a, b) => a.type.localeCompare(b.type))

  const pickBuiltin = (type: string) => {
    updateNode(node.id, { type, icon: undefined })
    close()
  }
  const pickCustom = (t: CustomNodeType) => {
    updateNode(node.id, { type: t.type, icon: t.icon })
    close()
  }

  const deleteCustom = async (type: string) => {
    const fallback = customNodeTypes.find((t) => t.type === type)?.base ?? 'note'
    const groups = customTypeUsage(type, sessionNodes, activeCampaignId, campaigns, inactiveCampaigns)
    const total = groups.reduce((n, g) => n + g.count, 0)
    if (total > 0) {
      const lines = groups.map((g) => {
        const shown = g.titles.slice(0, 8)
        const more = g.count - shown.length
        return `• ${g.campaignName}: ${shown.join(', ')}${more > 0 ? ` +${more} more` : ''}`
      })
      const ok = await confirmDialog({
        title: `Delete custom type "${type}"?`,
        message: `It's used by ${total} node(s) — they'll fall back to "${fallback}":\n\n${lines.join('\n')}`,
        confirmLabel: 'Delete',
        danger: true,
      })
      if (!ok) return
    }
    removeCustomNodeType(type)
  }

  const createType = () => {
    const n = name.trim()
    if (!n) return
    const icon = iconKey ?? (emoji.trim() || undefined)
    addCustomNodeType(n, icon, base)
    updateNode(node.id, { type: n, icon })
    close()
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="node-type-icon"
        title={node.type + ' — click to change'}
        onClick={openMenu}
      >
        {iconFor(node)}
      </span>
      {open && (
        <>
          <div className="ref-lib-overlay" onClick={close} />
          <div ref={menuRef} className="type-menu" style={menuStyle}>
            <div className="type-menu-title">Built-in</div>
            {builtins.map((p) => (
              <button
                key={p.type}
                className={'type-menu-item' + (node.type === p.type && !node.icon ? ' current' : '')}
                onClick={() => pickBuiltin(p.type)}
              >
                <span className="node-type-icon">
                  <p.Icon />
                </span>
                {p.type}
              </button>
            ))}

            {customs.length > 0 && <div className="type-menu-title">Custom</div>}
            {customs.map((t) => (
              <div
                key={t.type}
                className={'type-menu-item' + (node.type === t.type ? ' current' : '')}
              >
                <button className="type-menu-pick" onClick={() => pickCustom(t)} title={`extends ${t.base ?? 'note'}`}>
                  <span className="node-type-icon">{renderIcon(t.icon)}</span>
                  {t.type}
                  {t.base && t.base !== t.type && <span className="type-base muted">↳ {t.base}</span>}
                </button>
                <button
                  className="icon-btn danger type-del"
                  title="Delete this custom type"
                  onClick={() => deleteCustom(t.type)}
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="type-menu-title">New custom type</div>
            <div className="type-create">
              <input
                placeholder="type name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createType()
                }}
              />
              <label className="type-base-select" title="Inherit behavior from this built-in type (sections, stat block, etc.)">
                Extends
                <select value={base} onChange={(e) => setBase(e.target.value)}>
                  {builtins.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.type}
                    </option>
                  ))}
                </select>
              </label>
              <div className="type-icon-grid">
                {ICON_LIBRARY.map((i) => (
                  <button
                    key={i.key}
                    className={'type-icon-choice' + (iconKey === i.key ? ' selected' : '')}
                    title={i.key}
                    onClick={() => {
                      setIconKey(iconKey === i.key ? undefined : i.key)
                      setEmoji('')
                    }}
                  >
                    <i.Icon />
                  </button>
                ))}
              </div>
              <div className="type-create-row">
                <input
                  className="type-emoji"
                  placeholder="or emoji"
                  value={emoji}
                  title="Use any emoji or character instead of a library icon"
                  onChange={(e) => {
                    setEmoji(e.target.value)
                    if (e.target.value.trim()) setIconKey(undefined)
                  }}
                />
                <button className="btn btn-sm btn-accent" disabled={!name.trim()} onClick={createType}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
