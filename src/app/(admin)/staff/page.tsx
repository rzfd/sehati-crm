"use client"

import { useEffect, useState } from "react"
import { toast } from "@/lib/toast"

interface StaffMember {
  id:                string
  name:              string
  role:              string
  user_id:           string | null
  linked_doctor_id:  string | null
  is_active:         boolean
  linked_doctor:     { id: string; name: string; specialty: string } | null
}

interface DoctorLite { id: string; name: string; specialty: string; is_active: boolean }

const ROLES = [
  { value: "admin",            label: "Admin",            pill: "pill-purple" },
  { value: "manager",          label: "Manager",          pill: "pill-amber" },
  { value: "receptionist",     label: "Resepsionis",      pill: "pill-blue" },
  { value: "cs",               label: "Customer Service", pill: "pill-blue" },
  { value: "doctor_assistant", label: "Asisten Dokter",   pill: "pill-pink" },
  { value: "marketing",        label: "Marketing",        pill: "pill-teal" },
]

export default function AdminStaffPage() {
  const [staff, setStaff]     = useState<StaffMember[]>([])
  const [doctors, setDoctors] = useState<DoctorLite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // form state (only for create — edit dilakukan inline)
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole]         = useState("receptionist")
  const [linkedDoctor, setLinkedDoctor] = useState("")
  const [saving, setSaving]     = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [sRes, dRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/doctors"),
      ])
      if (!sRes.ok) {
        const data = await sRes.json().catch(() => ({}))
        setError(`[staff ${sRes.status}] ${data.error ?? "Gagal memuat."}`)
      } else {
        const s = await sRes.json()
        setStaff(Array.isArray(s) ? s : [])
      }
      if (dRes.ok) {
        const d = await dRes.json()
        setDoctors((Array.isArray(d) ? d : []).filter((x: DoctorLite) => x.is_active))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { load() }, [])

  function resetForm() {
    setName(""); setEmail(""); setPassword(""); setRole("receptionist"); setLinkedDoctor("")
    setShowForm(false); setError(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      setError("Nama, email, dan password wajib.")
      return
    }
    if (role === "doctor_assistant" && !linkedDoctor) {
      setError("Asisten dokter harus dilink ke dokter.")
      return
    }
    setSaving(true); setError(null)
    try {
      const res = await fetch("/api/staff", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role,
          linked_doctor_id: role === "doctor_assistant" ? linkedDoctor : null,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal menyimpan.")
        return
      }
      resetForm()
      load()
    } finally {
      setSaving(false)
    }
  }

  async function changeRole(s: StaffMember, newRole: string) {
    if (newRole === "doctor_assistant" && !s.linked_doctor_id) {
      toast.error("Set link dokter dulu sebelum ubah role ke Asisten Dokter.")
      return
    }
    await fetch(`/api/staff/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    load()
  }

  async function changeLinkedDoctor(s: StaffMember, doctorId: string) {
    await fetch(`/api/staff/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linked_doctor_id: doctorId || null }),
    })
    load()
  }

  async function toggleActive(s: StaffMember) {
    await fetch(`/api/staff/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !s.is_active }),
    })
    load()
  }

  const active = staff.filter((s) => s.is_active)
  const inactive = staff.filter((s) => !s.is_active)

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-medium text-ink">Staff</h1>
          <p className="text-sm text-ink-muted">Kelola akun &amp; role tim klinik.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-purple">+ Tambah staff</button>
      </div>

      {error && !showForm && (
        <p className="text-xs text-danger mb-3 bg-danger-soft rounded-md px-3 py-2">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-ink-dim">Memuat…</p>
      ) : staff.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-ink-muted">Belum ada staff lain.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background text-xs text-ink-muted">
                <tr>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">Role</th>
                  <th className="text-left px-3 py-2">Dokter terlink</th>
                  <th className="text-right px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {active.map((s) => (
                  <tr key={s.id} className="hover:bg-background/50">
                    <td className="px-3 py-2 font-medium text-ink">{s.name}</td>
                    <td className="px-3 py-2">
                      <select
                        value={s.role}
                        onChange={(e) => changeRole(s, e.target.value)}
                        className="text-xs border border-border rounded-md px-2 py-1 bg-surface"
                      >
                        {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={s.linked_doctor_id ?? ""}
                        onChange={(e) => changeLinkedDoctor(s, e.target.value)}
                        disabled={s.role !== "doctor_assistant"}
                        className="text-xs border border-border rounded-md px-2 py-1 bg-surface disabled:bg-background disabled:text-ink-dim"
                      >
                        <option value="">— tidak ada —</option>
                        {doctors.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => toggleActive(s)} className="text-[11px] text-ink-dim hover:text-danger">
                        Nonaktifkan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {inactive.length > 0 && (
            <details className="mt-6">
              <summary className="cursor-pointer text-xs text-ink-dim mb-2 hover:text-ink">
                {inactive.length} staff tidak aktif
              </summary>
              <ul className="space-y-1 mt-2">
                {inactive.map((s) => (
                  <li key={s.id} className="card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ink-muted">{s.name}</p>
                      <p className="text-xs text-ink-dim">{roleLabel(s.role)}</p>
                    </div>
                    <button onClick={() => toggleActive(s)} className="text-[11px] text-primary hover:text-primary">Aktifkan</button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 modal-backdrop z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-surface dark:bg-surface-alt rounded-xl p-5 modal-content w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-medium text-ink">Tambah staff baru</h2>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-xs text-ink-muted mb-1">Nama lengkap</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">Password awal (min 8)</label>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">Role</label>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {role === "doctor_assistant" && (
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Dokter yang dibantu</label>
                  <select className="input" value={linkedDoctor} onChange={(e) => setLinkedDoctor(e.target.value)} required>
                    <option value="">Pilih dokter…</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
                  </select>
                </div>
              )}

              {error && <p className="text-xs text-danger bg-danger-soft rounded-md px-2 py-1.5">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1 justify-center">Batal</button>
                <button type="submit" disabled={saving} className="btn-purple flex-1 justify-center">
                  {saving ? "..." : "Buat akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function roleLabel(r: string) {
  return ROLES.find((x) => x.value === r)?.label ?? r
}
