import type { ReactNode } from 'react'
import './markdown.css'

// ─────────────────────────────────────────────────────────────────────────────
// Tiny, dependency-free markdown renderer for the "IM-app" subset:
//   # / ## / ###  headers      **bold** / __bold__      *italic* / _italic_
//   ~~strike~~     `code`       - / * lists    1. ordered    > quote
//   [text](url)  links (http/https/mailto only)
// Renders to React elements (no dangerouslySetInnerHTML), so it can't inject HTML.
// ─────────────────────────────────────────────────────────────────────────────

// Order matters: code, then bold (** / __), then strike, then italic (* / _), then link.
const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(~~[^~]+~~)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]]+\]\([^)]+\))/

function safeHref(url: string): string | null {
  const u = url.trim()
  return /^(https?:|mailto:)/i.test(u) ? u : null
}

/** Parse inline spans (bold/italic/code/strike/link) within a single run of text. */
function inline(text: string, kp: string): ReactNode[] {
  const out: ReactNode[] = []
  let rest = text
  let k = 0
  while (rest.length) {
    const m = rest.match(INLINE_RE)
    if (!m || m.index === undefined) {
      out.push(rest)
      break
    }
    if (m.index > 0) out.push(rest.slice(0, m.index))
    const tok = m[0]
    const key = `${kp}-${k++}`
    if (tok.startsWith('`')) {
      out.push(<code key={key}>{tok.slice(1, -1)}</code>)
    } else if (tok.startsWith('**') || tok.startsWith('__')) {
      out.push(<strong key={key}>{inline(tok.slice(2, -2), key)}</strong>)
    } else if (tok.startsWith('~~')) {
      out.push(<s key={key}>{inline(tok.slice(2, -2), key)}</s>)
    } else if (tok.startsWith('[')) {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!
      const href = safeHref(lm[2])
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noreferrer">
            {inline(lm[1], key)}
          </a>
        ) : (
          lm[1]
        ),
      )
    } else {
      // *italic* or _italic_
      out.push(<em key={key}>{inline(tok.slice(1, -1), key)}</em>)
    }
    rest = rest.slice(m.index + tok.length)
  }
  return out
}

const isHeader = (l: string) => /^(#{1,3})\s+/.test(l)
const isUl = (l: string) => /^\s*[-*]\s+/.test(l)
const isOl = (l: string) => /^\s*\d+\.\s+/.test(l)
const isQuote = (l: string) => /^\s*>\s?/.test(l)
const isBlank = (l: string) => /^\s*$/.test(l)

/** Render a markdown string as React elements. */
export function Markdown({ text }: { text: string }) {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let b = 0

  const joinLines = (items: string[], tag: string) =>
    items.map((t, j) => (
      <span key={j}>
        {inline(t, `${tag}${b}-${j}`)}
        {j < items.length - 1 ? <br /> : null}
      </span>
    ))

  while (i < lines.length) {
    const line = lines[i]
    if (isBlank(line)) {
      i++
      // Consume any further blank lines; emit a single spacer between content blocks.
      while (i < lines.length && isBlank(lines[i])) i++
      if (blocks.length > 0 && i < lines.length) blocks.push(<br key={b++} />)
      continue
    }

    const h = line.match(/^(#{1,3})\s+(.*)$/)
    if (h) {
      blocks.push(
        <div key={b++} className={`md-h${h[1].length}`}>
          {inline(h[2], `h${i}`)}
        </div>,
      )
      i++
      continue
    }

    if (isQuote(line)) {
      const items: string[] = []
      while (i < lines.length && isQuote(lines[i])) items.push(lines[i++].replace(/^\s*>\s?/, ''))
      blocks.push(<blockquote key={b++}>{joinLines(items, 'q')}</blockquote>)
      continue
    }

    if (isUl(line)) {
      const items: string[] = []
      while (i < lines.length && isUl(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''))
      blocks.push(
        <ul key={b++}>
          {items.map((t, j) => (
            <li key={j}>{inline(t, `u${b}-${j}`)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (isOl(line)) {
      const items: string[] = []
      while (i < lines.length && isOl(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ''))
      blocks.push(
        <ol key={b++}>
          {items.map((t, j) => (
            <li key={j}>{inline(t, `o${b}-${j}`)}</li>
          ))}
        </ol>,
      )
      continue
    }

    // paragraph: gather consecutive lines until a blank line or a block starter
    const para: string[] = []
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !isHeader(lines[i]) &&
      !isUl(lines[i]) &&
      !isOl(lines[i]) &&
      !isQuote(lines[i])
    ) {
      para.push(lines[i++])
    }
    blocks.push(<p key={b++}>{joinLines(para, 'p')}</p>)
  }

  return <div className="markdown">{blocks}</div>
}
