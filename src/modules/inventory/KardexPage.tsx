import { ResourceTable } from '../../components/tables/ResourceTable'
import { PageHeader } from '../../components/ui/PageHeader'

interface Entry { id: number; producto_nombre: string; almacen_nombre: string; direccion: 'in' | 'out'; cantidad: string; saldo: string; costo_unitario: string; created_at: string; movimiento: number }
export function KardexPage() {
  return <><PageHeader eyebrow="Inventario" title="Kardex" description="Historial inmutable de entradas, salidas y saldos por almacén." /><section className="panel table-panel"><ResourceTable<Entry> endpoint="/inventory/kardex/" queryKey="kardex" columns={[
    { key: 'created_at', label: 'Fecha', render: (row) => new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.created_at)) }, { key: 'producto_nombre', label: 'Producto' }, { key: 'almacen_nombre', label: 'Almacén' }, { key: 'direccion', label: 'Tipo', render: (row) => row.direccion === 'in' ? 'Entrada' : 'Salida' }, { key: 'cantidad', label: 'Cantidad' }, { key: 'saldo', label: 'Saldo' }, { key: 'movimiento', label: 'Movimiento' },
  ]} /></section></>
}
