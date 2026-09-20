import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useState, type FormEvent, type ReactNode } from 'react'
import { api } from '../../api/client'
import { apiErrorMessage } from '../../api/errors'
import { PermissionGate } from '../../auth/PermissionGate'
import type { Paginated } from '../../types/api'
import { ErrorState, LoadingState } from '../feedback/States'
import { Modal } from '../ui/Modal'
import { DataTable, type Column } from './DataTable'
import { Pagination } from './Pagination'

export interface CrudField {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'checkbox' | 'select' | 'date' | 'number'
  required?: boolean
  options?: Array<{ value: string | number; label: string }>
  hideOnEdit?: boolean
}

type Row = { id: number | string } & Record<string, unknown>

export function CrudResource({ endpoint, queryKey, columns, fields, initial, permission, normalize, extraActions }: {
  endpoint: string
  queryKey: string
  columns: Column<Row>[]
  fields: CrudField[]
  initial: Record<string, unknown>
  permission: string
  normalize?: (data: Record<string, unknown>) => Record<string, unknown>
  extraActions?: (row: Row, edit: (row: Row) => void) => ReactNode
}) {
  const client = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [editing, setEditing] = useState<Row | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>(initial)
  const [open, setOpen] = useState(false)
  const query = useQuery({ queryKey: [queryKey, page, deferredSearch], queryFn: async () => (await api.get<Paginated<Row>>(endpoint, { params: { page, search: deferredSearch || undefined } })).data })
  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const clean = { ...payload }
      if (editing) fields.filter((field) => field.hideOnEdit).forEach((field) => delete clean[field.name])
      return editing ? api.patch(`${endpoint}${editing.id}/`, clean) : api.post(endpoint, clean)
    },
    onSuccess: async () => { setOpen(false); await client.invalidateQueries({ queryKey: [queryKey] }) },
  })
  const beginCreate = () => { setEditing(null); setForm(initial); mutation.reset(); setOpen(true) }
  const beginEdit = (row: Row) => { setEditing(row); setForm({ ...initial, ...row }); mutation.reset(); setOpen(true) }
  const submit = (event: FormEvent) => { event.preventDefault(); mutation.mutate(normalize ? normalize(form) : form) }
  const renderedColumns: Column<Row>[] = [...columns, { key: 'actions', label: 'Acciones', render: (row) => <div className="row-actions"><PermissionGate permission={`${permission}.update`}><button className="link-button" onClick={() => beginEdit(row)}>Editar</button></PermissionGate>{extraActions?.(row, beginEdit)}</div> }]
  return <>
    <div className="table-tools"><label className="search"><span className="sr-only">Buscar</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Buscar…" /></label><PermissionGate permission={`${permission}.create`}><button className="button button--primary" onClick={beginCreate}>Nuevo registro</button></PermissionGate></div>
    {query.isLoading && <LoadingState />}{query.isError && <ErrorState onRetry={() => void query.refetch()} />}
    {query.data && <><DataTable rows={query.data.results} columns={renderedColumns} /><Pagination page={page} pageSize={20} total={query.data.count} onPageChange={setPage} /></>}
    <Modal open={open} title={editing ? 'Editar registro' : 'Nuevo registro'} onClose={() => !mutation.isPending && setOpen(false)}>
      <form onSubmit={submit}><div className="form-grid">{fields.filter((field) => !(editing && field.hideOnEdit)).map((field) => <label className={field.type === 'checkbox' ? 'checkbox-field' : ''} key={field.name}>{field.label}{field.type === 'select' ? <select required={field.required} value={String(form[field.name] ?? '')} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}><option value="">Selecciona…</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={field.type ?? 'text'} required={field.required} checked={field.type === 'checkbox' ? Boolean(form[field.name]) : undefined} value={field.type === 'checkbox' ? undefined : String(form[field.name] ?? '')} onChange={(event) => setForm({ ...form, [field.name]: field.type === 'checkbox' ? event.target.checked : event.target.value })} />}</label>)}</div>
      {mutation.isError && <p className="form-error" role="alert">{apiErrorMessage(mutation.error)}</p>}<div className="form-actions"><button type="button" className="button button--ghost" onClick={() => setOpen(false)} disabled={mutation.isPending}>Cancelar</button><button className="button button--primary" disabled={mutation.isPending}>{mutation.isPending ? 'Guardando…' : 'Guardar'}</button></div></form>
    </Modal>
  </>
}
