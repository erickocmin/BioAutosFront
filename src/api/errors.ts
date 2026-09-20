import axios from 'axios'

export function apiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Ocurrió un error inesperado.'
  const data = error.response?.data as { message?: string; detail?: string; errors?: Record<string, string[]> } | undefined
  if (data?.message) return data.message
  if (data?.detail?.includes('No active account')) return 'Usuario o contraseña incorrectos.'
  if (data?.detail) return data.detail
  if (data?.errors) return Object.entries(data.errors).map(([field, messages]) => `${field}: ${messages.join(', ')}`).join(' · ')
  const status = error.response?.status
  const defaults: Record<number, string> = { 400: 'Revisa los datos ingresados.', 401: 'La sesión expiró.', 403: 'No tienes permiso para esta acción.', 404: 'El registro ya no existe.', 409: 'La operación entra en conflicto con el estado actual.', 429: 'Demasiados intentos. Espera un momento.', 500: 'El servidor no pudo completar la operación.' }
  return (status && defaults[status]) || 'No fue posible comunicarse con el servidor.'
}
