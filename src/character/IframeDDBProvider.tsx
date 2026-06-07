import type { CharacterDetailProvider } from './CharacterDetailProvider'
import type { Player } from '../types'

function ddbHref(player: Player): string | undefined {
  if (player.ddbUrl && player.ddbUrl.trim()) return player.ddbUrl.trim()
  if (player.ddbCharacterId) return `https://www.dndbeyond.com/characters/${player.ddbCharacterId}`
  return undefined
}

/**
 * Embeds the live D&D Beyond character page in an iframe.
 *
 * Heads-up: D&D Beyond may refuse to be framed (some pages frame-bust or send
 * blocking headers) and private characters require a DDB login in that frame.
 * If the embed comes up blank, the "Open on D&D Beyond" link is the fallback.
 */
export const IframeDDBProvider: CharacterDetailProvider = {
  id: 'iframe',
  label: 'D&D Beyond (embedded)',
  description: 'Embeds the live D&D Beyond character page in a frame.',
  canRender: (player) => !!ddbHref(player),
  render: (player) => {
    const href = ddbHref(player)
    if (!href) {
      return (
        <div style={{ padding: 24, color: '#7a6e60' }}>
          No D&D Beyond link set for this character. Add a character URL via the
          ✎ edit button on the roster card.
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
        <div className="flex-row" style={{ flexShrink: 0 }}>
          <span className="muted" style={{ fontSize: 12 }}>
            If the frame is blank, D&amp;D Beyond is blocking embedding — use the link →
          </span>
          <span className="spacer" />
          <a className="btn" href={href} target="_blank" rel="noreferrer">
            Open on D&amp;D Beyond ↗
          </a>
        </div>
        <iframe
          className="drawer-iframe"
          src={href}
          title="D&D Beyond character sheet"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    )
  },
}
