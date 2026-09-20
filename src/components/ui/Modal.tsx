import { useEffect, type ReactNode } from 'react'

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onClose])
  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Cerrar" onClick={onClose}>×</button></header>
      {children}
    </section>
  </div>
}
