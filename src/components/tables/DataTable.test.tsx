import { fireEvent, render, screen } from '@testing-library/react'
import { DataTable } from './DataTable'

const columns = [{ key: 'name', label: 'Nombre' }]

it('renders rows and headers', () => {
  render(<DataTable rows={[{ id: 1, name: 'Almacén central' }]} columns={columns} />)
  expect(screen.getByText('Nombre')).toBeInTheDocument()
  expect(screen.getByText('Almacén central')).toBeInTheDocument()
})

it('renders an accessible empty state', () => {
  render(<DataTable rows={[]} columns={columns} />)
  expect(screen.getByText('Sin resultados')).toBeInTheDocument()
})

it('supports row selection', () => {
  const onSelectionChange = vi.fn()
  render(<DataTable rows={[{ id: 7, name: 'Producto' }]} columns={columns} onSelectionChange={onSelectionChange} />)
  fireEvent.click(screen.getByRole('checkbox'))
  expect(onSelectionChange).toHaveBeenCalledWith(new Set([7]))
})
