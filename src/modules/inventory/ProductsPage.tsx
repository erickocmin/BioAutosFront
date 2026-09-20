import { ResourceTable } from '../../components/tables/ResourceTable'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface Product { id: number; codigo: string; codigo_barras: string | null; nombre: string; stock_minimo: string; afecta_stock: boolean; activo: boolean; stocks: Array<{ almacen_nombre: string; cantidad: string }> }

export function ProductsPage() {
  return <><PageHeader eyebrow="Inventario" title="Productos y stock" description="Existencias reales por almacén, calculadas y filtradas en servidor." />
    <section className="panel table-panel"><ResourceTable<Product> endpoint="/inventory/productos/" queryKey="products" columns={[
      { key: 'codigo', label: 'Código' }, { key: 'nombre', label: 'Producto' }, { key: 'codigo_barras', label: 'Código de barras' },
      { key: 'stocks', label: 'Stock', render: (row) => row.stocks.length ? row.stocks.map((stock) => `${stock.almacen_nombre}: ${Number(stock.cantidad).toLocaleString('es-PE')}`).join(' · ') : 'Sin stock' },
      { key: 'activo', label: 'Estado', render: (row) => <StatusBadge active={row.activo} /> },
    ]} /></section></>
}
