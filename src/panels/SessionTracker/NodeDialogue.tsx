import { useState } from 'react'
import { useStore } from '../../store/store'
import { Markdown } from '../../lib/markdown'
import { ResizableSection } from './ResizableSection'
import {
  addDialogueLine,
  updateDialogueLine,
  removeDialogueLine,
  moveDialogueLine,
} from './attachments'
import { baseTypeOf, displayTitle, iconFor } from './helpers'
import type { DialogueLine, SessionNode } from '../../types'
import type { SectionProps } from './sections'

/** Deterministic hue (0–359) from a string, so each distinct speaker keeps a
 *  stable bubble color across renders. */
function hueOf(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}

/** A scripted/spontaneous conversation: an ordered list of speech bubbles,
 *  interleaved DM notes, and PC↔NPC Q&A — sharing one design, differing by kind. */
export function NodeDialogue({ node, height, onHeight, resizable = true, cols = 1 }: SectionProps) {
  const nodes = useStore((s) => s.sessionNodes)
  const updateNode = useStore((s) => s.updateNode)
  const [editId, setEditId] = useState<string | null>(null)
  const [pickFor, setPickFor] = useState<string | null>(null)

  const list = node.dialogue ?? []
  const set = (next: DialogueLine[]) => updateNode(node.id, { dialogue: next })
  const patch = (id: string, p: Partial<DialogueLine>) => set(updateDialogueLine(list, id, p))
  const add = (kind: DialogueLine['kind']) => {
    const next = addDialogueLine(list, kind)
    set(next)
    setEditId(next[next.length - 1].id)
  }

  const actions = (
    <span className="dlg-add">
      <button className="btn btn-sm" onClick={() => add('speech')}>+ Speech</button>
      <button className="btn btn-sm" onClick={() => add('note')}>+ DM note</button>
      <button className="btn btn-sm" onClick={() => add('qa')}>+ Q&amp;A</button>
    </span>
  )

  const controlsFor = (line: DialogueLine, editing: boolean) => (
    <span className="dlg-controls">
      <button className="icon-btn" title={editing ? 'Done' : 'Edit'} onClick={() => setEditId(editing ? null : line.id)}>
        {editing ? '▿' : '✎'}
      </button>
      <button className="icon-btn" title="Move up" onClick={() => set(moveDialogueLine(list, line.id, -1))}>▲</button>
      <button className="icon-btn" title="Move down" onClick={() => set(moveDialogueLine(list, line.id, 1))}>▼</button>
      <button
        className="icon-btn danger"
        title="Remove line"
        onClick={() => {
          set(removeDialogueLine(list, line.id))
          if (editing) setEditId(null)
        }}
      >
        ✕
      </button>
    </span>
  )

  return (
    <ResizableSection title="Dialogue" actions={actions} resizable={resizable} height={height} onHeight={onHeight}>
      {list.length === 0 ? (
        <div className="node-items-empty">No lines yet — add a speech bubble, DM note, or Q&amp;A.</div>
      ) : (
        <div className="dlg-list" style={{ columnCount: cols > 1 ? cols : undefined }}>
        {list.map((line) => {
          const editing = editId === line.id
          if (line.kind === 'note') {
            return (
              <div key={line.id} className="dlg-line dlg-note">
                <div className="dlg-line-head">
                  <span className="dlg-tag dlg-note-tag">DM note</span>
                  <span className="spacer" />
                  {controlsFor(line, editing)}
                </div>
                {editing ? (
                  <textarea
                    className="node-body-edit"
                    placeholder="DM note — markdown"
                    value={line.text || ''}
                    onChange={(e) => patch(line.id, { text: e.target.value })}
                  />
                ) : line.text ? (
                  <div className="markdown-host"><Markdown text={line.text} /></div>
                ) : (
                  <div className="node-empty">Empty note.</div>
                )}
              </div>
            )
          }
          if (line.kind === 'qa') {
            return (
              <div key={line.id} className="dlg-line dlg-qa">
                <div className="dlg-line-head">
                  <span className="dlg-tag dlg-qa-tag">Q&amp;A</span>
                  <span className="spacer" />
                  {controlsFor(line, editing)}
                </div>
                {editing ? (
                  <>
                    <input
                      className="dlg-q-input"
                      placeholder="Question…"
                      value={line.question || ''}
                      onChange={(e) => patch(line.id, { question: e.target.value })}
                    />
                    <textarea
                      className="node-body-edit"
                      placeholder="Answer — markdown"
                      value={line.answer || ''}
                      onChange={(e) => patch(line.id, { answer: e.target.value })}
                    />
                  </>
                ) : (
                  <div className="dlg-qa-view">
                    <div className="dlg-q">{line.question || <span className="muted">…</span>}</div>
                    <div className="dlg-a">
                      {line.answer ? (
                        <span className="markdown-host"><Markdown text={line.answer} /></span>
                      ) : (
                        <span className="muted">…</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          }
          // speech
          const linked = line.speakerId ? nodes.find((n) => n.id === line.speakerId) : undefined
          const hue = hueOf(line.speakerId || line.speaker || '')
          return (
            <div key={line.id} className="dlg-line dlg-speech" style={{ ['--bubble-hue' as string]: String(hue) }}>
              <div className="dlg-line-head">
                {editing ? (
                  <>
                    <input
                      className="dlg-speaker-input"
                      placeholder="Speaker…"
                      value={line.speaker || ''}
                      onChange={(e) => patch(line.id, { speaker: e.target.value })}
                    />
                    <button className="btn btn-sm" title="Link an NPC node" onClick={() => setPickFor(line.id)}>
                      {line.speakerId ? '↪ linked' : 'Link NPC'}
                    </button>
                    {line.speakerId && (
                      <button className="icon-btn" title="Unlink NPC" onClick={() => patch(line.id, { speakerId: undefined })}>
                        ⨯
                      </button>
                    )}
                  </>
                ) : (
                  <span className="dlg-speaker">
                    {linked ? (
                      <>{iconFor(linked)} {displayTitle(linked)}</>
                    ) : line.speaker ? (
                      line.speaker
                    ) : (
                      <span className="muted">Speaker</span>
                    )}
                  </span>
                )}
                <span className="spacer" />
                {controlsFor(line, editing)}
              </div>
              <div className="dlg-bubble">
                {editing ? (
                  <textarea
                    className="node-body-edit"
                    placeholder="What they say — markdown"
                    value={line.text || ''}
                    onChange={(e) => patch(line.id, { text: e.target.value })}
                  />
                ) : line.text ? (
                  <div className="markdown-host"><Markdown text={line.text} /></div>
                ) : (
                  <div className="node-empty">Empty line.</div>
                )}
              </div>
            </div>
          )
        })}
        </div>
      )}

      {pickFor && (
        <SpeakerPicker
          onPick={(n) => {
            patch(pickFor, { speakerId: n.id, speaker: n.title.trim() || undefined })
            setPickFor(null)
          }}
          onClose={() => setPickFor(null)}
        />
      )}
    </ResizableSection>
  )
}

/** Pick an existing NPC node to link as a dialogue speaker. */
function SpeakerPicker({ onPick, onClose }: { onPick: (n: SessionNode) => void; onClose: () => void }) {
  const nodes = useStore((s) => s.sessionNodes)
  const customNodeTypes = useStore((s) => s.customNodeTypes)
  const [q, setQ] = useState('')
  const npcs = nodes.filter((n) => !n.refId && baseTypeOf(n.type, customNodeTypes) === 'npc')
  const filtered = npcs.filter((n) => (n.title || '').toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(440px, 95vw)' }}>
        <h2>Link an NPC</h2>
        <input type="text" placeholder="Search NPC nodes…" value={q} autoFocus onChange={(e) => setQ(e.target.value)} />
        <div className="creature-pick-list">
          {npcs.length === 0 && <div className="empty-hint">No NPC nodes yet — create one to link it here.</div>}
          {npcs.length > 0 && filtered.length === 0 && <div className="empty-hint">No NPCs match.</div>}
          {filtered.map((n) => (
            <button key={n.id} className="creature-pick" onClick={() => onPick(n)}>
              {iconFor(n)} {displayTitle(n)}
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
