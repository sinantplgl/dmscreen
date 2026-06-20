import { useLayoutEffect, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'

/**
 * Positions a fixed dropdown so it never overflows the viewport: clamps it
 * horizontally and flips it above the trigger (or clamps) when there isn't room
 * below. Measures the menu after it mounts, so it works for variable-height menus.
 *
 * Render the menu with `ref={menuRef}` and spread the returned style; it starts
 * hidden until measured to avoid a flash at the wrong spot.
 */
export function useMenuAnchor(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
  align: 'left' | 'right' = 'left',
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({ position: 'fixed', visibility: 'hidden' })

  useLayoutEffect(() => {
    if (!open) {
      setStyle({ position: 'fixed', visibility: 'hidden' })
      return
    }
    const t = triggerRef.current?.getBoundingClientRect()
    const m = menuRef.current
    if (!t || !m) return
    const gap = 4
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mw = m.offsetWidth
    const mh = m.offsetHeight

    let left = align === 'right' ? t.right - mw : t.left
    left = Math.max(8, Math.min(left, vw - mw - 8))

    let top: number
    if (t.bottom + gap + mh <= vh) top = t.bottom + gap // fits below
    else if (t.top - gap - mh >= 8) top = t.top - gap - mh // flip above
    else top = Math.max(8, vh - mh - 8) // clamp into view

    setStyle({ position: 'fixed', top, left, maxHeight: vh - 16, overflowY: 'auto', visibility: 'visible' })
    // Re-measure when the menu opens; size is stable thereafter for our menus.
  }, [open, align, triggerRef, menuRef])

  return style
}
