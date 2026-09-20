import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api/client'
import { apiErrorMessage } from '../../api/errors'
import { PermissionGate } from '../../auth/PermissionGate'
import { ErrorState, LoadingState } from '../../components/feedback/States'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Paginated } from '../../types/api'

const actions = ['view', 'create', 'update', 'delete', 'approve', 'cancel', 'close', 'export'] as const
type Action = typeof actions[number]
interface Profile { id: number; nombre: string }
interface Module { id: number; code: string; name: string }
interface Permission { module: number; [key: string]: boolean | number }

export function PermissionsPage() {
  const client = useQueryClient()
  const profiles = useQuery({ queryKey: ['profiles'], queryFn: async () => (await api.get<Paginated<Profile>>('/accounts/perfiles/', { params: { page_size: 100 } })).data.results })
  const modules = useQuery({ queryKey: ['modules'], queryFn: async () => (await api.get<Paginated<Module>>('/accounts/modulos/', { params: { page_size: 200 } })).data.results })
  const [profile, setProfile] = useState<number | ''>('')
  const permissions = useQuery({ enabled: Boolean(profile), queryKey: ['permission-matrix', profile], queryFn: async () => (await api.get<Paginated<Permission>>('/accounts/permisos/', { params: { profile, page_size: 500 } })).data.results })
  const [matrix, setMatrix] = useState<Record<number, Partial<Record<Action, boolean>>>>({})
  const storedValue = (module: number, action: Action) => Boolean(permissions.data?.find((item) => item.module === module)?.[`can_${action}`])
  const value = (module: number, action: Action) => matrix[module]?.[action] ?? storedValue(module, action)
  const save = useMutation({ mutationFn: () => api.put(`/accounts/perfiles/${profile}/matriz-permisos/`, { permissions: (modules.data ?? []).map((module) => ({ module: module.id, ...Object.fromEntries(actions.map((action) => [`can_${action}`, value(module.id, action)])) })) }), onSuccess: async () => { setMatrix({}); await client.invalidateQueries({ queryKey: ['permission-matrix', profile] }) } })
  const toggle = (module: number, action: Action) => setMatrix((current) => ({ ...current, [module]: { ...current[module], [action]: !value(module, action) } }))
  return <><PageHeader eyebrow="Seguridad" title="Matriz de permisos" description="Perfil → módulo → acciones. La API vuelve a validar cada operación." actions={<select aria-label="Perfil" value={profile} onChange={(event) => { setProfile(event.target.value ? Number(event.target.value) : ''); setMatrix({}) }}><option value="">Selecciona un perfil</option>{profiles.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>} />
    <section className="panel table-panel">{(profiles.isLoading || modules.isLoading || permissions.isLoading) && <LoadingState />}{(profiles.isError || modules.isError || permissions.isError) && <ErrorState />}{profile && modules.data && <><div className="table-wrap"><table><thead><tr><th>Módulo</th>{actions.map((action) => <th key={action}>{action}</th>)}</tr></thead><tbody>{modules.data.map((module) => <tr key={module.id}><td><strong>{module.name}</strong><br /><small className="muted">{module.code}</small></td>{actions.map((action) => <td key={action}><input aria-label={`${module.name}: ${action}`} type="checkbox" checked={value(module.id, action)} onChange={() => toggle(module.id, action)} /></td>)}</tr>)}</tbody></table></div><div className="matrix-actions"><PermissionGate permission="accounts.perfiles.approve"><button className="button button--primary" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Guardando…' : 'Guardar matriz'}</button></PermissionGate>{save.isError && <span className="form-error">{apiErrorMessage(save.error)}</span>}</div></>}</section>
  </>
}
