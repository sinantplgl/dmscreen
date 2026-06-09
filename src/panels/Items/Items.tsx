import { useState } from 'react'
import './Items.css'
import { useStore } from '../../store/store'
import { ItemCard } from './ItemCard'
import { ItemEditModal } from './ItemModals'
import { RARITY_ORDER } from './rarity'

export function Items() {
  const items = useStore((s) => s.items)
  const addItem = useStore((s) => s.addItem)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  const filtered = items
    .filter((it) => it.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const r = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
      return r !== 0 ? r : a.name.localeCompare(b.name)
    })
  const editing = items.find((it) => it.id === editId)

  return (
    <div className="items-panel">
      <div className="flex-row search-input">
        <input
          type="text"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-accent" onClick={() => setEditId(addItem())}>
          + Item
        </button>
      </div>

      <div className="items-list">
        {filtered.map((it) => (
          <div key={it.id} className="item-row">
            <ItemCard item={it} />
            <button className="icon-btn item-edit-btn" title="Edit" onClick={() => setEditId(it.id)}>
              ✎
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-hint">
            {items.length === 0 ? 'No items yet — click "+ Item".' : `No items match "${search}".`}
          </div>
        )}
      </div>

      {editing && <ItemEditModal item={editing} onClose={() => setEditId(null)} />}
    </div>
  )
}
