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

  // ── hit points ── (text reads like "...Current 8 / Max Max hit points 11 Temp --")
  const healthText = txt(q('[class*="quick-info__health"]')) || txt(q('[class*="health"]')) || ''
  const hpCurrent = (healthText.match(/Current\s*([0-9]+)/i) || [])[1] ?? null
  const hpMax = (healthText.match(/Max hit points\s*([0-9]+)/i) || [])[1] ?? null
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

  // active conditions (box shows "Add Active Conditions" when there are none)
  const condText = txt(q('[class*="ct-conditions"]')) || ''
  const conditions = /Add Active Conditions/i.test(condText) ? [] : condText ? [condText] : []

  const hpTemp = (healthText.match(/Temp\s*([0-9]+)/i) || [])[1] ?? null

  return {
    name,
    summary,
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
    debug: { acText, hpDebug, sensesText },
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
