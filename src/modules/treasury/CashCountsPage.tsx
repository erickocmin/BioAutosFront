import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import { apiErrorMessage } from '../../api/errors'
import { PermissionGate } from '../../auth/PermissionGate'
import { ResourceTable } from '../../components/tables/ResourceTable'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Paginated } from '../../types/api'

interface CashCount { id: number; fecha: string; sucursal: number; caja: number; cajero: number; total_arqueo: string; total_efectivo: string; total_contado: number; diferencia: number; estado: string }
interface Cashbox { id: number; nombre: string }
interface Payment { id: number; nombre: string }
const status: Record<string, string> = { open: 'Abierto', closed: 'Cerrado', cancelled: 'Anulado' }
const denominations = [200, 100, 50, 20, 10, 5, 2, 1, .5, .2, .1]

export function CashCountsPage() {
  const client = useQueryClient()
  const [openCreate, setOpenCreate] = useState(false)
  const [selected, setSelected] = useState<CashCount | null>(null)
  const [caja, setCaja] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [detail, setDetail] = useState({ categoria: 'income', forma_pago: '', descripcion: '', importe: '' })
  const cashboxes = useQuery({ queryKey: ['cashbox-options'], queryFn: async () => (await api.get<Paginated<Cashbox>>('/treasury/cajas/', { params: { page_size: 100, activa: true } })).data.results })
  const payments = useQuery({ queryKey: ['payment-options'], queryFn: async () => (await api.get<Paginated<Payment>>('/treasury/formas-pago/', { params: { page_size: 100 } })).data.results })
  const refresh = async () => client.invalidateQueries({ queryKey: ['cash-counts'] })
  const create = useMutation({ mutationFn: () => api.post('/treasury/arqueos/', { caja: Number(caja), fecha }), onSuccess: async () => { setOpenCreate(false); await refresh() } })
  const count = useMutation({ mutationFn: () => api.put(`/treasury/arqueos/${selected?.id}/conteo-efectivo/`, { denominaciones: denominations.map((value) => ({ denominacion: value, cantidad: counts[String(value)] ?? 0 })) }), onSuccess: async () => refresh() })
  const close = useMutation({ mutationFn: () => api.post(`/treasury/arqueos/${selected?.id}/cerrar/`), onSuccess: async ({ data }) => { setSelected(data); await refresh() } })
  const addDetail = useMutation({ mutationFn: () => api.post(`/treasury/arqueos/${selected?.id}/detalles/`, { ...detail, forma_pago: detail.forma_pago ? Number(detail.forma_pago) : null, importe: Number(detail.importe) }), onSuccess: async () => { const { data } = await api.get<CashCount>(`/treasury/arqueos/${selected?.id}/`); setSelected(data); setDetail({ categoria: 'income', forma_pago: '', descripcion: '', importe: '' }); await refresh() } })
  const submitCreate = (event: FormEvent) => { event.preventDefault(); create.mutate() }
  return <><PageHeader eyebrow="Tesorería" title="Arqueos" description="Conteo físico, diferencia y cierre recalculados por el backend." actions={<PermissionGate permission="treasury.arqueos.create"><button className="button button--primary" onClick={() => setOpenCreate(true)}>Abrir arqueo</button></PermissionGate>} />
    <section className="panel table-panel"><ResourceTable<CashCount> endpoint="/treasury/arqueos/" queryKey="cash-counts" columns={[
      { key: 'fecha', label: 'Fecha' }, { key: 'caja', label: 'Caja' }, { key: 'cajero', label: 'Responsable' }, { key: 'total_arqueo', label: 'Total', render: (row) => `S/ ${Number(row.total_arqueo).toFixed(2)}` }, { key: 'total_efectivo', label: 'Declarado', render: (row) => `S/ ${Number(row.total_efectivo).toFixed(2)}` }, { key: 'total_contado', label: 'Contado', render: (row) => `S/ ${Number(row.total_contado).toFixed(2)}` }, { key: 'diferencia', label: 'Diferencia', render: (row) => <span className={Number(row.diferencia) === 0 ? 'text-success' : 'text-danger'}>S/ {Number(row.diferencia).toFixed(2)}</span> }, { key: 'estado', label: 'Estado', render: (row) => <button className={`badge badge--${row.estado === 'closed' ? 'success' : 'info'} badge-button`} onClick={() => setSelected(row)}>{status[row.estado]}</button> },
    ]} /></section>
    <Modal open={openCreate} title="Abrir arqueo" onClose={() => setOpenCreate(false)}><form onSubmit={submitCreate}><div className="form-grid"><label>Caja<select required value={caja} onChange={(event) => setCaja(event.target.value)}><option value="">Selecciona…</option>{cashboxes.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label><label>Fecha<input required type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} /></label></div>{create.isError && <p className="form-error">{apiErrorMessage(create.error)}</p>}<div className="form-actions"><button type="button" className="button button--ghost" onClick={() => setOpenCreate(false)}>Cancelar</button><button className="button button--primary" disabled={create.isPending}>Abrir</button></div></form></Modal>
    <Modal open={selected !== null} title={`Arqueo #${selected?.id ?? ''}`} onClose={() => setSelected(null)}>{selected && <><div className="summary-grid"><span>Total<strong>S/ {Number(selected.total_arqueo).toFixed(2)}</strong></span><span>Efectivo declarado<strong>S/ {Number(selected.total_efectivo).toFixed(2)}</strong></span><span>Estado<strong>{status[selected.estado]}</strong></span></div>{selected.estado === 'open' && <><h3>Agregar detalle</h3><div className="movement-item"><label>Categoría<select value={detail.categoria} onChange={(event) => setDetail({ ...detail, categoria: event.target.value })}><option value="income">Ingreso</option><option value="expense">Egreso</option></select></label><label>Forma de pago<select value={detail.forma_pago} onChange={(event) => setDetail({ ...detail, forma_pago: event.target.value })}><option value="">Sin especificar</option>{payments.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label><label>Descripción<input value={detail.descripcion} onChange={(event) => setDetail({ ...detail, descripcion: event.target.value })} /></label><label>Importe<input type="number" min="0" step="0.01" value={detail.importe} onChange={(event) => setDetail({ ...detail, importe: event.target.value })} /></label><PermissionGate permission="treasury.arqueos.update"><button className="button button--ghost" disabled={addDetail.isPending || !detail.importe} onClick={() => addDetail.mutate()}>Agregar</button></PermissionGate></div>{addDetail.isError && <p className="form-error">{apiErrorMessage(addDetail.error)}</p>}<h3>Conteo por denominaciones</h3><div className="denominations">{denominations.map((value) => <label key={value}>S/ {value.toFixed(2)}<input type="number" min="0" value={counts[String(value)] ?? 0} onChange={(event) => setCounts({ ...counts, [String(value)]: Number(event.target.value) })} /></label>)}</div>{count.isError && <p className="form-error">{apiErrorMessage(count.error)}</p>}{close.isError && <p className="form-error">{apiErrorMessage(close.error)}</p>}<div className="form-actions"><PermissionGate permission="treasury.arqueos.update"><button className="button button--ghost" disabled={count.isPending} onClick={() => count.mutate()}>Guardar conteo</button></PermissionGate><PermissionGate permission="treasury.arqueos.close"><button className="button button--primary" disabled={close.isPending} onClick={() => window.confirm('¿Cerrar el arqueo? El backend recalculará los totales y bloqueará cambios.') && close.mutate()}>Cerrar arqueo</button></PermissionGate></div></>}</>}</Modal>
  </>
}
