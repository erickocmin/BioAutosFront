import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { apiErrorMessage } from '../../api/errors'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Paginated } from '../../types/api'

interface Branch { id: number; nombre: string }
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

const initialDevice = {
  serial_number: 'CMYD231760447', name: 'Huellero principal', branch: '', ip_address: '', port: '4370',
  device_model: 'ZKTeco / ADMS', location: 'Oficina local', status: 'active',
}

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value))
  : 'Nunca'

export function LocalBiometricPage() {
  const client = useQueryClient()
  const [deviceForm, setDeviceForm] = useState(initialDevice)
  const [deviceMessage, setDeviceMessage] = useState('')

  const branches = useQuery({ queryKey: ['branch-options'], queryFn: async () => (await api.get<Paginated<Branch>>('/core/sucursales/', { params: { page_size: 100 } })).data.results })
  const devices = useQuery({ queryKey: ['attendance-devices'], queryFn: async () => (await api.get<Paginated<Device>>('/attendance/devices/', { params: { page_size: 100 } })).data.results, refetchInterval: 5000 })
  const events = useQuery({ queryKey: ['attendance-live-events'], queryFn: async () => (await api.get<Paginated<Event>>('/attendance/events/', { params: { page_size: 12 } })).data.results, refetchInterval: 4000 })
  const network = useQuery({ queryKey: ['local-network'], queryFn: async () => (await api.get<NetworkInfo>('/attendance/local-network/')).data })

  const serverAddress = network.data?.recommended_address ?? '<IP-DE-ESTA-PC>'
  const unassignedCount = useMemo(() => events.data?.filter((item) => !item.employee_name).length ?? 0, [events.data])

  const createDevice = useMutation({
    mutationFn: () => {
      const payload = { ...deviceForm, branch: Number(deviceForm.branch), port: Number(deviceForm.port), ip_address: deviceForm.ip_address || null }
      const existing = devices.data?.find((device) => device.serial_number === deviceForm.serial_number)
      return existing ? api.patch(`/attendance/devices/${existing.id}/`, payload) : api.post('/attendance/devices/', payload)
    },
    onSuccess: async () => {
      setDeviceMessage('Huellero autorizado. Ya puede apuntar el equipo a este servidor.')
      await client.invalidateQueries({ queryKey: ['attendance-devices'] })
    },
  })
  const testConnection = useMutation({
    mutationFn: async (device: Device) => (await api.post<{ reachable: boolean; message: string }>(`/attendance/devices/${device.id}/test-connection/`)).data,
    onSuccess: (data) => setDeviceMessage(data.message),
    onError: (error) => setDeviceMessage(apiErrorMessage(error)),
  })

  const submitDevice = (event: FormEvent) => { event.preventDefault(); setDeviceMessage(''); createDevice.mutate() }

  return <>
    <PageHeader eyebrow="Biometría local" title="Reconocimiento biométrico" description="Conecta el huellero por Ethernet y observa entradas y salidas en tiempo casi real." />

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
        <div className="panel-heading"><div><h2>Autorizar huellero</h2></div><span className="badge badge--info">Ethernet</span></div>
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

    {unassignedCount > 0 && <section className="panel form-notice" role="alert">
      <strong>{unassignedCount} marcación{unassignedCount > 1 ? 'es' : ''} con PIN sin asociar.</strong>
      {' '}El huellero reconoció una huella que no tiene datos completos en SISGETRAN.{' '}
      <Link to="/attendance/registro">Completar registro del empleado →</Link>
    </section>}

    <section className="panel table-panel live-panel">
      <div className="panel-heading live-heading"><div><p className="eyebrow">Monitor local</p><h2>Entradas y salidas recientes</h2></div><span><i className="connection-dot" /> Actualización cada 4 s</span></div>
      <div className="table-wrap"><table><thead><tr><th>Fecha y hora</th><th>Persona</th><th>PIN</th><th>Movimiento</th><th>Método</th></tr></thead><tbody>
        {events.data?.map((item) => <tr key={item.id}><td>{formatDate(item.occurred_at)}</td><td>{item.employee_name || <span className="text-danger">PIN sin asociar</span>}</td><td>{item.biometric_pin}</td><td><span className={`badge badge--${item.direction === 'entry' ? 'success' : item.direction === 'exit' ? 'info' : 'neutral'}`}>{item.direction === 'entry' ? 'Entrada' : item.direction === 'exit' ? 'Salida' : 'Sin determinar'}</span></td><td>{item.verification_method === 'fingerprint' ? 'Huella' : item.verification_method}</td></tr>)}
        {!events.isLoading && !events.data?.length && <tr><td colSpan={5} className="empty-cell">Aún no hay marcaciones. Coloca una huella registrada en el equipo.</td></tr>}
      </tbody></table></div>
    </section>
  </>
}
