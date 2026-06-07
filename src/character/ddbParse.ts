// ─────────────────────────────────────────────────────────────────────────────
// Parse the reliable subset of a D&D Beyond character-service JSON payload.
//
// Ability-score resolution mirrors how D&D Beyond actually applies modifiers:
//   - base stat + flat bonusStats
//   - + "bonus" ability-score modifiers from race / class / background / feat
//     (these are always active)
//   - + "bonus" modifiers from ITEMS only when the item is equipped and, if it
//     requires attunement, attuned (an unequipped Belt/ring must NOT count)
//   - condition modifiers (transient buffs/debuffs) are ignored
//   - "set" modifiers (e.g. Gauntlets of Ogre Power set STR 19) take the max
//   - overrideStats wins outright
//
// Passive Perception = 10 + WIS mod + (proficiency, doubled for expertise).
// Final AC is intentionally not computed (armor/feat rules); we link out for it.
//
// Every contribution is recorded in `abilityBreakdown` so the UI can show its
// work and we can diagnose mismatches.
// ─────────────────────────────────────────────────────────────────────────────

export interface AbilityContribution {
  source: string // e.g. "race", "feat", "item (Cloak of Protection)"
  value: number
  kind: 'bonus' | 'set'
  applied: boolean // false = present in JSON but NOT counted (e.g. unequipped item)
  note?: string
}

export interface AbilityBreakdown {
  base: number
  bonusStats: number
  override: number | null
  contributions: AbilityContribution[]
  total: number
}

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface ParsedCharacter {
  name: string
  avatarUrl?: string
  race: string
  classes: { name: string; subclass?: string; level: number }[]
  totalLevel: number
  abilities: Record<AbilityKey, number>
  abilityBreakdown: Record<AbilityKey, AbilityBreakdown>
  profBonus: number
  maxHp?: number
  passivePerception: number
  perceptionProficient: boolean
  perceptionExpertise: boolean
  saveProf: string[]
  skillProf: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any
}

const ABILITY_BY_ID: Record<number, AbilityKey> = {
  1: 'str',
  2: 'dex',
  3: 'con',
  4: 'int',
  5: 'wis',
  6: 'cha',
}
const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const ABILITY_FULL: Record<AbilityKey, string> = {
  str: 'strength',
  dex: 'dexterity',
  con: 'constitution',
  int: 'intelligence',
  wis: 'wisdom',
  cha: 'charisma',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

// Order in which we accumulate ability-score modifiers. background/feat come
// before race so that, for a duplicated origin ASI (D&D Beyond mirrors the
// chosen origin increase under both the species and the background/feat), the
// background/feat is counted and the species copy is flagged as the duplicate —
// matching how the sheet attributes it. `item`/`condition` are handled specially.
const ACCUM_ORDER = ['background', 'feat', 'class', 'race']

function statValue(arr: Any[], id: number): number | null {
  const e = Array.isArray(arr) ? arr.find((s) => s?.id === id) : undefined
  return e && typeof e.value === 'number' ? e.value : null
}

/**
 * Item definition ids whose modifiers should count: the item is equipped and,
 * if it needs attunement, is attuned. componentId on an item modifier matches
 * the inventory entry's definition id.
 */
function activeItemDefIds(data: Any): Map<number, string> {
  const map = new Map<number, string>()
  for (const it of data?.inventory || []) {
    const def = it?.definition || {}
    const equipped = it?.equipped === true
    const needsAttunement = def.canAttune === true || def.requiresAttunement === true
    const attuned = it?.isAttuned === true
    if (equipped && (!needsAttunement || attuned)) {
      map.set(def.id, def.name || 'item')
    }
  }
  return map
}

/** Map a feat-component id to a friendly feat name for display. */
function featNames(data: Any): Map<number, string> {
  const map = new Map<number, string>()
  for (const f of data?.feats || []) {
    const def = f?.definition || {}
    if (def.id != null) map.set(def.id, def.name || 'feat')
  }
  return map
}

function abilityContribs(
  data: Any,
  key: AbilityKey,
): { contributions: AbilityContribution[]; bonusSum: number; setMax: number | null } {
  const subType = `${ABILITY_FULL[key]}-score`
  const mods = data?.modifiers || {}
  const liveItems = activeItemDefIds(data)
  const feats = featNames(data)
  const contributions: AbilityContribution[] = []
  let bonusSum = 0
  let setMax: number | null = null
  // Tracks non-granted origin ASIs already counted, to avoid the species/background double-count.
  const seenOrigin = new Set<string>()

  const consider = (category: string, m: Any) => {
    if (m?.subType !== subType) return
    const value = Number(m.value) || 0
    const isSet = m.type === 'set'
    const kind: 'bonus' | 'set' = isSet ? 'set' : 'bonus'

    if (category === 'item') {
      const live = liveItems.has(m.componentId)
      const itemName = live ? liveItems.get(m.componentId) : undefined
      if (!live) {
        contributions.push({ source: 'item', value, kind, applied: false, note: 'not equipped/attuned — ignored' })
        return
      }
      contributions.push({ source: `item (${itemName})`, value, kind, applied: true })
    } else {
      // Deduplicate the same non-granted origin ASI mirrored across sources.
      if (!isSet && m.isGranted === false) {
        const dedupeKey = `${subType}|${value}`
        if (seenOrigin.has(dedupeKey)) {
          contributions.push({
            source: category === 'race' ? 'species' : category,
            value,
            kind,
            applied: false,
            note: 'duplicate origin ASI — counted once',
          })
          return
        }
        seenOrigin.add(dedupeKey)
      }
      const featName = category === 'feat' ? feats.get(m.componentId) : undefined
      const source =
        category === 'feat' && featName ? `feat (${featName})` : category === 'race' ? 'species' : category
      contributions.push({ source, value, kind, applied: true })
    }

    if (isSet) setMax = Math.max(setMax ?? 0, value)
    else bonusSum += value
  }

  for (const category of ACCUM_ORDER) {
    const arr = mods[category]
    if (Array.isArray(arr)) for (const m of arr) consider(category, m)
  }
  // condition modifiers are transient — show them as ignored, never counted
  if (Array.isArray(mods.condition)) {
    for (const m of mods.condition) {
      if (m?.subType === subType) {
        contributions.push({
          source: 'condition',
          value: Number(m.value) || 0,
          kind: m.type === 'set' ? 'set' : 'bonus',
          applied: false,
          note: 'transient — ignored',
        })
      }
    }
  }

  return { contributions, bonusSum, setMax }
}

function hasModifier(data: Any, type: string, subType: string): boolean {
  const mods = data?.modifiers || {}
  return Object.values(mods).some(
    (arr) => Array.isArray(arr) && arr.some((m) => m?.type === type && m?.subType === subType),
  )
}

function prettifySkill(subType: string): string {
  return subType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function abilityModValue(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function parseCharacter(data: Any): ParsedCharacter {
  const abilities = {} as Record<AbilityKey, number>
  const abilityBreakdown = {} as Record<AbilityKey, AbilityBreakdown>

  for (const key of ABILITY_KEYS) {
    const id = Object.entries(ABILITY_BY_ID).find(([, k]) => k === key)![0]
    const override = statValue(data.overrideStats, Number(id))
    const base = statValue(data.stats, Number(id)) ?? 10
    const bonusStats = statValue(data.bonusStats, Number(id)) ?? 0
    const { contributions, bonusSum, setMax } = abilityContribs(data, key)

    let total: number
    if (override != null) total = override
    else total = Math.max(base + bonusStats + bonusSum, setMax ?? 0)

    abilities[key] = total
    abilityBreakdown[key] = { base, bonusStats, override, contributions, total }
  }

  const classes = (data.classes || []).map((c: Any) => ({
    name: c?.definition?.name || 'Class',
    subclass: c?.subclassDefinition?.name || undefined,
    level: c?.level || 0,
  }))
  const totalLevel = classes.reduce((s: number, c: Any) => s + c.level, 0) || 1
  const profBonus = Math.floor((totalLevel - 1) / 4) + 2

  const conMod = abilityModValue(abilities.con)
  const baseHp = typeof data.baseHitPoints === 'number' ? data.baseHitPoints : undefined
  const overrideHp = typeof data.overrideHitPoints === 'number' ? data.overrideHitPoints : null
  const bonusHp = typeof data.bonusHitPoints === 'number' ? data.bonusHitPoints : 0
  let maxHp: number | undefined
  if (overrideHp != null) maxHp = overrideHp
  else if (baseHp != null) maxHp = baseHp + conMod * totalLevel + bonusHp

  const saveProf = ABILITY_KEYS.filter((key) =>
    hasModifier(data, 'proficiency', `${ABILITY_FULL[key]}-saving-throws`),
  ).map((key) => key.toUpperCase())

  const perceptionProficient = hasModifier(data, 'proficiency', 'perception')
  const perceptionExpertise = hasModifier(data, 'expertise', 'perception')
  const wisMod = abilityModValue(abilities.wis)
  const passivePerception =
    10 + wisMod + (perceptionExpertise ? profBonus * 2 : perceptionProficient ? profBonus : 0)

  const mods = data?.modifiers || {}
  const skillProf = Array.from(
    new Set(
      Object.values(mods)
        .flatMap((arr) => (Array.isArray(arr) ? arr : []))
        .filter(
          (m) => (m?.type === 'proficiency' || m?.type === 'expertise') && typeof m?.subType === 'string',
        )
        .map((m) => prettifySkill(m.subType)),
    ),
  )
    .filter((s) => SKILL_NAMES.has(s))
    .sort()

  return {
    name: data.name || 'Unnamed',
    avatarUrl: data.avatarUrl || data.decorations?.avatarUrl || undefined,
    race: data.race?.fullName || data.race?.baseRaceName || data.race?.baseName || 'Unknown race',
    classes,
    totalLevel,
    abilities,
    abilityBreakdown,
    profBonus,
    maxHp,
    passivePerception,
    perceptionProficient,
    perceptionExpertise,
    saveProf,
    skillProf,
    raw: data,
  }
}

const SKILL_NAMES = new Set([
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight Of Hand',
  'Stealth',
  'Survival',
])
