export function LoadingState({ label = 'Cargando información…' }: { label?: string }) {
  return <div className="state-card" role="status"><span className="spinner" />{label}</div>
}

export function EmptyState({ title = 'Sin resultados', message = 'No hay datos que mostrar con los filtros actuales.' }: { title?: string; message?: string }) {
  return <div className="state-card"><strong>{title}</strong><span>{message}</span></div>
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <div className="state-card state-card--error"><strong>No pudimos cargar la información</strong><span>Verifica la conexión e inténtalo nuevamente.</span>{onRetry && <button onClick={onRetry}>Reintentar</button>}</div>
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return <div aria-hidden="true">{Array.from({ length: lines }, (_, index) => <div className="skeleton" key={index} />)}</div>
}
