import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { CrudResource } from '../../components/tables/CrudResource'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Paginated } from '../../types/api'

export function CashboxesPage() {
  const branches = useQuery({ queryKey: ['branch-options'], queryFn: async () => (await api.get<Paginated<{ id: number; nombre: string }>>('/core/sucursales/', { params: { page_size: 100 } })).data.results })
  return <><PageHeader eyebrow="Tesorería" title="Cajas" description="Puntos de control de efectivo por sucursal." /><section className="panel table-panel"><CrudResource endpoint="/treasury/cajas/" queryKey="cashboxes" permission="treasury.cajas" initial={{ sucursal: '', codigo: '', nombre: '', activa: true }} fields={[
    { name: 'sucursal', label: 'Sucursal', type: 'select', required: true, options: branches.data?.map((item) => ({ value: item.id, label: item.nombre })) }, { name: 'codigo', label: 'Código', required: true }, { name: 'nombre', label: 'Nombre', required: true }, { name: 'activa', label: 'Activa', type: 'checkbox' },
  ]} normalize={(data) => ({ ...data, sucursal: Number(data.sucursal) })} columns={[{ key: 'codigo', label: 'Código' }, { key: 'nombre', label: 'Caja' }, { key: 'sucursal', label: 'Sucursal' }, { key: 'activa', label: 'Estado', render: (row) => <StatusBadge active={Boolean(row.activa)} /> }]} /></section></>
}
