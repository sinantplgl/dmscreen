import type { Abilities } from '../types'

/** Format an ability modifier from a raw score, e.g. 22 -> "+6", 8 -> "-1". */
export function abilityMod(score: number): string {
  const m = Math.floor((score - 10) / 2)
  return (m >= 0 ? '+' : '') + m
}

/** Numeric ability modifier. */
export function abilityModValue(score: number): number {
  return Math.floor((score - 10) / 2)
}

/** HP severity class used to colour HP bars. */
export function hpClass(hp: number, max: number): 'high' | 'mid' | 'low' {
  if (max <= 0) return 'low'
  const p = hp / max
  if (p > 0.6) return 'high'
  if (p > 0.3) return 'mid'
  return 'low'
}

export const ABILITY_KEYS: (keyof Abilities)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
export const ABILITY_LABELS: Record<keyof Abilities, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
}

/**
 * Parse a free-text saving-throws string into per-ability overrides, e.g.
 * "Con +6, Int +8, Wis +6" → { con: "+6", int: "+8", wis: "+6" }. Abilities not
 * listed fall back to their plain modifier in the 2024 ability table.
 */
export function parseSaves(saves?: string): Partial<Record<keyof Abilities, string>> {
  const out: Partial<Record<keyof Abilities, string>> = {}
  if (!saves) return out
  const re = /(str|dex|con|int|wis|cha)\s*([+-]?\d+)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(saves))) {
    const key = m[1].toLowerCase() as keyof Abilities
    const n = parseInt(m[2], 10)
    out[key] = (n >= 0 ? '+' : '') + n
  }
  return out
}

/** Proficiency bonus for a character level (5e: 2 at 1–4, +1 every 4 levels). */
export function profBonusForLevel(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4)
}

/** Proficiency bonus for a Challenge Rating (2024 stat blocks print this as "PB +N"). */
export function proficiencyBonusForCr(cr: string): number {
  const token = (cr || '').trim().split(/[\s(]/)[0]
  let n: number
  if (token.includes('/')) {
    const [a, b] = token.split('/').map(Number)
    n = b ? a / b : 0
  } else {
    n = parseFloat(token) || 0
  }
  if (n >= 29) return 9
  if (n >= 25) return 8
  if (n >= 21) return 7
  if (n >= 17) return 6
  if (n >= 13) return 5
  if (n >= 9) return 4
  if (n >= 5) return 3
  return 2
}

/** Default 2024 initiative line from a DEX score, e.g. 14 → "+2 (12)". */
export function initiativeFromDex(dex: number): string {
  const b = abilityModValue(dex)
  return `${b >= 0 ? '+' : ''}${b} (${10 + b})`
}

/** Pull the numeric character id out of a D&D Beyond character URL. */
export function parseDdbId(url: string): string | undefined {
  const m = url.match(/characters\/(\d+)/)
  return m ? m[1] : undefined
}

/** Tiny unique-id generator (avoids a dependency; not security sensitive). */
let counter = 0
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`
}

export const CONDITIONS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Exhaustion',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
]
