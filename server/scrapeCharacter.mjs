// ─────────────────────────────────────────────────────────────────────────────
// "Rendered" D&D Beyond scrape: load the character sheet in a headless browser
// (so DDB itself computes every value) and read the final numbers out of the
// DOM. This gives DDB-exact AC / HP / ability scores / passive scores without us
// reimplementing DDB's rules engine.
//
// Selectors target DDB's class-name *substrings* (ddbc-/ct-) so minor markup
// tweaks are less likely to break them; the returned `debug` block surfaces what
// was/wasn't found so selectors can be re-tuned quickly.
// ─────────────────────────────────────────────────────────────────────────────
import { getBrowser } from './browser.mjs'

const SHEET_URL = (id) => `https://www.dndbeyond.com/characters/${id}`

// Runs inside the page. Must be self-contained (no outer-scope refs).
/* eslint-disable */
function extract() {
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null)
  const q = (s) => document.querySelector(s)
  const qa = (s) => Array.from(document.querySelectorAll(s))
  const num = (s) => {
    if (s == null) return null
    const m = String(s).match(/-?\d+/)
    return m ? parseInt(m[0], 10) : null
  }

  // ── ability scores ── { STR: { score, mod }, ... }
  const abilities = {}
  qa('[class*="ability-summary"]').forEach((node) => {
    const abbr = txt(node.querySelector('[class*="ability-summary__abbr"]'))
    const score = txt(node.querySelector('[class*="ability-summary__secondary"]'))
    const mod = txt(node.querySelector('[class*="ability-summary__primary"]'))
    if (abbr && score != null) {
      abilities[abbr.toUpperCase()] = { score: num(score), mod }
    }
  })

  // ── saving throws ── keyed by ability, from BEM class "...__ability--str"
  const saves = {}
  qa('[class*="saving-throws-summary__ability--"]').forEach((node) => {
    const m = node.className.match(/ability--([a-z]{3})/)
    if (!m) return
    const ab = m[1].toUpperCase()
    const modEl = node.querySelector('[class*="ability-modifier"]')
    const bonus = txt(modEl) || (txt(node).match(/[+-]?\d+/) || [])[0] || null
    const proficient = !!node.querySelector('[aria-label="Proficient"],[aria-label="Expertise"]')
    saves[ab] = { bonus, proficient }
  })

  // ── skills ──
  const skills = []
  qa('[class*="ct-skills__item"]').forEach((node) => {
    const name = txt(node.querySelector('[class*="col--skill"]'))
    const bonus = txt(node.querySelector('[class*="col--modifier"]'))
    const profEl = node.querySelector('[class*="col--proficiency"] [aria-label]')
    const proficiency = profEl ? profEl.getAttribute('aria-label') : 'None'
    if (name) skills.push({ name, bonus, proficiency })
  })

  // ── speed / proficiency bonus ──
  const speedText = txt(q('[class*="speed-box"]')) || txt(q('[class*="ct-speed"]')) || ''
  const speedM = speedText.match(/(\d+)\s*ft/i)
  const speed = speedM ? `${speedM[1]} ft.` : null
  const profText = txt(q('[class*="proficiency-bonus-box"]')) || ''
  const profBonus = num((profText.match(/\+\s*(\d+)/) || [])[1])

  // ── armor class ──
  const acText =
    txt(q('[class*="armor-class-box__value"]')) ||
    txt(q('[class*="ArmorClass"] [class*="value"]')) ||
    txt(q('[class*="armor-class"] [class*="value"]'))

  // ── hit points ── DDB renders this box two ways depending on layout/browser:
  //   expanded: "...Current 8 / Max Max hit points 11 Temp --"  (labelled)
  //   compact:  "Hit Points17/27"                               (current/max)
  const healthText = txt(q('[class*="quick-info__health"]')) || txt(q('[class*="health"]')) || ''
  let hpCurrent = (healthText.match(/Current\s*([0-9]+)/i) || [])[1] ?? null
  let hpMax = (healthText.match(/Max hit points\s*([0-9]+)/i) || [])[1] ?? null
  // Fallback for the compact "N/M" form. The labelled form has no bare "N/M"
  // (it reads "8 / Max …"), so this only fires when the labels were absent.
  if (hpCurrent == null || hpMax == null) {
    const slash = healthText.match(/([0-9]+)\s*\/\s*([0-9]+)/)
    if (slash) {
      if (hpCurrent == null) hpCurrent = slash[1]
      if (hpMax == null) hpMax = slash[2]
    }
  }
  const hpDebug = healthText

  // ── senses / passive scores ── the number PRECEDES the label, e.g. "13Passive Perception"
  const sensesText = txt(q('[class*="ct-senses"]')) || ''
  const passiveOf = (skill) => {
    const m = sensesText.match(new RegExp('([0-9]+)\\s*Passive\\s*' + skill, 'i'))
    return m ? parseInt(m[1], 10) : null
  }
  // special senses (Darkvision/Blindsight/Tremorsense/Truesight + range)
  const senses = []
  const senseRe = /(Blindsight|Darkvision|Tremorsense|Truesight)\s*([0-9]+)\s*ft/gi
  let sm
  while ((sm = senseRe.exec(sensesText))) senses.push(`${sm[1]} ${sm[2]} ft.`)

  // ── identity ──
  let name = txt(q('[class*="ddbc-character-name"]')) || txt(q('[class*="character-name"]'))
  if (!name) {
    name = (document.title || '')
      .split(/\s*[-|]\s*/)[0]
      .replace(/'s Character Sheet.*$/i, '')
      .trim()
  }
  // race/class/level subtitle: join the individual tidbit chips ("__tidbit" =
  // BEM element, avoids matching the container) — dedupe and drop name/Manage.
  let summary = null
  {
    const chips = Array.from(document.querySelectorAll('[class*="__tidbit"]'))
      .map((c) => txt(c))
      .filter((s) => s && !/^manage$/i.test(s) && s !== name)
    summary = Array.from(new Set(chips)).join(' · ') || null
  }
  const avatarEl = q('[class*="ddbc-character-avatar"] img, [class*="character-avatar"] img')
  const avatarUrl = avatarEl ? avatarEl.getAttribute('src') : null

  // ── class & level ── shown in the header summary under the name. Markup varies,
  // so gather class-name chips a few ways and parse a total level; debug below
  // surfaces what was seen so selectors can be re-tuned if DDB shifts its markup.
  const summaryText =
    txt(q('[class*="ddbc-character-summary"]')) || txt(q('[class*="character-summary"]')) || ''
  const classChips = qa(
    '[class*="character-summary__classes"], [class*="summary__classes"], ' +
      '[class*="ddbc-character-summary"] [class*="class"], [class*="class-summary"]',
  )
    .map(txt)
    .filter((s) => s && !/^manage$/i.test(s) && s !== name)
  // The chip(s) read like "Ranger 4" or "Fighter 5 / Rogue 2" — class name + that
  // class's level. Split off the digits: total level vs. clean class-name string.
  const rawClasses = Array.from(new Set(classChips)).join(' / ')
  let level = null
  const lvlM = summaryText.match(/Level\s*([0-9]+)/i)
  if (lvlM) level = parseInt(lvlM[1], 10)
  else {
    // total character level = sum of the per-class levels
    const nums = (rawClasses.match(/[0-9]+/g) || []).map(Number)
    if (nums.length) level = nums.reduce((a, b) => a + b, 0)
  }
  const classSummary =
    rawClasses
      .replace(/\b\d+\b/g, ' ')
      .replace(/\s*\/\s*/g, ' / ')
      .replace(/\s+/g, ' ')
      .trim() || null

  // active conditions (box shows "Add Active Conditions" when there are none)
  const condText = txt(q('[class*="ct-conditions"]')) || ''
  const conditions = /Add Active Conditions/i.test(condText) ? [] : condText ? [condText] : []

  const hpTemp = (healthText.match(/Temp\s*([0-9]+)/i) || [])[1] ?? null

  return {
    name,
    summary,
    classSummary,
    level,
    avatarUrl,
    ac: num(acText),
    hpCurrent: num(hpCurrent),
    hpMax: num(hpMax),
    hpTemp: num(hpTemp),
    speed,
    initiative: abilities.DEX ? abilities.DEX.mod : null,
    profBonus,
    abilities,
    saves,
    skills,
    senses,
    conditions,
    passivePerception: passiveOf('Perception'),
    passiveInvestigation: passiveOf('Investigation'),
    passiveInsight: passiveOf('Insight'),
    debug: { acText, hpDebug, sensesText, summaryText, classChips },
  }
}
/* eslint-enable */

export async function scrapeCharacter(id, cobalt) {
  const browser = await getBrowser()
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    viewport: { width: 1400, height: 1000 },
  })
  try {
    if (cobalt && cobalt.trim()) {
      await context.addCookies([
        {
          name: 'CobaltSession',
          value: cobalt.trim(),
          domain: '.dndbeyond.com',
          path: '/',
          httpOnly: true,
          secure: true,
        },
      ])
    }
    const page = await context.newPage()
    await page.goto(SHEET_URL(id), { waitUntil: 'domcontentloaded', timeout: 60000 })
    // wait for the sheet to actually render its stats
    await page
      .waitForSelector('[class*="ability-summary"], [class*="armor-class-box"]', { timeout: 45000 })
      .catch(() => {})
    // settle a moment for AC/HP boxes to populate
    await page.waitForTimeout(1500)
    const data = await page.evaluate(extract)
    return data
  } finally {
    await context.close()
  }
}
