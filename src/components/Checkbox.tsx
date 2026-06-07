import type { ReactNode } from 'react'
import './Checkbox.css'
import { CheckIcon } from './icons'

/**
 * Themed checkbox. The native <input> is kept (visually hidden) for keyboard /
 * a11y / form semantics, and a styled box is drawn beside it — so it dodges the
 * global `input { width: 100% }` styling and matches the dark chrome everywhere.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
  title,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  title?: string
}) {
  return (
    <label className={'checkbox' + (disabled ? ' disabled' : '')} title={title}>
      <input
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkbox-box" aria-hidden="true">
        <CheckIcon className="checkbox-check" />
      </span>
      {label != null && <span className="checkbox-label">{label}</span>}
    </label>
  )
}
