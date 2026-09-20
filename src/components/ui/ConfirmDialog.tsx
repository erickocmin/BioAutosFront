import { Modal } from './Modal'

export function ConfirmDialog({ open, title, message, busy, onConfirm, onClose }: { open: boolean; title: string; message: string; busy?: boolean; onConfirm: () => void; onClose: () => void }) {
  return <Modal open={open} title={title} onClose={onClose}>
    <p>{message}</p>
    <footer className="form-actions"><button className="button button--ghost" onClick={onClose}>Cancelar</button><button className="button button--danger" disabled={busy} onClick={onConfirm}>{busy ? 'Procesando…' : 'Confirmar'}</button></footer>
  </Modal>
}
