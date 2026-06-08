import {
  ABILITY_KEYS,
  ABILITY_LABELS,
  abilityMod,
  abilityModValue,
  profBonusForLevel,
} from '../../lib/dnd'
import type { AbilityStat, CharacterSheet, Player, SaveStat } from '../../types'

export const ABBRS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const

export function ddbId(player: Player): string | undefined {
  if (player.ddbCharacterId) return player.ddbCharacterId
  const m = player.ddbUrl?.match(/characters\/(\d+)/)
  return m ? m[1] : undefined
}

export async function fetchRendered(id: string, cobalt: string): Promise<CharacterSheet> {
  const r = await fetch(`/ddb-api/rendered/${id}`, { headers: cobalt ? { 'x-cobalt': cobalt } : undefined })
  const json = await r.json().catch(() => ({}))
  if (!r.ok || json.success === false) throw new Error(json.message || `Request failed (${r.status})`)
  return { ...(json.data as CharacterSheet), fetchedAt: new Date().toISOString() }
}

export function relativeTime(iso?: string): string {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function sheetFromPlayer(p: Player): CharacterSheet {
  const prof = p.profBonus ?? profBonusForLevel(p.level)
  const fmt = (n: number) => (n >= 0 ? '+' : '') + n

  const abilities: Record<string, AbilityStat> = {}
  const saves: Record<string, SaveStat> = {}
  const profSet = new Set(p.saveProficiencies ?? [])
  for (const k of ABILITY_KEYS) {
    const label = ABILITY_LABELS[k]
    const mod = abilityModValue(p.abilities[k])
    abilities[label] = { score: p.abilities[k], mod: fmt(mod) }
    const proficient = profSet.has(k)
    saves[label] = { bonus: fmt(mod + (proficient ? prof : 0)), proficient }
  }
  const wisMod = abilityModValue(p.abilities.wis)
  const intMod = abilityModValue(p.abilities.int)
  return {
    name: p.name,
    summary: null,
    avatarUrl: p.portraitUrl ?? null,
    ac: p.ac,
    hpCurrent: p.currentHp ?? p.maxHp,
    hpMax: p.maxHp,
    hpTemp: null,
    speed: p.speed || '30 ft.',
    initiative: p.initiative || abilityMod(p.abilities.dex),
    profBonus: prof,
    abilities,
    saves,
    skills: [],
    senses: [],
    conditions: [],
    passivePerception: p.passivePerception ?? 10 + wisMod,
    passiveInvestigation: p.passiveInvestigation ?? 10 + intMod,
    passiveInsight: p.passiveInsight ?? 10 + wisMod,
  }
}
