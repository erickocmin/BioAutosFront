import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { apiErrorMessage } from '../../api/errors'
import { PageHeader } from '../../components/ui/PageHeader'
import type { Paginated } from '../../types/api'

interface Branch { id: number; nombre: string }
interface Profile { id: number; nombre: string }
interface Device { id: number; serial_number: string; name: string; branch: number }
interface EnrollmentResult { employee_id: number; biometric_pin: string; device_command_id: number | null; next_step: string }

const initialPerson = {
  username: '', email: '', temporary_password: '', first_name: '', last_name: '', branch: '', employee_code: '',
  document_number: '', job_title: '', biometric_pin: '', device: '', profile: '',
}

export function RegisterEmployeePage() {
  const client = useQueryClient()
  const [personForm, setPersonForm] = useState(initialPerson)
  const [enrollment, setEnrollment] = useState<EnrollmentResult | null>(null)

  const branches = useQuery({ queryKey: ['branch-options'], queryFn: async () => (await api.get<Paginated<Branch>>('/core/sucursales/', { params: { page_size: 100 } })).data.results })
  const profiles = useQuery({ queryKey: ['profile-options'], queryFn: async () => (await api.get<Paginated<Profile>>('/accounts/perfiles/', { params: { page_size: 100 } })).data.results })
  const devices = useQuery({ queryKey: ['attendance-devices'], queryFn: async () => (await api.get<Paginated<Device>>('/attendance/devices/', { params: { page_size: 100 } })).data.results })

  const createEnrollment = useMutation({
    mutationFn: async () => (await api.post<EnrollmentResult>('/attendance/enrollments/', {
      ...personForm,
      branch: Number(personForm.branch),
      device: personForm.device ? Number(personForm.device) : null,
      profile: personForm.profile ? Number(personForm.profile) : null,
    })).data,
    onSuccess: async (data) => {
      setEnrollment(data)
      setPersonForm((current) => ({ ...initialPerson, branch: current.branch, device: current.device, profile: current.profile }))
      await Promise.all([
        client.invalidateQueries({ queryKey: ['employees'] }),
        client.invalidateQueries({ queryKey: ['users'] }),
      ])
    },
  })

  const submitPerson = (event: FormEvent) => { event.preventDefault(); setEnrollment(null); createEnrollment.mutate() }

  return <>
    <PageHeader eyebrow="Biometría local" title="Registrar empleado" description="Datos del usuario, cargo y PIN biométrico. La huella se enrola físicamente en el huellero usando el mismo PIN." />

    <section className="panel enrollment-panel">
      <div className="panel-heading">
        <div><h2>Datos del empleado</h2><p>El PIN debe ser el mismo en SISGETRAN y en el huellero.</p></div>
        <span className="badge badge--success">Sin guardar la plantilla de huella</span>
      </div>
      <form className="form-grid form-grid--four" onSubmit={submitPerson}>
        <label>Usuario<input required value={personForm.username} onChange={(e) => setPersonForm({ ...personForm, username: e.target.value })} /></label>
        <label>Correo<input required type="email" value={personForm.email} onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })} /></label>
        <label>Clave temporal<input required type="password" minLength={10} value={personForm.temporary_password} onChange={(e) => setPersonForm({ ...personForm, temporary_password: e.target.value })} /></label>
        <label>Perfil<select value={personForm.profile} onChange={(e) => setPersonForm({ ...personForm, profile: e.target.value })}><option value="">Sin perfil</option>{profiles.data?.map((profile) => <option key={profile.id} value={profile.id}>{profile.nombre}</option>)}</select></label>
        <label>Nombres<input required value={personForm.first_name} onChange={(e) => setPersonForm({ ...personForm, first_name: e.target.value })} /></label>
        <label>Apellidos<input required value={personForm.last_name} onChange={(e) => setPersonForm({ ...personForm, last_name: e.target.value })} /></label>
        <label>Documento<input required inputMode="numeric" minLength={8} maxLength={11} value={personForm.document_number} onChange={(e) => setPersonForm({ ...personForm, document_number: e.target.value.replace(/\D/g, '') })} /></label>
        <label>Código de empleado<input required value={personForm.employee_code} onChange={(e) => setPersonForm({ ...personForm, employee_code: e.target.value })} /></label>
        <label>Cargo<input value={personForm.job_title} onChange={(e) => setPersonForm({ ...personForm, job_title: e.target.value })} /></label>
        <label>PIN biométrico<input required inputMode="numeric" value={personForm.biometric_pin} onChange={(e) => setPersonForm({ ...personForm, biometric_pin: e.target.value.replace(/\D/g, '') })} /></label>
        <label>Sucursal<select required value={personForm.branch} onChange={(e) => setPersonForm({ ...personForm, branch: e.target.value, device: '' })}><option value="">Selecciona…</option>{branches.data?.map((branch) => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}</select></label>
        <label>Huellero<select value={personForm.device} onChange={(e) => setPersonForm({ ...personForm, device: e.target.value })}><option value="">Registrar sin sincronizar</option>{devices.data?.filter((device) => !personForm.branch || device.branch === Number(personForm.branch)).map((device) => <option key={device.id} value={device.id}>{device.name} · {device.serial_number}</option>)}</select></label>
        <div className="form-span form-actions"><button className="button button--primary" disabled={createEnrollment.isPending}>{createEnrollment.isPending ? 'Registrando…' : 'Registrar usuario'}</button></div>
      </form>
      {createEnrollment.isError && <p className="form-error">{apiErrorMessage(createEnrollment.error)}</p>}
      {enrollment && <div className="success-callout">
        <strong>Usuario registrado con PIN {enrollment.biometric_pin}</strong>
        <span>{enrollment.next_step}</span>
        {enrollment.device_command_id && <small>La orden de alta quedó en cola y se enviará cuando el huellero consulte al servidor.</small>}
        <small><Link to="/attendance/biometric">Ir al monitor de reconocimiento →</Link></small>
      </div>}
    </section>
  </>
}
