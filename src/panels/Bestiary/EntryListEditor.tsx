import type { StatEntry } from '../../types'

export function EntryListEditor({
  label,
  entries,
  onChange,
}: {
  label: string
  entries: StatEntry[]
  onChange: (e: StatEntry[]) => void
}) {
  const set = (i: number, patch: Partial<StatEntry>) =>
    onChange(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="flex-row" style={{ marginBottom: 4 }}>
        <span className="section-label">{label}</span>
        <span className="spacer" />
        <button className="btn btn-sm" onClick={() => onChange([...entries, { name: '', text: '' }])}>
          + Add
        </button>
      </div>
      {entries.map((e, i) => (
        <div key={i} className="flex-row" style={{ alignItems: 'flex-start', marginBottom: 5 }}>
          <input
            style={{ flex: '0 0 34%' }}
            placeholder="Name"
            value={e.name}
            onChange={(ev) => set(i, { name: ev.target.value })}
          />
          <textarea
            rows={2}
            placeholder="Description"
            value={e.text}
            onChange={(ev) => set(i, { text: ev.target.value })}
          />
          <button
            className="icon-btn danger"
            onClick={() => onChange(entries.filter((_, idx) => idx !== i))}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
