import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { CrudResource } from '../../components/tables/CrudResource'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Paginated } from '../../types/api'

export function BranchesPage() {
  const companies = useQuery({ queryKey: ['company-options'], queryFn: async () => (await api.get<Paginated<{ id: number; razon_social: string }>>('/core/empresas/', { params: { page_size: 100 } })).data.results })
  return <><PageHeader eyebrow="Core" title="Sucursales" description="Sedes operativas y contexto de acceso de los usuarios." />
    <section className="panel table-panel"><CrudResource endpoint="/core/sucursales/" queryKey="branches" permission="core.sucursales" initial={{ empresa: '', codigo: '', nombre: '', direccion: '', activa: true }} fields={[
      { name: 'empresa', label: 'Empresa', type: 'select', required: true, options: companies.data?.map((item) => ({ value: item.id, label: item.razon_social })) }, { name: 'codigo', label: 'Código', required: true }, { name: 'nombre', label: 'Nombre', required: true }, { name: 'direccion', label: 'Dirección' }, { name: 'activa', label: 'Activa', type: 'checkbox' },
    ]} normalize={(data) => ({ ...data, empresa: Number(data.empresa) })} columns={[{ key: 'codigo', label: 'Código' }, { key: 'nombre', label: 'Sucursal' }, { key: 'direccion', label: 'Dirección' }, { key: 'empresa', label: 'Empresa' }, { key: 'activa', label: 'Estado', render: (row) => <StatusBadge active={Boolean(row.activa)} /> }]} /></section></>
}
