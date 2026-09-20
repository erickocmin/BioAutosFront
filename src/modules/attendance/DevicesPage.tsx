import { ResourceTable } from '../../components/tables/ResourceTable'
import { PageHeader } from '../../components/ui/PageHeader'

interface Device { id: number; serial_number: string; name: string; device_model: string; location: string; ip_address: string | null; last_connection: string | null; last_marking: string | null; connection_state: 'recent' | 'disconnected' | 'never_connected'; status: string }
const connectionLabels = { recent: 'RECIENTE', disconnected: 'SIN CONEXIÓN', never_connected: 'NUNCA CONECTADO' }

export function DevicesPage() {
  return <><PageHeader eyebrow="Integraciones" title="Dispositivos de asistencia" description="Relojes ZKTeco autorizados para comunicarse mediante ADMS/iClock." />
    <section className="panel table-panel"><ResourceTable<Device> endpoint="/attendance/devices/" queryKey="attendance-devices" columns={[
      { key: 'serial_number', label: 'Serie' }, { key: 'name', label: 'Nombre' }, { key: 'device_model', label: 'Modelo' }, { key: 'location', label: 'Ubicación' }, { key: 'ip_address', label: 'IP' },
      { key: 'last_connection', label: 'Última conexión', render: (row) => row.last_connection ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.last_connection)) : 'Nunca' },
      { key: 'last_marking', label: 'Última marcación', render: (row) => row.last_marking ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.last_marking)) : 'Nunca' },
      { key: 'connection_state', label: 'Conexión', render: (row) => <span className={`badge badge--${row.connection_state === 'recent' ? 'success' : 'neutral'}`}>{connectionLabels[row.connection_state]}</span> },
      { key: 'status', label: 'Configuración', render: (row) => <span className={`badge badge--${row.status === 'active' ? 'success' : 'neutral'}`}>{row.status === 'active' ? 'Activo' : row.status}</span> },
    ]} /></section></>
}
