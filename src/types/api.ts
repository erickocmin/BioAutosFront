export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  code: string
  message: string
  errors?: Record<string, string[]> | null
}

export interface SessionUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  permissions: string[]
  employee?: { id: number; nombres: string; apellidos: string; sucursal: number }
}
