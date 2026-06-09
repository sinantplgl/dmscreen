import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Promise-based modal dialogs — drop-in replacements for the browser's blocking
// window.confirm / alert / prompt, so the whole app shares one themed look.
//
//   if (await confirmDialog({ title: 'Delete?', danger: true })) remove()
//   await alertDialog({ title: 'Heads up', message: '…' })
//   const name = await promptDialog({ title: 'Rename', defaultValue: cur })
//
// A single <DialogHost /> mounted at the app root renders the active request.
// ─────────────────────────────────────────────────────────────────────────────

type ConfirmReq = {
  kind: 'confirm'
  title: string
  message?: string
  confirmLabel: string
  cancelLabel: string
  danger: boolean
  resolve: (ok: boolean) => void
}
type AlertReq = {
  kind: 'alert'
  title: string
  message?: string
  confirmLabel: string
  resolve: () => void
}
type PromptReq = {
  kind: 'prompt'
  title: string
  message?: string
  defaultValue: string
  placeholder: string
  confirmLabel: string
  cancelLabel: string
  resolve: (value: string | null) => void
}
type DialogReq = ConfirmReq | AlertReq | PromptReq

let current: DialogReq | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
const getSnapshot = () => current
const setCurrent = (d: DialogReq | null) => {
  current = d
  emit()
}

export function confirmDialog(opts: {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}): Promise<boolean> {
  return new Promise((resolve) =>
    setCurrent({
      kind: 'confirm',
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? 'OK',
      cancelLabel: opts.cancelLabel ?? 'Cancel',
      danger: !!opts.danger,
      resolve,
    }),
  )
}

export function alertDialog(opts: { title: string; message?: string; confirmLabel?: string }): Promise<void> {
  return new Promise((resolve) =>
    setCurrent({
      kind: 'alert',
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? 'OK',
      resolve,
    }),
  )
}

export function promptDialog(opts: {
  title: string
  message?: string
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
  cancelLabel?: string
}): Promise<string | null> {
  return new Promise((resolve) =>
    setCurrent({
      kind: 'prompt',
      title: opts.title,
      message: opts.message,
      defaultValue: opts.defaultValue ?? '',
      placeholder: opts.placeholder ?? '',
      confirmLabel: opts.confirmLabel ?? 'OK',
      cancelLabel: opts.cancelLabel ?? 'Cancel',
      resolve,
    }),
  )
}

/** Mount once at the app root. Renders the active dialog request, if any. */
export function DialogHost() {
  const req = useSyncExternalStore(subscribe, getSnapshot)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Seed/focus the prompt input whenever a new request appears.
  useEffect(() => {
    if (req?.kind === 'prompt') {
      setValue(req.defaultValue)
      // focus after paint
      const t = setTimeout(() => inputRef.current?.select(), 0)
      return () => clearTimeout(t)
    }
  }, [req])

  if (!req) return null

  const done = (action: () => void) => {
    setCurrent(null)
    action()
  }
  const cancel = () => {
    if (req.kind === 'confirm') done(() => req.resolve(false))
    else if (req.kind === 'prompt') done(() => req.resolve(null))
    else done(() => req.resolve())
  }
  const accept = () => {
    if (req.kind === 'confirm') done(() => req.resolve(true))
    else if (req.kind === 'prompt') done(() => req.resolve(value))
    else done(() => req.resolve())
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') cancel()
    else if (e.key === 'Enter' && req.kind !== 'prompt') accept()
  }

  return (
    <div className="overlay center dialog-overlay" onClick={cancel} onKeyDown={onKeyDown}>
      <div className="modal dialog-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{req.title}</h2>
        {req.message && <p className="dialog-message">{req.message}</p>}
        {req.kind === 'prompt' && (
          <input
            ref={inputRef}
            type="text"
            value={value}
            placeholder={req.placeholder}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') accept()
              else if (e.key === 'Escape') cancel()
            }}
          />
        )}
        <div className="modal-actions">
          {req.kind !== 'alert' && (
            <button className="btn" onClick={cancel}>
              {req.cancelLabel}
            </button>
          )}
          <button
            className={'btn ' + (req.kind === 'confirm' && req.danger ? 'btn-danger' : 'btn-accent')}
            onClick={accept}
            autoFocus={req.kind !== 'prompt'}
          >
            {req.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
