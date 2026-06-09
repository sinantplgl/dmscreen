import type { ItemRarity } from '../../types'

/** Display label + accent color for each rarity, in ascending order.
 *  Colors follow the common D&D video-game convention and read on the dark theme. */
export const RARITY_META: { value: ItemRarity; label: string; color: string }[] = [
  { value: 'common', label: 'Common', color: '#b8b8b0' },
  { value: 'uncommon', label: 'Uncommon', color: '#5fb56f' },
  { value: 'rare', label: 'Rare', color: '#4f86d4' },
  { value: 'very rare', label: 'Very Rare', color: '#a861d8' },
  { value: 'legendary', label: 'Legendary', color: '#e0922a' },
  { value: 'artifact', label: 'Artifact', color: '#d4673a' },
]

export const RARITY_ORDER: ItemRarity[] = RARITY_META.map((r) => r.value)

const BY_VALUE = new Map(RARITY_META.map((r) => [r.value, r]))

export const rarityColor = (r: ItemRarity): string => BY_VALUE.get(r)?.color ?? '#b8b8b0'
export const rarityLabel = (r: ItemRarity): string => BY_VALUE.get(r)?.label ?? r

/** The 5e "type, rarity (requires attunement)" line, e.g.
 *  "Wondrous Item, rare (requires attunement)". */
export function itemTypeLine(itemType: string, rarity: ItemRarity, attunement?: boolean): string {
  const parts = [itemType, rarityLabel(rarity).toLowerCase()].filter(Boolean)
  let line = parts.join(', ')
  if (attunement) line += ' (requires attunement)'
  return line
}
