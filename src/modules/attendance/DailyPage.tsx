import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { ResourceTable } from '../../components/tables/ResourceTable'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Paginated } from '../../types/api'

interface Daily { id: number; employee_name: string; date: string; first_entry: string | null; last_exit: string | null; worked_minutes: number; status: string }
const dateTime = (value: string | null) => value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'
export function DailyPage() {
  const employees = useQuery({ queryKey: ['employee-options'], queryFn: async () => (await api.get<Paginated<{ id: number; nombres: string; apellidos: string }>>('/accounts/empleados/', { params: { page_size: 100 } })).data.results })
  const branches = useQuery({ queryKey: ['branch-options'], queryFn: async () => (await api.get<Paginated<{ id: number; nombre: string }>>('/core/sucursales/', { params: { page_size: 100 } })).data.results })
  return <><PageHeader eyebrow="Asistencia" title="Asistencia diaria" description="Resumen derivado de marcaciones, sin reglas de RR. HH. no aprobadas." /><section className="panel table-panel"><ResourceTable<Daily> endpoint="/attendance/daily/" queryKey="daily-attendance" filterFields={[
    { name: 'date_from', label: 'Desde', type: 'date' }, { name: 'date_to', label: 'Hasta', type: 'date' }, { name: 'employee', label: 'Empleado', type: 'select', options: employees.data?.map((item) => ({ value: item.id, label: `${item.apellidos}, ${item.nombres}` })) }, { name: 'branch', label: 'Sucursal', type: 'select', options: branches.data?.map((item) => ({ value: item.id, label: item.nombre })) }, { name: 'status', label: 'Estado', type: 'select', options: [{ value: 'calculated', label: 'Calculado' }, { value: 'pending', label: 'Pendiente' }] },
  ]} columns={[
    { key: 'date', label: 'Fecha' }, { key: 'employee_name', label: 'Empleado' }, { key: 'first_entry', label: 'Primera entrada', render: (row) => dateTime(row.first_entry) }, { key: 'last_exit', label: 'Última salida', render: (row) => dateTime(row.last_exit) }, { key: 'worked_minutes', label: 'Horas', render: (row) => `${Math.floor(row.worked_minutes / 60)} h ${row.worked_minutes % 60} min` }, { key: 'status', label: 'Estado' },
  ]} /></section></>
}
