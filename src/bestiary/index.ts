import type { MonsterSource } from './monsterSource'
import { DdbMonsterSource } from './ddbMonster'

export type { MonsterSource } from './monsterSource'

// Registry of monster-import sources. Add more here later.
export const MONSTER_SOURCES: MonsterSource[] = [DdbMonsterSource]

/** The first source that recognises this URL, or undefined. */
export function sourceForUrl(url: string): MonsterSource | undefined {
  return MONSTER_SOURCES.find((s) => s.match(url))
}
