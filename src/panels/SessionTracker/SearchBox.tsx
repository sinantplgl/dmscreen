import type { SessionNode } from '../../types'
import { searchNodes, ancestorTrail, iconFor, displayTitle } from './helpers'

export function SearchBox({
  nodes,
  query,
  setQuery,
  onPick,
}: {
  nodes: SessionNode[]
  query: string
  setQuery: (q: string) => void
  onPick: (id: string) => void
}) {
  const results = searchNodes(nodes, query)
  const open = query.trim().length > 0
  return (
    <div className="session-search">
      <div className="session-search-input-wrap">
        <input
          className="session-search-input"
          placeholder="Search all nodes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="session-search-clear" onClick={() => setQuery('')} title="Clear search">✕</button>
        )}
      </div>
      {open && (
        <div className="session-search-results">
          {results.length === 0 ? (
            <div className="session-search-empty">No matches.</div>
          ) : (
            results.map((n) => {
              const trail = ancestorTrail(nodes, n)
              const crumb = ['Top', ...trail.map((a) => (a.title.trim() ? a.title : `New ${a.type}`))]
              return (
                <button
                  key={n.id}
                  className="session-search-result"
                  onClick={() => { onPick(n.id); setQuery('') }}
                >
                  <span>{iconFor(n)} {displayTitle(n)}</span>
                  <span className="session-search-crumb">{crumb.join(' › ')}</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
