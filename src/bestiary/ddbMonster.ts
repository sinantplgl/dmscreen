import type { Abilities, Creature, StatEntry } from '../types'
import type { MonsterSource } from './monsterSource'

// ─────────────────────────────────────────────────────────────────────────────
// D&D Beyond monster import. Monster pages (non-paywalled) are SERVER-rendered,
// so we just fetch the HTML via the local /ddb-api/monster proxy (CORS bypass)
// and parse the 2024 stat block client-side with DOMParser — no browser needed.
//
// Selectors target the `mon-stat-block-2024` class substrings so minor markup
// tweaks are less likely to break them.
// ─────────────────────────────────────────────────────────────────────────────

const ATTR_FIELD: Record<string, 'ac' | 'initiative' | 'hp' | 'speed'> = {
  AC: 'ac',
  Initiative: 'initiative',
  HP: 'hp',
  Speed: 'speed',
}

const TIDBIT_FIELD: Record<string, keyof Creature> = {
  Skills: 'skills',
  Senses: 'senses',
  Languages: 'languages',
  CR: 'cr',
  Resistances: 'damageResistances',
  'Damage Resistances': 'damageResistances',
  Immunities: 'damageImmunities',
  'Damage Immunities': 'damageImmunities',
  'Condition Immunities': 'conditionImmunities',
  Vulnerabilities: 'damageVulnerabilities',
  'Damage Vulnerabilities': 'damageVulnerabilities',
  Gear: 'gear',
  Habitat: 'habitat',
  Treasure: 'treasure',
}

const HEADING_FIELD: Record<
  string,
  'traits' | 'actions' | 'bonusActions' | 'reactions' | 'legendary'
> = {
  Traits: 'traits',
  Actions: 'actions',
  'Bonus Actions': 'bonusActions',
  Reactions: 'reactions',
  'Legendary Actions': 'legendary',
}

const ABBR_KEY: Record<string, keyof Abilities> = {
  STR: 'str',
  DEX: 'dex',
  CON: 'con',
  INT: 'int',
  WIS: 'wis',
  CHA: 'cha',
}

const tidy = (s: string | null | undefined): string =>
  (s ?? '').replace(/\s+/g, ' ').replace(/\s+([,;.])/g, '$1').trim()

/** Parse a D&D Beyond 2024 monster page into a partial Creature. Browser-only. */
export function parseDdbMonster(html: string): Partial<Creature> {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const text = (el: Element | null | undefined) => tidy(el?.textContent)

  const nameEl = doc.querySelector('[class*="mon-stat-block-2024__name"]')
  if (!nameEl) {
    throw new Error('No 2024 stat block on that page — it may be paywalled or not a monster page.')
  }

  const out: Partial<Creature> = {}
  out.name = text(nameEl)
  out.meta = text(doc.querySelector('[class*="mon-stat-block-2024__meta"]'))

  // AC / Initiative / HP / Speed — each label's value is its next sibling.
  doc.querySelectorAll('[class*="mon-stat-block-2024__attribute-label"]').forEach((label) => {
    const field = ATTR_FIELD[text(label)]
    const valEl = label.nextElementSibling
    if (!field || !valEl) return
    const val = text(valEl.querySelector('[class*="attribute-data-value"]')) || text(valEl)
    const extra = text(valEl.querySelector('[class*="attribute-data-extra"]'))
    out[field] = extra ? `${val} ${extra}` : val
  })

  // Ability scores + proficient saves. Table columns: abbr | score | mod | save.
  const abilities: Abilities = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
  const saves: string[] = []
  doc.querySelectorAll('[class*="mon-stat-block-2024__stats"] tbody tr').forEach((tr) => {
    const cells = Array.from(tr.children)
    const key = ABBR_KEY[text(cells[0]).toUpperCase()]
    if (!key) return
    const score = parseInt(text(cells[1]), 10)
    if (!Number.isNaN(score)) abilities[key] = score
    const mod = text(cells[2])
    const save = text(cells[3])
    // a save that differs from the raw modifier means proficiency
    if (save && save !== mod) saves.push(`${key[0].toUpperCase()}${key.slice(1)} ${save}`)
  })
  out.abilities = abilities
  if (saves.length) out.saves = saves.join(', ')

  // Tidbits: Skills / Senses / Languages / CR / Immunities / Resistances / …
  doc.querySelectorAll('[class*="mon-stat-block-2024__tidbit"]').forEach((t) => {
    const labelEl = t.querySelector(':scope > [class*="tidbit-label"]')
    const dataEl = t.querySelector(':scope > [class*="tidbit-data"]')
    if (!labelEl || !dataEl) return
    const field = TIDBIT_FIELD[text(labelEl)]
    if (field) (out as Record<string, unknown>)[field] = text(dataEl)
  })

  // Description blocks → traits / actions / bonus actions / reactions / legendary.
  doc.querySelectorAll('[class*="mon-stat-block-2024__description-block"]').forEach((b) => {
    const heading = b.querySelector(':scope > [class*="description-block-heading"]')
    const content = b.querySelector(':scope > [class*="description-block-content"]')
    if (!heading || !content) return
    const field = HEADING_FIELD[text(heading)]
    if (!field) return

    const entries: StatEntry[] = []
    let intro = '' // leading nameless text in non-legendary blocks (rare)
    content.querySelectorAll(':scope > p').forEach((p) => {
      const full = text(p)
      // The legendary "uses" line is a `<p class="legendary-actions">` (a faded
      // preamble, NOT a named action) and can sit anywhere in the block — pull it
      // out by class so it never gets mistaken for / merged into an action item.
      if (/legendary-actions/.test(p.getAttribute('class') || '')) {
        if (full) out.legendaryIntro = tidy(out.legendaryIntro ? `${out.legendaryIntro} ${full}` : full)
        return
      }
      // The leading bold name is the first child element. DDB nests it either way
      // — <strong><em>Name.</em></strong> OR <em><strong>Name.</strong></em> — so
      // treat the first child as the name when it IS or CONTAINS a <strong>.
      // (Plain inline <em> like "Melee Attack Roll:" isn't bold, so it stays in the body.)
      const labelEl = p.firstElementChild
      const isNamed = !!labelEl && (labelEl.tagName === 'STRONG' || !!labelEl.querySelector('strong'))
      if (isNamed && labelEl) {
        const lead = text(labelEl)
        const name = lead.replace(/[.:]+\s*$/, '')
        const body = (full.startsWith(lead) ? full.slice(lead.length) : full).replace(/^[\s.:]+/, '').trim()
        entries.push({ name, text: body })
      } else if (entries.length) {
        // a continuation paragraph of the previous entry
        entries[entries.length - 1].text = tidy(`${entries[entries.length - 1].text} ${full}`)
      } else if (full) {
        // a leading nameless paragraph. In legendary blocks (older markup with no
        // class) treat it as the preamble; otherwise stash it for the fallback below.
        if (field === 'legendary') {
          out.legendaryIntro = tidy(out.legendaryIntro ? `${out.legendaryIntro} ${full}` : full)
        } else {
          intro = tidy(intro ? `${intro} ${full}` : full)
        }
      }
    })
    out[field] = entries
    // a non-legendary block that was *only* preamble text shouldn't vanish
    if (intro && entries.length === 0) entries.push({ name: '', text: intro })
  })

  // Primary artwork (combat portrait / stat-block backdrop). Lives outside the
  // block on the page, so query the whole document.
  const src = doc.querySelector('[class*="monster-image"]')?.getAttribute('src')
  if (src) out.imageUrl = src

  return out
}

export const DdbMonsterSource: MonsterSource = {
  id: 'ddb',
  label: 'D&D Beyond',
  match: (url) => {
    try {
      const u = new URL(url)
      return /(^|\.)dndbeyond\.com$/.test(u.hostname) && u.pathname.includes('/monsters/')
    } catch {
      return false
    }
  },
  fetchMonster: async (url) => {
    const r = await fetch(`/ddb-api/monster?url=${encodeURIComponent(url)}`)
    const json = await r.json().catch(() => ({}))
    if (!r.ok || json.success === false) {
      throw new Error(json.message || `Request failed (${r.status})`)
    }
    return parseDdbMonster(json.html as string)
  },
}
