import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useState } from 'react'
import { api } from '../../api/client'
import type { Paginated } from '../../types/api'
import { ErrorState, LoadingState } from '../feedback/States'
import { DataTable, type Column } from './DataTable'
import { Pagination } from './Pagination'

export interface FilterField { name: string; label: string; type?: 'text' | 'date' | 'select'; options?: Array<{ value: string | number; label: string }> }

export function ResourceTable<T extends { id: number | string }>({ endpoint, queryKey, columns, pageSize = 20, filterFields = [] }: { endpoint: string; queryKey: string; columns: Column<T>[]; pageSize?: number; filterFields?: FilterField[] }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const query = useQuery({
    queryKey: [queryKey, page, pageSize, deferredSearch, filters],
    queryFn: async () => (await api.get<Paginated<T>>(endpoint, { params: { page, page_size: pageSize, search: deferredSearch || undefined, ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) } })).data,
  })
  return <>
    <div className="table-tools table-tools--filters"><label className="search"><span className="sr-only">Buscar</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Buscar…" /></label>{filterFields.map((field) => <label className="table-filter" key={field.name}><span>{field.label}</span>{field.type === 'select' ? <select value={filters[field.name] ?? ''} onChange={(event) => { setFilters({ ...filters, [field.name]: event.target.value }); setPage(1) }}><option value="">Todos</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={field.type ?? 'text'} value={filters[field.name] ?? ''} onChange={(event) => { setFilters({ ...filters, [field.name]: event.target.value }); setPage(1) }} />}</label>)}</div>
    {query.isLoading && <LoadingState />}
    {query.isError && <ErrorState onRetry={() => void query.refetch()} />}
    {query.data && <><DataTable rows={query.data.results} columns={columns} /><Pagination page={page} pageSize={pageSize} total={query.data.count} onPageChange={setPage} /></>}
  </>
}
