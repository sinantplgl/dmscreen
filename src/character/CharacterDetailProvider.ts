import type { ReactNode } from 'react'
import type { Player } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Pluggable "detailed character view" abstraction.
//
// The roster shows a compact card; clicking "Detail" opens whichever provider is
// active. The default is `iframe` (embeds the D&D Beyond character page). Because
// embedding/fetching DDB has real constraints (frame-busting, CORS), this is kept
// behind an interface so a `proxy-native` renderer or a plain `link-out` provider
// can be swapped in later by editing src/character/providers.ts — no other code
// needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export interface CharacterDetailProvider {
  /** Stable id stored in AppData.characterProvider. */
  id: string
  /** Human label shown in the provider picker. */
  label: string
  /** Short description of how it fetches/renders the character. */
  description: string
  /** True if this provider can render anything useful for the given player. */
  canRender: (player: Player) => boolean
  /** Render the detailed view body (shown inside the drawer). */
  render: (player: Player) => ReactNode
}
