import { CrudResource } from '../../components/tables/CrudResource'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'

export function CompaniesPage() {
  return <><PageHeader eyebrow="Core" title="Empresas" description="Entidades legales que operan dentro de la plataforma." />
    <section className="panel table-panel"><CrudResource endpoint="/core/empresas/" queryKey="companies" permission="core.empresas" initial={{ ruc: '', razon_social: '', nombre_comercial: '', activa: true }} fields={[
      { name: 'ruc', label: 'RUC', required: true }, { name: 'razon_social', label: 'Razón social', required: true }, { name: 'nombre_comercial', label: 'Nombre comercial' }, { name: 'activa', label: 'Activa', type: 'checkbox' },
    ]} columns={[{ key: 'ruc', label: 'RUC' }, { key: 'razon_social', label: 'Razón social' }, { key: 'nombre_comercial', label: 'Nombre comercial' }, { key: 'activa', label: 'Estado', render: (row) => <StatusBadge active={Boolean(row.activa)} /> }]} /></section></>
}
