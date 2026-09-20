import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { CrudResource } from '../../components/tables/CrudResource'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Paginated } from '../../types/api'

export function EmployeesPage() {
  const branches = useQuery({ queryKey: ['branch-options'], queryFn: async () => (await api.get<Paginated<{ id: number; nombre: string }>>('/core/sucursales/', { params: { page_size: 100 } })).data.results })
  return <><PageHeader eyebrow="Personas" title="Empleados" description="Identidad laboral separada de la cuenta de usuario y preparada para biometría." />
    <section className="panel table-panel"><CrudResource endpoint="/accounts/empleados/" queryKey="employees" permission="accounts.empleados" initial={{ sucursal: '', usuario: '', codigo: '', numero_documento: '', nombres: '', apellidos: '', cargo: '', biometric_pin: '', activo: true }} fields={[
      { name: 'sucursal', label: 'Sucursal', type: 'select', required: true, options: branches.data?.map((item) => ({ value: item.id, label: item.nombre })) }, { name: 'codigo', label: 'Código', required: true }, { name: 'numero_documento', label: 'Documento', required: true }, { name: 'nombres', label: 'Nombres', required: true }, { name: 'apellidos', label: 'Apellidos', required: true }, { name: 'cargo', label: 'Cargo' }, { name: 'biometric_pin', label: 'PIN biométrico' }, { name: 'activo', label: 'Activo', type: 'checkbox' },
    ]} normalize={(data) => ({ ...data, sucursal: Number(data.sucursal), usuario: data.usuario || null, biometric_pin: data.biometric_pin || null })} columns={[{ key: 'codigo', label: 'Código' }, { key: 'numero_documento', label: 'Documento' }, { key: 'apellidos', label: 'Apellidos' }, { key: 'nombres', label: 'Nombres' }, { key: 'cargo', label: 'Cargo' }, { key: 'biometric_pin', label: 'PIN biométrico' }, { key: 'activo', label: 'Estado', render: (row) => <StatusBadge active={Boolean(row.activo)} /> }]} /></section></>
}
