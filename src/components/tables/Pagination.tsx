export function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return <nav className="pagination" aria-label="Paginación">
    <span>{total.toLocaleString('es-PE')} registros</span>
    <div><button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Siguiente</button></div>
  </nav>
}
