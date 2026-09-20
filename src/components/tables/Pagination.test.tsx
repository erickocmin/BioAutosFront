import { fireEvent, render, screen } from '@testing-library/react'
import { Pagination } from './Pagination'

it('calculates pages and requests the next page', () => {
  const change = vi.fn()
  render(<Pagination page={2} pageSize={20} total={45} onPageChange={change} />)
  expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  expect(change).toHaveBeenCalledWith(3)
})

it('disables navigation at bounds', () => {
  render(<Pagination page={1} pageSize={20} total={1} onPageChange={() => undefined} />)
  expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
})
