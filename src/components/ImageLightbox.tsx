import { useEffect } from 'react'

/**
 * Minimal full-screen image viewer. Reuses the app's `.overlay center` shell;
 * the image is capped to the viewport and mirrored when `flip` is set. Closes on
 * backdrop click or Escape. Generic — reusable for any image (creatures, nodes…).
 */
export function ImageLightbox({
  src,
  alt,
  flip,
  onClose,
}: {
  src: string
  alt?: string
  flip?: boolean
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay center" onClick={onClose}>
      <img
        className="lightbox-img"
        src={src}
        alt={alt || ''}
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
