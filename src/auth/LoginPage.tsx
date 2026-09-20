import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { apiErrorMessage } from '../api/errors'
import { useAuth } from './AuthContext'

const schema = z.object({ usuario: z.string().min(1, 'Ingresa tu usuario'), password: z.string().min(1, 'Ingresa tu contraseña') })
type LoginValues = z.infer<typeof schema>

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(schema) })
  if (user) return <Navigate to="/" replace />
  const submit = async (values: LoginValues) => {
    try {
      await login(values.usuario, values.password)
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
    } catch (error) { setError('root', { message: apiErrorMessage(error) }) }
  }
  return <main className="auth-page">
    <section className="auth-panel" aria-labelledby="login-title">
      <div className="brand-mark">SG</div>
      <p className="eyebrow">Plataforma operativa</p>
      <h1 id="login-title">Bienvenido a SISGETRAN</h1>
      <p className="muted">Accede a operaciones, inventario, caja y asistencia desde un solo lugar.</p>
      <form onSubmit={handleSubmit(submit)} noValidate>
        <label>Usuario<input autoComplete="username" autoFocus {...register('usuario')} />{errors.usuario && <small>{errors.usuario.message}</small>}</label>
        <label>Contraseña<input type="password" autoComplete="current-password" {...register('password')} />{errors.password && <small>{errors.password.message}</small>}</label>
        {errors.root && <div className="form-error" role="alert">{errors.root.message}</div>}
        <button className="button button--primary button--wide" disabled={isSubmitting}>{isSubmitting ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </section>
    <aside className="auth-aside"><span>Operación clara.</span><span>Decisiones rápidas.</span><span>Control confiable.</span></aside>
  </main>
}
