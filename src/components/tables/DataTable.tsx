import { EmptyState } from '../feedback/States'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: number | string }> {
  rows: T[]
  columns: Column<T>[]
  selected?: Set<number | string>
  onSelectionChange?: (selection: Set<number | string>) => void
}

export function DataTable<T extends { id: number | string }>({ rows, columns, selected = new Set(), onSelectionChange }: DataTableProps<T>) {
  if (!rows.length) return <EmptyState />
  const toggle = (id: number | string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange?.(next)
  }
  return <div className="table-wrap">
    <table>
      <thead><tr>{onSelectionChange && <th className="check-cell"><span className="sr-only">Seleccionar</span></th>}{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}>
        {onSelectionChange && <td className="check-cell"><input aria-label={`Seleccionar registro ${row.id}`} type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} /></td>}
        {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '—')}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}
