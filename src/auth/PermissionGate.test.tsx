import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { PermissionGate } from './PermissionGate'

const hasPermission = vi.fn()
vi.mock('./AuthContext', () => ({ useAuth: () => ({ hasPermission }) }))

describe('PermissionGate', () => {
  it('muestra acciones autorizadas', () => {
    hasPermission.mockReturnValue(true)
    render(<PermissionGate permission="inventory.movimientos.create"><button>Registrar</button></PermissionGate>)
    expect(screen.getByRole('button', { name: 'Registrar' })).toBeInTheDocument()
  })

  it('oculta acciones no autorizadas', () => {
    hasPermission.mockReturnValue(false)
    render(<PermissionGate permission="inventory.movimientos.create"><button>Registrar</button></PermissionGate>)
    expect(screen.queryByRole('button', { name: 'Registrar' })).not.toBeInTheDocument()
  })
})
