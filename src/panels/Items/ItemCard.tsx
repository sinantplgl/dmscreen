import { Markdown } from '../../lib/markdown'
import { GemIcon } from '../../components/icons'
import type { Item } from '../../types'
import { rarityColor, itemTypeLine } from './rarity'

/** Read-only display of a magic item: rarity-tinted header, optional art, body. */
export function ItemCard({ item }: { item: Item }) {
  const color = rarityColor(item.rarity)
  return (
    <div className="item-card" style={{ ['--rarity' as string]: color }}>
      <div className="item-card-head">
        <span className="item-rarity-dot" />
        {item.imageUrl ? (
          <img className="item-thumb" src={item.imageUrl} alt={item.name} />
        ) : (
          <span className="item-thumb item-thumb-icon">
            <GemIcon />
          </span>
        )}
        <div className="item-card-headings">
          <div className="item-card-name">{item.name}</div>
          <div className="item-card-type">{itemTypeLine(item.itemType, item.rarity, item.attunement)}</div>
        </div>
      </div>
      {item.description && (
        <div className="item-card-body markdown-host">
          <Markdown text={item.description} />
        </div>
      )}
    </div>
  )
}
