import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { ResourceTable } from '../../components/tables/ResourceTable'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Paginated } from '../../types/api'

interface AttendanceEvent { id: number; employee_name: string | null; biometric_pin: string; occurred_at: string; verification_method: string; direction: string; device: number; processed_at: string | null }
const methods: Record<string, string> = { fingerprint: 'Huella', face: 'Rostro', card: 'Tarjeta', password: 'Contraseña', other: 'Otro' }
const useOptions = <T,>(key: string, endpoint: string) => useQuery({ queryKey: [key], queryFn: async () => (await api.get<Paginated<T>>(endpoint, { params: { page_size: 100 } })).data.results })

export function EventsPage() {
  const employees = useOptions<{ id: number; nombres: string; apellidos: string }>('employee-options', '/accounts/empleados/')
  const devices = useOptions<{ id: number; name: string }>('device-options', '/attendance/devices/')
  const branches = useOptions<{ id: number; nombre: string }>('branch-options', '/core/sucursales/')
  return <><PageHeader eyebrow="Asistencia" title="Marcaciones" description="Eventos crudos inmutables recibidos desde relojes y futuras fuentes faciales." />
    <section className="panel table-panel"><ResourceTable<AttendanceEvent> endpoint="/attendance/events/" queryKey="attendance-events" filterFields={[
      { name: 'date_from', label: 'Desde', type: 'date' }, { name: 'date_to', label: 'Hasta', type: 'date' }, { name: 'employee', label: 'Empleado', type: 'select', options: employees.data?.map((item) => ({ value: item.id, label: `${item.apellidos}, ${item.nombres}` })) }, { name: 'device', label: 'Dispositivo', type: 'select', options: devices.data?.map((item) => ({ value: item.id, label: item.name })) }, { name: 'verification_method', label: 'Método', type: 'select', options: Object.entries(methods).map(([value, label]) => ({ value, label })) }, { name: 'direction', label: 'Movimiento', type: 'select', options: [{ value: 'entry', label: 'Entrada' }, { value: 'exit', label: 'Salida' }, { value: 'unknown', label: 'Sin determinar' }] }, { name: 'branch', label: 'Sucursal', type: 'select', options: branches.data?.map((item) => ({ value: item.id, label: item.nombre })) },
    ]} columns={[
      { key: 'occurred_at', label: 'Fecha y hora', render: (row) => new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(row.occurred_at)) },
      { key: 'employee_name', label: 'Empleado', render: (row) => row.employee_name || <span className="text-danger">PIN sin asociar</span> }, { key: 'biometric_pin', label: 'PIN' },
      { key: 'direction', label: 'Movimiento', render: (row) => <span className={`badge badge--${row.direction === 'entry' ? 'success' : row.direction === 'exit' ? 'info' : 'neutral'}`}>{row.direction === 'entry' ? 'Entrada' : row.direction === 'exit' ? 'Salida' : 'Sin determinar'}</span> },
      { key: 'verification_method', label: 'Verificación', render: (row) => <span className="badge badge--info">{methods[row.verification_method] ?? row.verification_method}</span> },
      { key: 'processed_at', label: 'Proceso', render: (row) => <span className={`badge badge--${row.processed_at ? 'success' : 'neutral'}`}>{row.processed_at ? 'Procesado' : 'Pendiente'}</span> },
    ]} /></section></>
}
