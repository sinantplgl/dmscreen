import type { AppData, CampaignState, Creature, RefTable } from '../types'
import { uid } from '../lib/dnd'

// ─────────────────────────────────────────────────────────────────────────────
// Default seed data. Uses stable string ids so the seed layout can reference
// seed panels deterministically. Everything here is editable & overwritten once
// the user starts making changes (persisted to localStorage).
// ─────────────────────────────────────────────────────────────────────────────

const GORGATH: Creature = {
  id: 'cr_gorgath',
  name: 'Gorgath the Defiler',
  meta: 'Large undead, chaotic evil',
  ac: '17 (natural armor)',
  hp: '120 (16d10 + 32)',
  speed: '40 ft.',
  abilities: { str: 22, dex: 10, con: 20, int: 14, wis: 12, cha: 16 },
  saves: 'Con +9, Wis +5',
  skills: 'Intimidation +7, Perception +5',
  damageResistances: 'necrotic; bludgeoning, piercing, and slashing from nonmagical attacks',
  conditionImmunities: 'exhaustion, poisoned',
  senses: 'darkvision 60 ft., passive Perception 15',
  languages: 'Common, Abyssal',
  cr: '9 (5,000 XP)',
  traits: [
    { name: 'Undead Resilience', text: 'Gorgath is immune to poison and exhaustion, and is resistant to necrotic damage.' },
    { name: 'Aura of Dread', text: 'Each creature that starts its turn within 10 feet must succeed on a DC 15 Wisdom save or be frightened until the start of its next turn.' },
  ],
  actions: [
    { name: 'Multiattack', text: 'Gorgath makes two Bone Cleave attacks.' },
    { name: 'Bone Cleave', text: 'Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 2d8 + 6 slashing damage plus 1d6 necrotic damage.' },
    { name: 'Death Shriek (Recharge 5–6)', text: 'Gorgath unleashes a 30-foot cone of wailing. Each creature in the area must make a DC 16 Constitution save, taking 5d8 necrotic damage on a failed save, or half as much on a success.' },
  ],
  reactions: [
    { name: 'Bone Ward', text: 'When hit by a melee attack, Gorgath can add 3 to its AC against that attack, raising bone shards in defense.' },
  ],
}

// 2024 (5.5e) Monster Manual stat block — shows off the new format: Initiative
// line, per-ability saves, Bonus/Legendary Actions, Gear/Habitat/Treasure.
const ABOLETH: Creature = {
  id: 'cr_aboleth',
  name: 'Aboleth',
  meta: 'Large Aberration, Lawful Evil',
  ac: '17',
  initiative: '+7 (17)',
  hp: '150 (20d10 + 40)',
  speed: '10 ft., Swim 40 ft.',
  abilities: { str: 21, dex: 9, con: 15, int: 18, wis: 15, cha: 18 },
  saves: 'Dex +3, Con +6, Int +8, Wis +6',
  skills: 'History +12, Perception +10',
  senses: 'Darkvision 120 ft.; Passive Perception 20',
  languages: 'Deep Speech, Telepathy 120 ft.',
  cr: '10 (XP 5,900, or 7,200 in lair; PB +4)',
  traits: [
    { name: 'Amphibious', text: 'The aboleth can breathe air and water.' },
    {
      name: 'Eldritch Restoration',
      text: 'If destroyed, the aboleth gains a new body in 5d10 days, reviving with all its Hit Points in the Far Realm or another location chosen by the DM.',
    },
    {
      name: 'Legendary Resistance (3/Day, or 4/Day in Lair)',
      text: 'If the aboleth fails a saving throw, it can choose to succeed instead.',
    },
    {
      name: 'Mucus Cloud',
      text: "While underwater, the aboleth is surrounded by mucus. Constitution Saving Throw: DC 14, each creature in a 5-foot Emanation originating from the aboleth at the end of the aboleth's turn. Failure: The target is cursed. Until the curse ends, the target's skin becomes slimy, the target can breathe air and water, and it can't regain Hit Points unless it is underwater. While the cursed creature is outside a body of water, the creature takes 6 (1d12) Acid damage at the end of every 10 minutes unless moisture is applied to its skin before those minutes have passed.",
    },
    {
      name: 'Probing Telepathy',
      text: "If a creature the aboleth can see communicates telepathically with the aboleth, the aboleth learns the creature's greatest desires.",
    },
  ],
  actions: [
    {
      name: 'Multiattack',
      text: 'The aboleth makes two Tentacle attacks and uses either Consume Memories or Dominate Mind if available.',
    },
    {
      name: 'Tentacle',
      text: 'Melee Attack Roll: +9, reach 15 ft. Hit: 12 (2d6 + 5) Bludgeoning damage. If the target is a Large or smaller creature, it has the Grappled condition (escape DC 14) from one of four tentacles.',
    },
    {
      name: 'Consume Memories',
      text: 'Intelligence Saving Throw: DC 16, one creature within 30 feet that is Charmed or Grappled by the aboleth. Failure: 10 (3d6) Psychic damage. Success: Half damage. Failure or Success: The aboleth gains the target’s memories if the target is a Humanoid and is reduced to 0 Hit Points by this action.',
    },
    {
      name: 'Dominate Mind (2/Day)',
      text: 'Wisdom Saving Throw: DC 16, one creature the aboleth can see within 30 feet. Failure: The target has the Charmed condition until the aboleth dies or is on a different plane of existence from the target. While Charmed, the target acts as an ally to the aboleth and is under its control while within 60 feet of it. In addition, the aboleth and the target can communicate telepathically with each other over any distance. The target repeats the save whenever it takes damage as well as after every 24 hours it spends at least 1 mile away from the aboleth, ending the effect on itself on a success.',
    },
  ],
  legendary: [
    { name: 'Lash', text: 'The aboleth makes one Tentacle attack.' },
    {
      name: 'Psychic Drain',
      text: 'If the aboleth has at least one creature Charmed or Grappled, it uses Consume Memories and regains 5 (1d10) Hit Points.',
    },
  ],
  habitat: 'Underdark, Underwater',
  treasure: 'Relics',
}

const SHADOW_WRAITH: Creature = {
  id: 'cr_shadow_wraith',
  name: 'Shadow Wraith',
  meta: 'Medium undead, neutral evil',
  ac: '13',
  hp: '45 (10d8)',
  speed: '0 ft., fly 60 ft. (hover)',
  abilities: { str: 6, dex: 16, con: 12, int: 11, wis: 14, cha: 15 },
  damageResistances: 'acid, cold, fire, lightning, thunder; nonmagical attacks',
  damageImmunities: 'necrotic, poison',
  conditionImmunities: 'exhaustion, grappled, paralyzed, petrified, poisoned, prone, restrained',
  senses: 'darkvision 60 ft., passive Perception 12',
  languages: 'understands the languages it knew in life',
  cr: '5 (1,800 XP)',
  traits: [
    { name: 'Incorporeal Movement', text: 'The wraith can move through other creatures and objects as if they were difficult terrain.' },
    { name: 'Sunlight Sensitivity', text: 'While in sunlight, the wraith has disadvantage on attack rolls and Perception checks that rely on sight.' },
  ],
  actions: [
    { name: 'Life Drain', text: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 3d6 + 3 necrotic damage. The target must succeed on a DC 14 Constitution save or its hit point maximum is reduced by an amount equal to the damage taken.' },
  ],
}

const VAULT_SKELETON: Creature = {
  id: 'cr_vault_skeleton',
  name: 'Vault Skeleton',
  meta: 'Medium undead, lawful evil',
  ac: '13 (armor scraps)',
  hp: '13 (2d8 + 4)',
  speed: '30 ft.',
  abilities: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
  damageImmunities: 'poison',
  conditionImmunities: 'exhaustion, poisoned',
  senses: 'darkvision 60 ft., passive Perception 9',
  languages: 'understands Common but can\'t speak',
  cr: '1/4 (50 XP)',
  traits: [],
  actions: [
    { name: 'Shortsword', text: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 1d6 + 2 piercing damage.' },
    { name: 'Shortbow', text: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 1d6 + 2 piercing damage.' },
  ],
}

const REFERENCE_TABLES: RefTable[] = [
  {
    id: 'tbl_conditions',
    title: 'Conditions',
    columns: ['Condition', 'Effect'],
    rows: [
      ['Blinded', 'Auto-fail checks requiring sight; attacks vs. it have advantage; its attacks have disadvantage.'],
      ['Charmed', "Can't attack the charmer; charmer has advantage on social checks against it."],
      ['Frightened', "Disadvantage on checks/attacks while source is in sight; can't willingly move closer to the source."],
      ['Grappled', 'Speed becomes 0; ends if grappler is incapacitated or target is moved out of reach.'],
      ['Paralyzed', 'Incapacitated; auto-fail Str/Dex saves; attacks have advantage; hits within 5 ft. are crits.'],
      ['Poisoned', 'Disadvantage on attack rolls and ability checks.'],
      ['Prone', 'Disadvantage on attacks; melee within 5 ft. has advantage; ranged has disadvantage.'],
      ['Restrained', 'Speed 0; disadvantage on attacks & Dex saves; attacks against it have advantage.'],
      ['Stunned', "Incapacitated; can't move; auto-fail Str/Dex saves; attacks against it have advantage."],
      ['Unconscious', 'Incapacitated, drops prone; auto-fail Str/Dex; attacks have advantage; hits within 5 ft. are crits.'],
    ],
  },
  {
    id: 'tbl_dcs',
    title: 'Difficulty Classes',
    columns: ['Task Difficulty', 'DC'],
    rows: [
      ['Very Easy', '5'],
      ['Easy', '10'],
      ['Medium', '15'],
      ['Hard', '20'],
      ['Very Hard', '25'],
      ['Nearly Impossible', '30'],
    ],
  },
  {
    id: 'tbl_cover',
    title: 'Cover & Vision',
    columns: ['Type', 'Effect'],
    rows: [
      ['Half cover', '+2 to AC and Dexterity saving throws.'],
      ['Three-quarters cover', '+5 to AC and Dexterity saving throws.'],
      ['Full cover', "Can't be targeted directly by an attack or spell."],
      ['Lightly obscured', 'Disadvantage on Wisdom (Perception) checks relying on sight.'],
      ['Heavily obscured', 'A creature effectively suffers the blinded condition.'],
    ],
  },
  {
    id: 'tbl_actions',
    title: 'Actions in Combat',
    columns: ['Action', 'Summary'],
    rows: [
      ['Attack', 'Make one melee or ranged attack (more with Extra Attack).'],
      ['Dash', 'Gain extra movement equal to your speed.'],
      ['Disengage', "Your movement doesn't provoke opportunity attacks."],
      ['Dodge', 'Attacks against you have disadvantage; advantage on Dex saves.'],
      ['Help', 'Give an ally advantage on their next check or attack.'],
      ['Hide', 'Make a Stealth check vs. passive Perception.'],
      ['Ready', 'Prepare an action to trigger off a perceivable circumstance.'],
    ],
  },
  {
    id: 'tbl_xp_thresholds',
    title: 'Encounter Difficulty (per character)',
    columns: ['Char. Level', 'Easy', 'Medium', 'Hard', 'Deadly'],
    rows: [
      ['5', '250', '500', '750', '1,100'],
      ['6', '300', '600', '900', '1,400'],
      ['7', '350', '750', '1,100', '1,700'],
      ['8', '450', '900', '1,400', '2,100'],
      ['9', '550', '1,100', '1,600', '2,400'],
      ['10', '600', '1,200', '1,900', '2,800'],
    ],
  },
  {
    id: 'tbl_concentration',
    title: 'Concentration',
    columns: ['Trigger', 'Result'],
    rows: [
      ['Take damage', 'Con save, DC 10 or half the damage taken (whichever is higher).'],
      ['Cast another concentration spell', 'The previous spell ends.'],
      ['Incapacitated or killed', 'Concentration ends.'],
      ['War Caster feat', 'Advantage on Constitution saves to maintain concentration.'],
    ],
  },
]

export function makeDefaultData(): AppData {
  return {
    campaigns: [{ id: 'camp_1', name: 'Shadows of Valdremor' }],
    activeCampaignId: 'camp_1',
    inactiveCampaigns: {},
    activeTabId: 'tab_table',
    tabs: [
      {
        id: 'tab_table',
        name: 'At the Table',
        columns: [
          { id: 'col_1', width: 1, panels: [{ id: 'p_combat', type: 'combat' }, { id: 'p_dice', type: 'dice' }] },
          { id: 'col_2', width: 1, panels: [{ id: 'p_session_tracker', type: 'session' }] },
          { id: 'col_3', width: 1, panels: [{ id: 'p_bestiary', type: 'bestiary' }] },
        ],
      },
      {
        id: 'tab_party',
        name: 'Party',
        columns: [
          { id: 'col_party', width: 1, panels: [{ id: 'p_players', type: 'players' }] },
        ],
      },
      {
        id: 'tab_ref',
        name: 'Reference',
        columns: [
          { id: 'col_ref', width: 1, panels: [{ id: 'p_ref', type: 'reference' }] },
        ],
      },
    ],
    round: 3,
    activeTurn: 0,
    combatants: [
      { id: 'cb_1', name: 'Thalindra Ashveil', type: 'Player', init: 20, hp: 34, maxHp: 40, ac: 16, conditions: [], isPlayer: true },
      { id: 'cb_2', name: 'Borric Stonefist', type: 'Player', init: 18, hp: 22, maxHp: 52, ac: 18, conditions: ['Prone'], isPlayer: true },
      { id: 'cb_3', name: 'Shadow Wraith', type: 'Undead', init: 15, hp: 18, maxHp: 45, ac: 13, conditions: ['Frightened'], isPlayer: false, creatureId: 'cr_shadow_wraith' },
      { id: 'cb_4', name: 'Gorgath the Defiler', type: 'Monster', init: 12, hp: 65, maxHp: 120, ac: 17, conditions: [], isPlayer: false, creatureId: 'cr_gorgath' },
      { id: 'cb_5', name: 'Vault Skeleton ×3', type: 'Undead', init: 8, hp: 24, maxHp: 39, ac: 13, conditions: [], isPlayer: false, creatureId: 'cr_vault_skeleton' },
    ],
    parties: [{ id: 'party_1', name: 'Main Party' }],
    activePartyId: 'party_1',
    players: [
      { id: 'pl_1', partyId: 'party_1', name: 'Thalindra Ashveil', className: 'Ranger (Gloom Stalker)', level: 7, abilities: { str: 10, dex: 18, con: 14, int: 12, wis: 16, cha: 10 }, maxHp: 40, ac: 16, ddbUrl: '' },
      { id: 'pl_2', partyId: 'party_1', name: 'Borric Stonefist', className: 'Fighter (Battle Master)', level: 7, abilities: { str: 18, dex: 12, con: 16, int: 10, wis: 11, cha: 13 }, maxHp: 52, ac: 18, ddbUrl: '' },
      { id: 'pl_3', partyId: 'party_1', name: 'Seraphine Voss', className: 'Wizard (Evocation)', level: 6, abilities: { str: 8, dex: 14, con: 13, int: 18, wis: 12, cha: 11 }, maxHp: 35, ac: 13, ddbUrl: '' },
      { id: 'pl_4', partyId: 'party_1', name: 'Durin Copperpot', className: 'Rogue (Arcane Trickster)', level: 7, abilities: { str: 10, dex: 18, con: 14, int: 13, wis: 12, cha: 14 }, maxHp: 44, ac: 15, ddbUrl: '' },
    ],
    bestiary: [ABOLETH, GORGATH, SHADOW_WRAITH, VAULT_SKELETON],
    tables: REFERENCE_TABLES,
    sessionNodes: [
      {
        id: 'sn_session',
        order: 0,
        type: 'session',
        title: 'Session 7 — The Sunken Vault',
        body: 'The party descends into the flooded lower vault.',      },
      {
        id: 'sn_quest',
        parentId: 'sn_session',
        order: 0,
        type: 'quest',
        title: 'Destroy the Obsidian Seal',
        body: 'Carries over from session 6. **Milestone:** level up to 8 when destroyed.',      },
      {
        id: 'sn_room',
        parentId: 'sn_session',
        order: 1,
        type: 'scene',
        title: 'The Reliquary',
        body: 'Waist-deep water, glyph-carved pillars. A bell hangs near the altar.',      },
      {
        id: 'sn_npc',
        parentId: 'sn_room',
        order: 0,
        type: 'npc',
        title: 'Gorgath the Defiler',
        body: 'Servant of the Pale Court. Taunts the party from the far gallery.',      },
      // Children of Gorgath — focus him + switch to Board view to see these two
      // cards (a stat block + a note) arranged side by side.
      {
        id: 'sn_npc_sb',
        parentId: 'sn_npc',
        order: 0,
        type: 'statblock',
        title: 'Stat Block',
        body: '',        creatureId: 'cr_gorgath',
        layout: { x: 0, y: 0, w: 4, h: 12 },
      },
      {
        id: 'sn_npc_note',
        parentId: 'sn_npc',
        order: 1,
        type: 'note',
        title: 'Tactics & Secrets',
        body: '- Opens by **taunting**, stays at range\n- Knows the bell summons the Archivist\n- Flees below 40 HP toward the seal',        layout: { x: 4, y: 0, w: 4, h: 8 },
      },
    ],
    diceHistory: [],
    ddbCobalt: '',
  }
}

/**
 * A blank workspace for a freshly-created campaign: an empty session board,
 * empty combat, and one empty party — no demo content. The bestiary and
 * reference tables are shared globally, so they're intentionally absent here.
 */
export function makeFreshCampaign(): CampaignState {
  const tableTabId = uid('tab')
  const partyId = uid('party')
  return {
    tabs: [
      {
        id: tableTabId,
        name: 'At the Table',
        columns: [
          { id: uid('col'), width: 1, panels: [{ id: uid('p'), type: 'combat' }, { id: uid('p'), type: 'dice' }] },
          { id: uid('col'), width: 1, panels: [{ id: uid('p'), type: 'session' }] },
          { id: uid('col'), width: 1, panels: [{ id: uid('p'), type: 'bestiary' }] },
        ],
      },
      {
        id: uid('tab'),
        name: 'Party',
        columns: [{ id: uid('col'), width: 1, panels: [{ id: uid('p'), type: 'players' }] }],
      },
    ],
    activeTabId: tableTabId,
    combatants: [],
    round: 1,
    activeTurn: 0,
    parties: [{ id: partyId, name: 'Main Party' }],
    activePartyId: partyId,
    players: [],
    sessionNodes: [],
    diceHistory: [],
  }
}
