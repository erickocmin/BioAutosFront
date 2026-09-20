import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const groups = [
  { label: 'General', items: [{ to: '/', label: 'Resumen', icon: '⌂' }] },
  { label: 'Organización', items: [{ to: '/core/empresas', label: 'Empresas', icon: '◇' }, { to: '/core/sucursales', label: 'Sucursales', icon: '⌖' }, { to: '/accounts/usuarios', label: 'Usuarios', icon: '◎' }, { to: '/accounts/empleados', label: 'Empleados', icon: '◉' }, { to: '/accounts/permisos', label: 'Permisos', icon: '◆' }] },
  { label: 'Operaciones', items: [{ to: '/inventory/productos', label: 'Inventario', icon: '▦' }, { to: '/inventory/movimientos', label: 'Movimientos', icon: '⇄' }, { to: '/inventory/kardex', label: 'Kardex', icon: '≋' }, { to: '/treasury/cajas', label: 'Cajas', icon: '□' }, { to: '/treasury/arqueos', label: 'Arqueos', icon: '▤' }, { to: '/attendance/events', label: 'Marcaciones', icon: '◷' }, { to: '/attendance/daily', label: 'Asistencia diaria', icon: '◫' }, { to: '/attendance/devices', label: 'Dispositivos', icon: '◈' }] },
]

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const current = groups.flatMap((group) => group.items).find((item) => item.to === location.pathname)?.label ?? 'SISGETRAN'
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="brand"><div className="brand-mark brand-mark--small">SG</div><div><strong>SISGETRAN</strong><span>Gestión integrada</span></div></div>
      <nav>{groups.map((group) => <div className="nav-group" key={group.label}><span>{group.label}</span>{group.items.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)}><i>{item.icon}</i>{item.label}</NavLink>)}</div>)}</nav>
      <div className="sidebar-footer"><div className="avatar">{user?.first_name?.[0] || user?.username[0]}</div><div><strong>{user?.first_name || user?.username}</strong><span>{user?.email}</span></div><button aria-label="Cerrar sesión" onClick={() => void logout()}>↪</button></div>
    </aside>
    <div className="app-main">
      <header className="topbar"><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Abrir menú">☰</button><div><span className="breadcrumbs">Inicio / {current}</span><strong>{current}</strong></div><div className="topbar-actions"><span className="connection-dot" />Sistema operativo</div></header>
      <main className="content"><Outlet /></main>
    </div>
    {open && <button className="sidebar-scrim" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
  </div>
}
