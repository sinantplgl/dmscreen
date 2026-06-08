// ─────────────────────────────────────────────────────────────────────────────
// Core domain + layout types for the DM Screen.
// Panels are *views* onto shared data slices; a PanelInstance only stores its
// type + small per-instance config, so two panels of the same type stay in sync.
// ─────────────────────────────────────────────────────────────────────────────

export type PanelType =
  | 'combat'
  | 'dice'
  | 'players'
  | 'bestiary'
  | 'reference'
  | 'session'
  | 'webframe'

export interface PanelInstance {
  id: string
  type: PanelType
  /** Per-instance UI config, e.g. notes panel remembers its active note tab. */
  config?: Record<string, unknown>
  /** Explicit pixel height set by dragging the panel's bottom resize grip.
   *  Unset = auto (sized to content). Width is governed by the column. */
  height?: number
}

export interface Column {
  id: string
  /** Flex weight used for resizable widths (defaults to 1). */
  width: number
  panels: PanelInstance[]
}

export interface Tab {
  id: string
  name: string
  columns: Column[]
}

// ── Ability scores ────────────────────────────────────────────────────────────
export interface Abilities {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

// ── Combat ──────────────────────────────────────────────────────────────────
export interface Combatant {
  id: string
  name: string
  type: string // e.g. "Player", "Undead", "Monster"
  init: number
  hp: number
  maxHp: number
  ac: number
  conditions: string[]
  isPlayer: boolean
  /** Set when multiple combatants share a name, e.g. 1, 2, 3 — shown as a grayed "#2". */
  dupNumber?: number
  /** Portrait image URL shown in the tracker (auto-filled for players, editable for any). */
  portraitUrl?: string
  /** Mirror the portrait horizontally (carried from the creature's artwork). */
  portraitFlip?: boolean
  /** Optional link back to a bestiary creature so combat can show its stat block. */
  creatureId?: string
}

// ── Parties ───────────────────────────────────────────────────────────────────
export interface Party {
  id: string
  name: string
}

// ── DDB rendered sheet snapshot ────────────────────────────────────────────────
export interface AbilityStat {
  score: number
  mod: string // e.g. "+3"
}
export interface SaveStat {
  bonus: string // e.g. "+5"
  proficient: boolean
}
export interface SkillStat {
  name: string
  bonus: string
  proficiency: string // "Proficient" | "Expertise" | "Not Proficient" | "None" | ...
}
/** DDB-exact snapshot read from the rendered character sheet. */
export interface CharacterSheet {
  name: string
  summary?: string | null
  /** Class line as DDB shows it, e.g. "Fighter (Battle Master)" or "Fighter / Rogue". */
  classSummary?: string | null
  /** Total character level. */
  level?: number | null
  avatarUrl?: string | null
  ac: number | null
  hpCurrent: number | null
  hpMax: number | null
  hpTemp: number | null
  speed: string | null
  initiative: string | null
  profBonus: number | null
  abilities: Record<string, AbilityStat> // keyed STR/DEX/...
  saves: Record<string, SaveStat>
  skills: SkillStat[]
  senses: string[]
  conditions: string[]
  passivePerception: number | null
  passiveInvestigation: number | null
  passiveInsight: number | null
  /** ISO timestamp set when the snapshot was fetched. */
  fetchedAt?: string
}

// ── Players ───────────────────────────────────────────────────────────────────
export interface Player {
  id: string
  partyId: string
  name: string
  className: string // class + subclass label, free text
  level: number
  abilities: Abilities
  maxHp: number
  /** Current HP for the card's HP bar. Blank = treated as full (maxHp). */
  currentHp?: number
  ac: number
  /** Walking speed line, e.g. "30 ft." Blank = "30 ft." on the card. */
  speed?: string
  /** Initiative bonus override, e.g. "+2". Blank = derived from the DEX modifier. */
  initiative?: string
  /** Proficiency bonus override. Blank = derived from level (2 + ⌊(level-1)/4⌋). */
  profBonus?: number
  /** Ability keys with a saving-throw proficiency; drives the card's save bonuses. */
  saveProficiencies?: (keyof Abilities)[]
  /** Passive Perception. Optional: when set (e.g. imported from DDB, or entered
   *  manually) it overrides the 10 + WIS-mod estimate the card would otherwise show. */
  passivePerception?: number
  /** Passive Investigation override. Blank = 10 + INT mod. */
  passiveInvestigation?: number
  /** Passive Insight override. Blank = 10 + WIS mod. */
  passiveInsight?: number
  portraitUrl?: string
  /** Full D&D Beyond character page URL (preferred). */
  ddbUrl?: string
  /** D&D Beyond numeric character id (derived from the URL when possible). */
  ddbCharacterId?: string
  notes?: string
  /** Last DDB-exact rendered snapshot, shown on the card when present. */
  sheet?: CharacterSheet
}

// ── Bestiary / stat blocks ────────────────────────────────────────────────────
export interface StatEntry {
  name: string
  text: string
}

export interface Creature {
  id: string
  name: string
  /** Italic type line, e.g. "Large undead, chaotic evil". */
  meta: string
  ac: string // free text so "17 (natural armor)" works
  /** Artwork URL: shown as a left-anchored backdrop behind the stats and reused
   *  as the combat-tracker portrait when the creature is sent to combat. */
  imageUrl?: string
  /** Mirror the artwork horizontally (some art reads better facing the other way). */
  imageFlip?: boolean
  /** 2024 initiative line, e.g. "+7 (17)". Optional — computed from DEX when empty. */
  initiative?: string
  hp: string // free text so "120 (16d10 + 32)" works
  speed: string
  abilities: Abilities
  saves?: string
  skills?: string
  damageVulnerabilities?: string
  damageResistances?: string
  damageImmunities?: string
  conditionImmunities?: string
  /** 2024 "Gear" line — notable equipment, e.g. "Greataxe, Javelin (3)". */
  gear?: string
  senses?: string
  languages?: string
  cr: string
  traits: StatEntry[]
  actions: StatEntry[]
  /** 2024 stat blocks split these out from Actions. */
  bonusActions?: StatEntry[]
  reactions?: StatEntry[]
  /** Preamble shown above the legendary actions (the "Legendary Action Uses: N…" line). */
  legendaryIntro?: string
  legendary?: StatEntry[]
  /** 2024 Monster Manual footer lines. */
  habitat?: string
  treasure?: string
}

// ── Reference items (tables, notes, images) ────────────────────────────────────
export interface RefItemBase {
  id: string
  title: string
  /** Built-in items ship with the app and can't be deleted, only copied. */
  builtin?: boolean
  /** Placement on the reference board, in grid units (columns / rows). */
  layout?: { x: number; y: number; w: number; h: number }
}
/** `kind` is optional on tables so older persisted data (no kind) still loads. */
export interface RefTable extends RefItemBase {
  kind?: 'table'
  columns: string[]
  rows: string[][]
}
export interface RefNote extends RefItemBase {
  kind: 'note'
  body: string
}
export interface RefImage extends RefItemBase {
  kind: 'image'
  url: string
  caption?: string
}
export type RefItem = RefTable | RefNote | RefImage

// ── Session tracker (an arbitrarily-nested tree of typed nodes) ──────────────────
/**
 * One node in the session tree. `type` is a FREE-FORM cosmetic label (icon + name
 * for scanning) and carries NO behavior — nesting, stat-block link and image are
 * available on every node regardless of type. The tree is stored flat:
 * children = nodes sharing this node's id as `parentId`, ordered by `order`.
 */
export interface SessionNode {
  id: string
  parentId?: string // undefined = top-level node
  order: number // position among siblings sharing the same parentId
  type: string // free-form label, e.g. 'session' | 'quest' | 'room' | 'npc' | anything
  icon?: string // optional emoji override; else derived from a preset or a default glyph
  /** Explicit numbering override. When set, this node shows this number among its
   *  siblings and the following siblings continue from it; auto-numbered otherwise. */
  number?: number
  title: string
  body: string // markdown
  collapsed?: boolean // tree expand/collapse (persisted)
  creatureId?: string // link to a bestiary Creature — allowed on ANY node
  imageUrl?: string // map / portrait / reference image — allowed on ANY node
  /** Free-placement board arrangement (grid units) within the parent's board view. */
  layout?: { x: number; y: number; w: number; h: number }
  /** Hidden from the board view (still visible in the tree). */
  hidden?: boolean
  /** When set, this is an alias node pointing at the canonical node with this id.
   *  The alias renders the target's icon/title (read-only) and jumps to it on click.
   *  Alias nodes carry no children, body, or content of their own. */
  refId?: string
}

/** A single roll of a dice pool: the individual die faces plus the final total. */
export interface RollResult {
  rolls: number[] // individual die faces, in pool order
  total: number // sum of rolls + modifier
}
export interface DiceRoll {
  id: string
  expr: string // human label, e.g. "2d6 + 1d8 + 2" or "d20 + 3 ×5"
  dice: number[] // die sizes in the pool, e.g. [6, 6, 8] — used for crit/fumble detection
  modifier: number
  /** One entry per repeat; length ≥ 1. Multiple when the pool is rolled several times. */
  results: RollResult[]
}

// ── Campaigns ───────────────────────────────────────────────────────────────
/** Lightweight metadata for the campaign selector. */
export interface Campaign {
  id: string
  name: string
}

/**
 * The slice of state that belongs to a single campaign. Switching campaigns
 * swaps ALL of these out; the bestiary, reference tables and app settings are
 * shared across every campaign and live directly on AppData instead.
 */
export interface CampaignState {
  tabs: Tab[]
  activeTabId: string
  combatants: Combatant[]
  round: number
  activeTurn: number
  parties: Party[]
  activePartyId: string
  players: Player[]
  sessionNodes: SessionNode[]
  diceHistory: DiceRoll[]
}

// ── Root persisted state ────────────────────────────────────────────────────
export interface AppData extends CampaignState {
  /** All campaigns (just id + name); the full state of the active one is held in
   *  the CampaignState fields above, the rest are stashed in `inactiveCampaigns`. */
  campaigns: Campaign[]
  activeCampaignId: string
  /** Snapshots of every campaign EXCEPT the active one, keyed by campaign id. */
  inactiveCampaigns: Record<string, CampaignState>

  // ── shared across all campaigns ──
  bestiary: Creature[]
  tables: RefItem[]
  /**
   * D&D Beyond CobaltSession cookie, used by the proxy to fetch campaign-only
   * characters. Persisted locally for convenience but deliberately EXCLUDED from
   * JSON export (it's a credential). Never leaves your machine except to the
   * local /ddb-api proxy, which forwards it to D&D Beyond.
   */
  ddbCobalt: string
}
