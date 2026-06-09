import { useState } from 'react'
import { useStore } from '../../store/store'
import { Checkbox } from '../../components/Checkbox'
import type { Item } from '../../types'
import { confirmDialog } from '../../lib/dialog'
import { RARITY_META } from './rarity'

export function ItemEditModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const updateItem = useStore((s) => s.updateItem)
  const removeItem = useStore((s) => s.removeItem)
  const [d, setD] = useState<Item>(item)
  const f = (patch: Partial<Item>) => setD({ ...d, ...patch })

  const save = () => {
    updateItem(item.id, d)
    onClose()
  }

  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 95vw)' }}>
        <h2>Edit Item</h2>
        <div className="form-grid">
          <label className="field full">
            <span>Name</span>
            <input value={d.name} autoFocus onChange={(e) => f({ name: e.target.value })} />
          </label>
          <label className="field">
            <span>Type (e.g. "Wondrous Item", "Weapon")</span>
            <input value={d.itemType} onChange={(e) => f({ itemType: e.target.value })} />
          </label>
          <label className="field">
            <span>Rarity</span>
            <select value={d.rarity} onChange={(e) => f({ rarity: e.target.value as Item['rarity'] })}>
              {RARITY_META.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <div className="field full">
            <Checkbox
              checked={!!d.attunement}
              onChange={(v) => f({ attunement: v })}
              label="Requires attunement"
            />
          </div>
          <label className="field full">
            <span>Image URL (optional)</span>
            <input
              type="url"
              placeholder="https://…"
              value={d.imageUrl || ''}
              onChange={(e) => f({ imageUrl: e.target.value })}
            />
          </label>
          <label className="field full">
            <span>Description (markdown)</span>
            <textarea
              rows={6}
              placeholder="**bold**, *italic*, # heading, - list…"
              value={d.description}
              onChange={(e) => f({ description: e.target.value })}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button
            className="btn"
            onClick={async () => {
              if (
                await confirmDialog({
                  title: 'Delete item?',
                  message: `Delete ${d.name} from the item library?`,
                  confirmLabel: 'Delete',
                  danger: true,
                })
              ) {
                removeItem(item.id)
                onClose()
              }
            }}
          >
            Delete
          </button>
          <span className="spacer" />
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
