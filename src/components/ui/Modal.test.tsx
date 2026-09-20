import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal'

it('closes with escape and exposes dialog semantics', () => {
  const close = vi.fn()
  render(<Modal open title="Nuevo registro" onClose={close}><p>Contenido</p></Modal>)
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(close).toHaveBeenCalled()
})
