export function StatusBadge({ active, label }: { active: boolean; label?: string }) {
  return <span className={`badge ${active ? 'badge--success' : 'badge--neutral'}`}>{label ?? (active ? 'Activo' : 'Inactivo')}</span>
}
