import { useLayoutEffect, useRef, useState } from 'react'
import { Markdown } from '../../lib/markdown'
import type { Creature, StatEntry } from '../../types'
import {
  ABILITY_LABELS,
  abilityMod,
  initiativeFromDex,
  parseSaves,
  proficiencyBonusForCr,
} from '../../lib/dnd'
import { ImageLightbox } from '../../components/ImageLightbox'

// Below this width the block stays single-column; at/above it splits into two
// balanced columns (the name + its divider still span the full width).
const TWO_COL_MIN_PX = 690

function PropLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="prop-line"  style={{marginTop: 7}}>
      <span className="label">{label} </span>
      <span className="value">{value}</span>
    </div>
  )
}

function PropEntry({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="entry"  style={{marginTop: 7}}>
      <span className="label">{label} </span>
      <span className="value">{value}</span>
    </div>
  )
}

/** One half of the 2024 ability block (3 abilities), with Mod + Save columns. */
function AbilityColumn({
  keys,
  c,
  saves,
  col,
}: {
  keys: (keyof typeof ABILITY_LABELS)[]
  c: Creature
  saves: Partial<Record<keyof typeof ABILITY_LABELS, string>>
  col: 1 | 2
}) {
  return (
    <table className={`ability-col col-${col}`}>
      <thead>
        <tr>
          <th />
          <th />
          <th>Mod</th>
          <th>Save</th>
        </tr>
      </thead>
      <tbody>
        {keys.map((k) => {
          const mod = abilityMod(c.abilities[k])
          const save = saves[k]
          return (
            <tr key={k}>
              <td className="ab grpA">{ABILITY_LABELS[k]}</td>
              <td className="num grpA">{c.abilities[k]}</td>
              <td className="num grpB">{mod}</td>
              <td className="num grpB">{save ?? mod}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Section({
  heading,
  intro,
  entries,
}: {
  heading?: string
  intro?: string
  entries?: StatEntry[]
}) {
  const hasEntries = !!entries && entries.length > 0
  if (!hasEntries && !intro) return null
  return (
    <>
      {heading && <div className="section-heading">{heading}</div>}
      {intro && (
        <div className="entry section-intro" style={{ marginTop: 12, fontStyle: 'italic', opacity: 0.85 }}>
          <Markdown text={intro} />
        </div>
      )}
      {hasEntries &&
        entries!.map((e, i) => (
          <div className="entry" key={i} style={{ marginTop: 15 }}>
            <Markdown text={e.name ? `**_${e.name}._** ${e.text}` : e.text} />
          </div>
        ))}
    </>
  )
}

/** 2024 (5.5e) Monster Manual stat block (read-only display). */
export function StatBlock({ creature }: { creature: Creature }) {
  // Split into two balanced columns once the block is wide enough.
  const ref = useRef<HTMLDivElement>(null)
  const [twoCol, setTwoCol] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setTwoCol(el.clientWidth >= TWO_COL_MIN_PX)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const c = creature
  const saveOverrides = parseSaves(c.saves)
  const initiative = c.initiative?.trim() || initiativeFromDex(c.abilities.dex)
  const pb = proficiencyBonusForCr(c.cr)
  const crLine =
    c.cr && !/pb/i.test(c.cr) ? `${c.cr} (PB +${pb})` : c.cr
  // 2024 folds damage + condition immunities into one "Immunities" line.
  const immunities = [c.damageImmunities, c.conditionImmunities].filter(Boolean).join('; ')

  return (
    <div className="parchment" ref={ref}>
      <div className={'statblock statblock-2024' + (twoCol ? ' two-col' : '')}>
        <div className="creature-name">{c.name}</div>
        <div className="tapered-rule" />
        <div className="type-line">{c.meta}</div>

        <div className="stat-main">
          <div className="stat-content">
            <div className="stat-header">
              <div className="stat-defense">
                <div className="def-line" style={{ marginTop: 20 }}>
                  <span>
                    <span className="label">AC </span>
                    <span className="value">{c.ac}</span>
                  </span>
                  <span>
                    <span className="label">Initiative </span>
                    <span className="value">{initiative}</span>
                  </span>
                </div>
                <PropLine label="HP" value={c.hp} />
                <PropLine label="Speed" value={c.speed} />
              </div>
              {c.imageUrl && (
                <button
                  type="button"
                  className="stat-portrait"
                  title="Click to enlarge"
                  onClick={() => setLightbox(true)}
                >
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    style={c.imageFlip ? { transform: 'scaleX(-1)' } : undefined}
                  />
                </button>
              )}
            </div>

            <div className="ability-cols" style={{marginTop: 10}}>
              <AbilityColumn keys={['str', 'dex', 'con']} c={c} saves={saveOverrides} col={1} />
              <AbilityColumn keys={['int', 'wis', 'cha']} c={c} saves={saveOverrides} col={2} />
            </div>

            <div className="prop-list" style={{marginTop: 20, marginBottom: 30}}>
              <PropEntry label="Skills" value={c.skills} />
              <PropEntry label="Vulnerabilities" value={c.damageVulnerabilities} />
              <PropEntry label="Resistances" value={c.damageResistances} />
              <PropEntry label="Immunities" value={immunities || undefined} />
              <PropEntry label="Gear" value={c.gear} />
              <PropEntry label="Senses" value={c.senses} />
              <PropEntry label="Languages" value={c.languages} />
              <PropEntry label="CR" value={crLine} />
            </div>
          </div>
        </div>

        <Section heading="Traits" entries={c.traits} />
        <Section heading="Actions" entries={c.actions} />
        <Section heading="Bonus Actions" entries={c.bonusActions} />
        <Section heading="Reactions" entries={c.reactions} />
        <Section heading="Legendary Actions" intro={c.legendaryIntro} entries={c.legendary} />

        {(c.habitat || c.treasure) && (
          <>
            <div className="tapered-rule" />
            <div className="prop-list footer-list">
              <PropEntry label="Habitat" value={c.habitat} />
              <PropEntry label="Treasure" value={c.treasure} />
            </div>
          </>
        )}
      </div>
      {lightbox && c.imageUrl && (
        <ImageLightbox src={c.imageUrl} alt={c.name} flip={c.imageFlip} onClose={() => setLightbox(false)} />
      )}
    </div>
  )
}
