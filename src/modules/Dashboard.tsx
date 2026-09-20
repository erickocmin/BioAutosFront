import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

const cards = [
  { label: 'Productos activos', endpoint: '/inventory/productos/?page_size=1', tone: 'teal' },
  { label: 'Arqueos registrados', endpoint: '/treasury/arqueos/?page_size=1', tone: 'blue' },
  { label: 'Marcaciones recibidas', endpoint: '/attendance/events/?page_size=1', tone: 'amber' },
  { label: 'Empleados activos', endpoint: '/accounts/empleados/?page_size=1&activo=true', tone: 'violet' },
]

function MetricCard({ label, endpoint, tone }: { label: string; endpoint: string; tone: string }) {
  const query = useQuery({ queryKey: ['metric', endpoint], queryFn: async () => (await api.get(endpoint)).data.count as number })
  return <article className={`metric metric--${tone}`}><span>{label}</span><strong>{query.isLoading ? '—' : (query.data ?? 0).toLocaleString('es-PE')}</strong><small>Datos actuales</small></article>
}

export function Dashboard() {
  return <><section className="hero"><div><p className="eyebrow">Vista general</p><h1>Control operativo, sin ruido.</h1><p>Una lectura rápida de las áreas que mantienen el negocio en movimiento.</p></div><div className="hero-date">Hoy<br /><strong>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date())}</strong></div></section>
    <section className="metrics">{cards.map((card) => <MetricCard key={card.label} {...card} />)}</section>
    <section className="dashboard-grid"><article className="panel"><p className="eyebrow">Flujo recomendado</p><h2>Operación diaria</h2><ol className="timeline"><li><span>1</span><div><strong>Revisar marcaciones</strong><p>Detecta PIN desconocidos antes del cálculo diario.</p></div></li><li><span>2</span><div><strong>Validar movimientos</strong><p>Compras, salidas y traslados mantienen un kardex doble.</p></div></li><li><span>3</span><div><strong>Cerrar caja</strong><p>Contrasta el conteo físico con el efectivo declarado.</p></div></li></ol></article><article className="panel panel--dark"><p className="eyebrow">Arquitectura segura</p><h2>Permisos en cada operación</h2><p>La interfaz facilita el trabajo, pero cada acción vuelve a validarse en el backend.</p><span className="badge badge--light">Trazabilidad activa</span></article></section>
  </>
}
