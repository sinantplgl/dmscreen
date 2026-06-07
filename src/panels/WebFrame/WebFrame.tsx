import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  DiceIcon,
  VolumeIcon,
  BookIcon,
  SwordsIcon,
  ScrollIcon,
  ElfIcon,
  SparklesIcon,
  CastleIcon,
} from '../../components/icons'

/**
 * Embeds an external website in an <iframe>. The current URL is stored per
 * panel-instance in `config`, so two WebFrame panels can show different sites.
 *
 * Note: many big sites (D&D Beyond, Roll20, YouTube watch pages…) send
 * `X-Frame-Options`/CSP headers that forbid embedding — the bookmarks below are
 * picked for being embed-friendly DM utilities, and an "open in new tab" link is
 * always offered as a fallback.
 */

interface Bookmark {
  label: string
  url: string
  icon: ReactNode
}

// Well-known DM utility sites that allow being embedded in an iframe.
const BOOKMARKS: Bookmark[] = [
  { label: 'Donjon Generators', url: 'https://donjon.bin.sh/', icon: <DiceIcon /> },
  { label: 'Tabletop Audio', url: 'https://tabletopaudio.com/', icon: <VolumeIcon /> },
  { label: 'Open5e SRD', url: 'https://open5e.com/', icon: <BookIcon /> },
  { label: '5e.tools', url: 'https://5e.tools/', icon: <SwordsIcon /> },
  { label: 'Chartopia', url: 'https://chartopia.d12dev.com/', icon: <ScrollIcon /> },
  { label: 'Fantasy Name Gen', url: 'https://www.fantasynamegenerators.com/', icon: <ElfIcon /> },
  { label: 'Perchance', url: 'https://perchance.org/rpg', icon: <SparklesIcon /> },
  { label: 'Watabou City Gen', url: 'https://watabou.github.io/city-generator/', icon: <CastleIcon /> },
]

export function WebFrame({
  config,
  onConfig,
}: {
  config?: Record<string, unknown>
  onConfig: (c: Record<string, unknown>) => void
}) {
  const url = (config?.url as string) || ''
  const [draft, setDraft] = useState(url)

  // Tolerate a bare "example.com" by defaulting to https.
  const normalize = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  }

  const go = (raw: string) => {
    const next = normalize(raw)
    setDraft(next)
    onConfig({ url: next })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 420 }}>
      <form
        className="flex-row"
        style={{ gap: 4, marginBottom: 6 }}
        onSubmit={(e) => {
          e.preventDefault()
          go(draft)
        }}
      >
        <input
          type="text"
          value={draft}
          placeholder="https://…  enter a URL"
          onChange={(e) => setDraft(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-sm">
          Go
        </button>
        {url && (
          <a className="btn btn-sm" href={url} target="_blank" rel="noreferrer" title="Open in a new tab">
            ↗
          </a>
        )}
      </form>

      {!url ? (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div className="empty-hint" style={{ marginBottom: 8 }}>
            Enter a URL above, or pick a utility site:
          </div>
          <div className="flex-row flex-wrap" style={{ gap: 4 }}>
            {BOOKMARKS.map((b) => (
              <button key={b.url} className="btn btn-sm" title={b.url} onClick={() => go(b.url)}>
                <span style={{ marginRight: 4 }}>{b.icon}</span>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <iframe
          src={url}
          title="Embedded site"
          style={{ flex: 1, width: '100%', border: '1px solid var(--line, #333)', borderRadius: 4, background: '#fff' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  )
}
