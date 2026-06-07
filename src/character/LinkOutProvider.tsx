import type { CharacterDetailProvider } from './CharacterDetailProvider'
import type { Player } from '../types'

function ddbHref(player: Player): string | undefined {
  if (player.ddbUrl && player.ddbUrl.trim()) return player.ddbUrl.trim()
  if (player.ddbCharacterId) return `https://www.dndbeyond.com/characters/${player.ddbCharacterId}`
  return undefined
}

/**
 * Zero-risk fallback method: no embedding/fetching — just a big link out to the
 * D&D Beyond sheet. Useful when iframe embedding is blocked.
 */
export const LinkOutProvider: CharacterDetailProvider = {
  id: 'link',
  label: 'D&D Beyond (link out)',
  description: 'Opens the character sheet in a new tab instead of embedding it.',
  canRender: (player) => !!ddbHref(player),
  render: (player) => {
    const href = ddbHref(player)
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p className="muted" style={{ marginBottom: 16 }}>
          {href
            ? 'Open this character on D&D Beyond:'
            : 'No D&D Beyond link set for this character.'}
        </p>
        {href && (
          <a className="btn btn-accent" href={href} target="_blank" rel="noreferrer">
            Open on D&amp;D Beyond ↗
          </a>
        )}
      </div>
    )
  },
}
