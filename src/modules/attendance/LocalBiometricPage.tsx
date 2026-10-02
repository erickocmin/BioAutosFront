import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { apiErrorMessage } from '../../api/errors'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Paginated } from '../../types/api'

interface Branch { id: number; nombre: string }
interface Profile { id: number; nombre: string }
interface Device {
  id: number
  serial_number: string
  name: string
  ip_address: string | null
  port: number
  device_model: string
  location: string
  last_connection: string | null
  connection_state: 'recent' | 'disconnected' | 'never_connected'
  branch: number
}
interface Event {
  id: number
  employee_name: string | null
  biometric_pin: string
  occurred_at: string
  verification_method: string
  direction: 'entry' | 'exit' | 'unknown'
}
interface NetworkInfo { addresses: string[]; recommended_address: string | null; port: string; callback_path: string }
interface EnrollmentResult { employee_id: number; biometric_pin: string; device_command_id: number | null; next_step: string }

const initialDevice = {
  serial_number: 'CMYD231760447', name: 'Huellero principal', branch: '', ip_address: '', port: '4370',
  device_model: 'ZKTeco / ADMS', location: 'Oficina local', status: 'active',
}
const initialPerson = {
  username: '', email: '', temporary_password: '', first_name: '', last_name: '', branch: '', employee_code: '',
  document_number: '', job_title: '', biometric_pin: '', device: '', profile: '',
}

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value))
  : 'Nunca'

export function LocalBiometricPage() {
  const client = useQueryClient()
  const [deviceForm, setDeviceForm] = useState(initialDevice)
  const [personForm, setPersonForm] = useState(initialPerson)
  const [deviceMessage, setDeviceMessage] = useState('')
  const [enrollment, setEnrollment] = useState<EnrollmentResult | null>(null)

  const branches = useQuery({ queryKey: ['branch-options'], queryFn: async () => (await api.get<Paginated<Branch>>('/core/sucursales/', { params: { page_size: 100 } })).data.results })
  const profiles = useQuery({ queryKey: ['profile-options'], queryFn: async () => (await api.get<Paginated<Profile>>('/accounts/perfiles/', { params: { page_size: 100 } })).data.results })
  const devices = useQuery({ queryKey: ['attendance-devices'], queryFn: async () => (await api.get<Paginated<Device>>('/attendance/devices/', { params: { page_size: 100 } })).data.results, refetchInterval: 5000 })
  const events = useQuery({ queryKey: ['attendance-live-events'], queryFn: async () => (await api.get<Paginated<Event>>('/attendance/events/', { params: { page_size: 12 } })).data.results, refetchInterval: 4000 })
  const network = useQuery({ queryKey: ['local-network'], queryFn: async () => (await api.get<NetworkInfo>('/attendance/local-network/')).data })

  const selectedDevice = useMemo(() => devices.data?.find((item) => String(item.id) === personForm.device), [devices.data, personForm.device])
  const serverAddress = network.data?.recommended_address ?? '<IP-DE-ESTA-PC>'

  const createDevice = useMutation({
    mutationFn: () => {
      const payload = { ...deviceForm, branch: Number(deviceForm.branch), port: Number(deviceForm.port), ip_address: deviceForm.ip_address || null }
      const existing = devices.data?.find((device) => device.serial_number === deviceForm.serial_number)
      return existing ? api.patch(`/attendance/devices/${existing.id}/`, payload) : api.post('/attendance/devices/', payload)
    },
    onSuccess: async ({ data }) => {
      setDeviceMessage('Huellero autorizado. Ya puede apuntar el equipo a este servidor.')
      setPersonForm((current) => ({ ...current, branch: String(data.branch), device: String(data.id) }))
      await client.invalidateQueries({ queryKey: ['attendance-devices'] })
    },
  })
  const testConnection = useMutation({
    mutationFn: async (device: Device) => (await api.post<{ reachable: boolean; message: string }>(`/attendance/devices/${device.id}/test-connection/`)).data,
    onSuccess: (data) => setDeviceMessage(data.message),
    onError: (error) => setDeviceMessage(apiErrorMessage(error)),
  })
  const createEnrollment = useMutation({
    mutationFn: async () => (await api.post<EnrollmentResult>('/attendance/enrollments/', {
      ...personForm,
      branch: Number(personForm.branch),
      device: personForm.device ? Number(personForm.device) : null,
      profile: personForm.profile ? Number(personForm.profile) : null,
    })).data,
    onSuccess: async (data) => {
      setEnrollment(data)
      setPersonForm((current) => ({ ...initialPerson, branch: current.branch, device: current.device, profile: current.profile }))
      await Promise.all([
        client.invalidateQueries({ queryKey: ['employees'] }),
        client.invalidateQueries({ queryKey: ['users'] }),
      ])
    },
  })

  const submitDevice = (event: FormEvent) => { event.preventDefault(); setDeviceMessage(''); createDevice.mutate() }
  const submitPerson = (event: FormEvent) => { event.preventDefault(); setEnrollment(null); createEnrollment.mutate() }

  return <>
    <PageHeader eyebrow="Biometría local" title="Control de huella" description="Conecta el huellero por Ethernet, registra al personal y observa entradas y salidas en tiempo casi real." />

    <section className="biometric-status-grid">
      <article className="panel biometric-hero">
        <div className="fingerprint-mark" aria-hidden="true">◎</div>
        <div><p className="eyebrow">Equipo objetivo</p><h2>CMYD231760447</h2><p>El terminal reconoce la huella. SISGETRAN recibe únicamente el PIN, la hora y el tipo de marcación.</p></div>
      </article>
      <article className="panel connection-card">
        <span className={`connection-orb ${devices.data?.some((device) => device.connection_state === 'recent') ? 'connection-orb--online' : ''}`} />
        <div><strong>{devices.data?.some((device) => device.connection_state === 'recent') ? 'Huellero comunicado' : 'Esperando conexión'}</strong><p>Servidor ADMS: <code>{serverAddress}:{network.data?.port ?? '8000'}</code></p></div>
      </article>
    </section>

    <section className="biometric-grid">
      <article className="panel">
        <div className="panel-heading"><div><p className="eyebrow">Paso 1</p><h2>Autorizar huellero</h2></div><span className="badge badge--info">Ethernet</span></div>
        <form className="form-grid" onSubmit={submitDevice}>
          <label>Número de serie<input required value={deviceForm.serial_number} onChange={(e) => setDeviceForm({ ...deviceForm, serial_number: e.target.value.trim() })} /></label>
          <label>Nombre<input required value={deviceForm.name} onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })} /></label>
          <label>Sucursal<select required value={deviceForm.branch} onChange={(e) => setDeviceForm({ ...deviceForm, branch: e.target.value })}><option value="">Selecciona…</option>{branches.data?.map((branch) => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}</select></label>
          <label>IP del huellero<input inputMode="decimal" placeholder="192.168.1.201" value={deviceForm.ip_address} onChange={(e) => setDeviceForm({ ...deviceForm, ip_address: e.target.value })} /></label>
          <label>Puerto propio (prueba)<input required type="number" min="1" max="65535" value={deviceForm.port} onChange={(e) => setDeviceForm({ ...deviceForm, port: e.target.value })} /></label>
          <label>Ubicación<input value={deviceForm.location} onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })} /></label>
          <div className="form-span form-actions"><button className="button button--primary" disabled={createDevice.isPending}>{createDevice.isPending ? 'Guardando…' : 'Guardar y autorizar'}</button></div>
        </form>
        {createDevice.isError && <p className="form-error">{apiErrorMessage(createDevice.error)}</p>}
        {deviceMessage && <p className="form-notice">{deviceMessage}</p>}
        {!!devices.data?.length && <div className="device-list">{devices.data.map((device) => <div key={device.id}><span className={`connection-dot ${device.connection_state !== 'recent' ? 'connection-dot--muted' : ''}`} /><div><strong>{device.name}</strong><small>{device.serial_number} · {device.ip_address || 'IP pendiente'} · última conexión {formatDate(device.last_connection)}</small></div><button className="button button--ghost" type="button" disabled={testConnection.isPending || !device.ip_address} onClick={() => testConnection.mutate(device)}>Probar red</button></div>)}</div>}
      </article>

      <article className="panel setup-card">
        <p className="eyebrow">Configuración física</p><h2>Apunta el equipo a esta PC</h2>
        <ol className="setup-steps">
          <li><span>1</span><div><strong>Conecta ambos a la misma red</strong><p>PC y huellero deben compartir el router o switch Ethernet.</p></div></li>
          <li><span>2</span><div><strong>Abre COMM → Cloud Server / ADMS</strong><p>Servidor: <code>{serverAddress}</code> · Puerto: <code>{network.data?.port ?? '8000'}</code> · HTTPS: desactivado para esta red local.</p></div></li>
          <li><span>3</span><div><strong>Arranca Django en la red</strong><p><code>python manage.py runserver 0.0.0.0:8000</code></p></div></li>
          <li><span>4</span><div><strong>Autoriza el firewall local</strong><p>Permite TCP 8000 solo en redes privadas. La ruta usada será <code>/iclock/cdata</code>.</p></div></li>
        </ol>
        {network.data?.addresses?.length ? <p className="network-hint">IPs detectadas: {network.data.addresses.join(', ')}</p> : <p className="network-hint">No se detectó una IP LAN. Conecta primero la PC a la red Ethernet.</p>}
      </article>
    </section>

    <section className="panel enrollment-panel">
      <div className="panel-heading"><div><p className="eyebrow">Paso 2</p><h2>Registrar usuario y empleado</h2><p>El PIN debe ser el mismo en SISGETRAN y en el huellero.</p></div><span className="badge badge--success">Sin guardar la plantilla</span></div>
      <form className="form-grid form-grid--four" onSubmit={submitPerson}>
        <label>Usuario<input required value={personForm.username} onChange={(e) => setPersonForm({ ...personForm, username: e.target.value })} /></label>
        <label>Correo<input required type="email" value={personForm.email} onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })} /></label>
        <label>Clave temporal<input required type="password" minLength={10} value={personForm.temporary_password} onChange={(e) => setPersonForm({ ...personForm, temporary_password: e.target.value })} /></label>
        <label>Perfil<select value={personForm.profile} onChange={(e) => setPersonForm({ ...personForm, profile: e.target.value })}><option value="">Sin perfil</option>{profiles.data?.map((profile) => <option key={profile.id} value={profile.id}>{profile.nombre}</option>)}</select></label>
        <label>Nombres<input required value={personForm.first_name} onChange={(e) => setPersonForm({ ...personForm, first_name: e.target.value })} /></label>
        <label>Apellidos<input required value={personForm.last_name} onChange={(e) => setPersonForm({ ...personForm, last_name: e.target.value })} /></label>
        <label>Documento<input required inputMode="numeric" minLength={8} maxLength={11} value={personForm.document_number} onChange={(e) => setPersonForm({ ...personForm, document_number: e.target.value.replace(/\D/g, '') })} /></label>
        <label>Código de empleado<input required value={personForm.employee_code} onChange={(e) => setPersonForm({ ...personForm, employee_code: e.target.value })} /></label>
        <label>Cargo<input value={personForm.job_title} onChange={(e) => setPersonForm({ ...personForm, job_title: e.target.value })} /></label>
        <label>PIN biométrico<input required inputMode="numeric" value={personForm.biometric_pin} onChange={(e) => setPersonForm({ ...personForm, biometric_pin: e.target.value.replace(/\D/g, '') })} /></label>
        <label>Sucursal<select required value={personForm.branch} onChange={(e) => setPersonForm({ ...personForm, branch: e.target.value, device: '' })}><option value="">Selecciona…</option>{branches.data?.map((branch) => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}</select></label>
        <label>Huellero<select value={personForm.device} onChange={(e) => setPersonForm({ ...personForm, device: e.target.value })}><option value="">Registrar sin sincronizar</option>{devices.data?.filter((device) => !personForm.branch || device.branch === Number(personForm.branch)).map((device) => <option key={device.id} value={device.id}>{device.name} · {device.serial_number}</option>)}</select></label>
        <div className="form-span form-actions"><button className="button button--primary" disabled={createEnrollment.isPending}>{createEnrollment.isPending ? 'Registrando…' : 'Registrar usuario'}</button></div>
      </form>
      {createEnrollment.isError && <p className="form-error">{apiErrorMessage(createEnrollment.error)}</p>}
      {enrollment && <div className="success-callout"><strong>Usuario registrado con PIN {enrollment.biometric_pin}</strong><span>{enrollment.next_step} {selectedDevice ? `Equipo: ${selectedDevice.name}.` : ''}</span>{enrollment.device_command_id && <small>La orden de alta quedó en cola y se enviará cuando el huellero consulte al servidor.</small>}</div>}
    </section>

    <section className="panel table-panel live-panel">
      <div className="panel-heading live-heading"><div><p className="eyebrow">Monitor local</p><h2>Entradas y salidas recientes</h2></div><span><i className="connection-dot" /> Actualización cada 4 s</span></div>
      <div className="table-wrap"><table><thead><tr><th>Fecha y hora</th><th>Persona</th><th>PIN</th><th>Movimiento</th><th>Método</th></tr></thead><tbody>
        {events.data?.map((item) => <tr key={item.id}><td>{formatDate(item.occurred_at)}</td><td>{item.employee_name || <span className="text-danger">PIN sin asociar</span>}</td><td>{item.biometric_pin}</td><td><span className={`badge badge--${item.direction === 'entry' ? 'success' : item.direction === 'exit' ? 'info' : 'neutral'}`}>{item.direction === 'entry' ? 'Entrada' : item.direction === 'exit' ? 'Salida' : 'Sin determinar'}</span></td><td>{item.verification_method === 'fingerprint' ? 'Huella' : item.verification_method}</td></tr>)}
        {!events.isLoading && !events.data?.length && <tr><td colSpan={5} className="empty-cell">Aún no hay marcaciones. Coloca una huella registrada en el equipo.</td></tr>}
      </tbody></table></div>
    </section>
  </>
}
