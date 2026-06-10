import type { Creature } from '../types'

/**
 * A pluggable "import a monster from a URL" provider. Add more (e.g. open5e,
 * a homebrew wiki) by implementing this and registering it in `index.ts`.
 */
export interface MonsterSource {
  id: string
  /** Human label, e.g. "D&D Beyond". */
  label: string
  /** Does this source recognise the given URL? */
  match: (url: string) => boolean
  /** Fetch + parse the URL into a partial Creature. Throws with a message on
   *  failure. `cobalt` is the optional D&D Beyond CobaltSession cookie, used to
   *  reach paid / campaign-only pages. */
  fetchMonster: (url: string, cobalt?: string) => Promise<Partial<Creature>>
}
