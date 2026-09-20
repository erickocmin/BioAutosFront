import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api/client'
import { apiErrorMessage } from '../../api/errors'
import { PermissionGate } from '../../auth/PermissionGate'
import { CrudResource } from '../../components/tables/CrudResource'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Paginated } from '../../types/api'

interface Option { id: number; nombre?: string; razon_social?: string; empresa?: number }
interface Role { profile: string; company: string; branch: string; is_active: boolean }
const emptyRole = (): Role => ({ profile: '', company: '', branch: '', is_active: true })

export function UsersPage() {
  const client = useQueryClient()
  const [resetId, setResetId] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [roleUser, setRoleUser] = useState<number | null>(null)
  const [roles, setRoles] = useState<Role[]>([emptyRole()])
  const profiles = useQuery({ queryKey: ['profile-options'], queryFn: async () => (await api.get<Paginated<Option>>('/accounts/perfiles/', { params: { page_size: 100 } })).data.results })
  const companies = useQuery({ queryKey: ['company-options'], queryFn: async () => (await api.get<Paginated<Option>>('/core/empresas/', { params: { page_size: 100 } })).data.results })
  const branches = useQuery({ queryKey: ['branch-options'], queryFn: async () => (await api.get<Paginated<Option>>('/core/sucursales/', { params: { page_size: 100 } })).data.results })
  const reset = useMutation({ mutationFn: () => api.post(`/accounts/usuarios/${resetId}/restablecer-clave/`, { password }), onSuccess: () => { setResetId(null); setPassword('') } })
  const saveRoles = useMutation({ mutationFn: () => api.put(`/accounts/usuarios/${roleUser}/roles/`, { roles: roles.map((role) => ({ profile: Number(role.profile), company: Number(role.company), branch: role.branch ? Number(role.branch) : null, is_active: role.is_active })) }), onSuccess: async () => { setRoleUser(null); await client.invalidateQueries({ queryKey: ['users'] }) } })
  const updateRole = (index: number, field: keyof Role, value: string | boolean) => setRoles((current) => current.map((role, roleIndex) => roleIndex === index ? { ...role, [field]: value } : role))
  return <><PageHeader eyebrow="Seguridad" title="Usuarios" description="Cuentas de acceso. Las claves nunca se muestran ni se recuperan." />
    <section className="panel table-panel"><CrudResource endpoint="/accounts/usuarios/" queryKey="users" permission="accounts.usuarios" initial={{ username: '', email: '', first_name: '', last_name: '', password: '', is_active: true }} fields={[
      { name: 'username', label: 'Usuario', required: true }, { name: 'email', label: 'Correo', type: 'email', required: true }, { name: 'first_name', label: 'Nombres' }, { name: 'last_name', label: 'Apellidos' }, { name: 'password', label: 'Clave temporal', type: 'password', required: true, hideOnEdit: true }, { name: 'is_active', label: 'Activo', type: 'checkbox' },
    ]} columns={[{ key: 'username', label: 'Usuario' }, { key: 'first_name', label: 'Nombres' }, { key: 'last_name', label: 'Apellidos' }, { key: 'email', label: 'Correo' }, { key: 'is_active', label: 'Estado', render: (row) => <StatusBadge active={Boolean(row.is_active)} /> }]} extraActions={(row) => <><PermissionGate permission="accounts.usuarios.update"><button className="link-button" onClick={() => setResetId(Number(row.id))}>Restablecer clave</button></PermissionGate><PermissionGate permission="accounts.usuarios.approve"><button className="link-button" onClick={() => { setRoleUser(Number(row.id)); const existing = row.roles as Array<{ profile: number; company: number; branch: number | null; is_active: boolean }> | undefined; setRoles(existing?.length ? existing.map((role) => ({ profile: String(role.profile), company: String(role.company), branch: role.branch ? String(role.branch) : '', is_active: role.is_active })) : [emptyRole()]) }}>Roles</button></PermissionGate></>} /></section>
    <Modal open={resetId !== null} title="Restablecer clave" onClose={() => setResetId(null)}><form onSubmit={(event) => { event.preventDefault(); reset.mutate() }}><label className="standalone-field">Nueva clave temporal<input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></label>{reset.isError && <p className="form-error">{apiErrorMessage(reset.error)}</p>}<div className="form-actions"><button type="button" className="button button--ghost" onClick={() => setResetId(null)}>Cancelar</button><button className="button button--primary" disabled={reset.isPending}>Restablecer</button></div></form></Modal>
    <Modal open={roleUser !== null} title="Asignar perfiles" onClose={() => setRoleUser(null)}><form onSubmit={(event) => { event.preventDefault(); saveRoles.mutate() }}>{roles.map((role, index) => <div className="role-row" key={index}><label>Perfil<select required value={role.profile} onChange={(event) => updateRole(index, 'profile', event.target.value)}><option value="">Selecciona…</option>{profiles.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label><label>Empresa<select required value={role.company} onChange={(event) => updateRole(index, 'company', event.target.value)}><option value="">Selecciona…</option>{companies.data?.map((item) => <option key={item.id} value={item.id}>{item.razon_social}</option>)}</select></label><label>Sucursal<select value={role.branch} onChange={(event) => updateRole(index, 'branch', event.target.value)}><option value="">Todas</option>{branches.data?.filter((item) => !role.company || item.empresa === Number(role.company)).map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>{roles.length > 1 && <button type="button" className="link-button" onClick={() => setRoles(roles.filter((_, roleIndex) => roleIndex !== index))}>Quitar</button>}</div>)}<button type="button" className="button button--ghost" onClick={() => setRoles([...roles, emptyRole()])}>Agregar perfil</button>{saveRoles.isError && <p className="form-error">{apiErrorMessage(saveRoles.error)}</p>}<div className="form-actions"><button type="button" className="button button--ghost" onClick={() => setRoleUser(null)}>Cancelar</button><button className="button button--primary" disabled={saveRoles.isPending}>Guardar perfiles</button></div></form></Modal>
  </>
}
