import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { apiErrorMessage } from './errors'

describe('apiErrorMessage', () => {
  it('prioriza el mensaje de negocio del backend', () => {
    const error = new axios.AxiosError('Conflict', '409', undefined, undefined, { data: { message: 'Stock insuficiente.' }, status: 409, statusText: 'Conflict', headers: {}, config: { headers: {} } } as never)
    expect(apiErrorMessage(error)).toBe('Stock insuficiente.')
  })

  it('traduce estados sin detalle', () => {
    const error = new axios.AxiosError('Forbidden', '403', undefined, undefined, { data: {}, status: 403, statusText: 'Forbidden', headers: {}, config: { headers: {} } } as never)
    expect(apiErrorMessage(error)).toBe('No tienes permiso para esta acción.')
  })
})
