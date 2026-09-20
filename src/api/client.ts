import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({ baseURL, timeout: 15_000 })

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('sisgetran.access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing: Promise<string> | null = null

api.interceptors.response.use(undefined, async (error) => {
  const request = error.config
  if (error.response?.status !== 401 || request?._retried || request?.url?.includes('/accounts/auth/')) {
    return Promise.reject(error)
  }
  const refresh = localStorage.getItem('sisgetran.refresh')
  if (!refresh) return Promise.reject(error)
  request._retried = true
  refreshing ??= axios.post(`${baseURL}/accounts/auth/refresh/`, { refresh }).then(({ data }) => {
    sessionStorage.setItem('sisgetran.access', data.access)
    if (data.refresh) localStorage.setItem('sisgetran.refresh', data.refresh)
    return data.access as string
  }).finally(() => { refreshing = null })
  try {
    const access = await refreshing
    request.headers.Authorization = `Bearer ${access}`
    return api(request)
  } catch (refreshError) {
    sessionStorage.removeItem('sisgetran.access')
    localStorage.removeItem('sisgetran.refresh')
    window.dispatchEvent(new Event('sisgetran:session-expired'))
    return Promise.reject(refreshError)
  }
})
