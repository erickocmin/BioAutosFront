import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './auth/LoginPage'
import { AppLayout } from './layouts/AppLayout'
import { LoadingState } from './components/feedback/States'
import { ProtectedRoute } from './routes/ProtectedRoute'

const Dashboard = lazy(() => import('./modules/Dashboard').then((module) => ({ default: module.Dashboard })))
const EmployeesPage = lazy(() => import('./modules/accounts/EmployeesPage').then((module) => ({ default: module.EmployeesPage })))
const UsersPage = lazy(() => import('./modules/accounts/UsersPage').then((module) => ({ default: module.UsersPage })))
const PermissionsPage = lazy(() => import('./modules/accounts/PermissionsPage').then((module) => ({ default: module.PermissionsPage })))
const DevicesPage = lazy(() => import('./modules/attendance/DevicesPage').then((module) => ({ default: module.DevicesPage })))
const EventsPage = lazy(() => import('./modules/attendance/EventsPage').then((module) => ({ default: module.EventsPage })))
const DailyPage = lazy(() => import('./modules/attendance/DailyPage').then((module) => ({ default: module.DailyPage })))
const LocalBiometricPage = lazy(() => import('./modules/attendance/LocalBiometricPage').then((module) => ({ default: module.LocalBiometricPage })))
const BranchesPage = lazy(() => import('./modules/core/BranchesPage').then((module) => ({ default: module.BranchesPage })))
const CompaniesPage = lazy(() => import('./modules/core/CompaniesPage').then((module) => ({ default: module.CompaniesPage })))
const MovementsPage = lazy(() => import('./modules/inventory/MovementsPage').then((module) => ({ default: module.MovementsPage })))
const KardexPage = lazy(() => import('./modules/inventory/KardexPage').then((module) => ({ default: module.KardexPage })))
const ProductsPage = lazy(() => import('./modules/inventory/ProductsPage').then((module) => ({ default: module.ProductsPage })))
const CashCountsPage = lazy(() => import('./modules/treasury/CashCountsPage').then((module) => ({ default: module.CashCountsPage })))
const CashboxesPage = lazy(() => import('./modules/treasury/CashboxesPage').then((module) => ({ default: module.CashboxesPage })))

export default function App() {
  return <Suspense fallback={<LoadingState />}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="core/empresas" element={<CompaniesPage />} />
        <Route path="core/sucursales" element={<BranchesPage />} />
        <Route path="accounts/usuarios" element={<UsersPage />} />
        <Route path="accounts/empleados" element={<EmployeesPage />} />
        <Route path="accounts/permisos" element={<PermissionsPage />} />
        <Route path="inventory/productos" element={<ProductsPage />} />
        <Route path="inventory/movimientos" element={<MovementsPage />} />
        <Route path="inventory/kardex" element={<KardexPage />} />
        <Route path="treasury/arqueos" element={<CashCountsPage />} />
        <Route path="treasury/cajas" element={<CashboxesPage />} />
        <Route path="attendance/events" element={<EventsPage />} />
        <Route path="attendance/devices" element={<DevicesPage />} />
        <Route path="attendance/daily" element={<DailyPage />} />
        <Route path="attendance/biometric" element={<LocalBiometricPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>
}
