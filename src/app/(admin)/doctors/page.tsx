"use client"

import { useEffect, useState } from "react"
import { ScheduleEditor } from "@/components/admin/ScheduleEditor"
import { formatDoctorName } from "@/lib/format"

interface Doctor {
  id:         string
  name:       string
  specialty:  string
  title:      string
  bio:        string | null
  avatar_url: string | null
  is_active:  boolean
}

const SPECIALTIES = [
  "Umum","Penyakit Dalam","Anak","Obgyn","Bedah","Mata","THT","Kulit & Kelamin","Saraf","Jantung & Pembuluh Darah",
]

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [scheduleFor, setScheduleFor] = useState<Doctor | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")

  // form state
  const [name, setName]           = useState("")
  const [title, setTitle]         = useState("dr.")
  const [specialty, setSpecialty] = useState("Umum")
  const [bio, setBio]             = useState("")
  const [saving, setSaving]       = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/doctors")
      if (res.ok) {
        setDoctors(await res.json())
      } else {
        const data = await res.json().catch(() => ({}))
        setError(`[${res.status}] ${data.error ?? "Gagal memuat."}`)
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
    setName(""); setTitle("dr."); setSpecialty("Umum"); setBio("")
    setEditId(null); setShowForm(false)
  }

  function openEdit(d: Doctor) {
    setEditId(d.id)
    setName(d.name); setTitle(d.title); setSpecialty(d.specialty); setBio(d.bio ?? "")
    setShowForm(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("Nama wajib."); return }
    setSaving(true); setError(null)
    try {
      const url = editId ? `/api/doctors/${editId}` : "/api/doctors"
      const method = editId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, specialty, bio }),
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

  async function toggleActive(d: Doctor) {
    await fetch(`/api/doctors/${d.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !d.is_active }),
    })
    load()
  }

  const active = doctors.filter((d) => d.is_active)
  const inactive = doctors.filter((d) => !d.is_active)
  const shown = filter === "active" ? active : filter === "inactive" ? inactive : doctors

  const TABS = [
    { key: "all" as const,      label: "Semua",   count: doctors.length },
    { key: "active" as const,   label: "Aktif",   count: active.length },
    { key: "inactive" as const, label: "Off duty", count: inactive.length },
  ]

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-headline-md text-ink">Manajemen Dokter</h1>
          <p className="text-body-md text-ink-muted">Kelola jadwal dan pantau ketersediaan tim medis.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
          <span className="material-symbols-rounded text-[18px]">add</span> Tambah Dokter
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 rounded-full bg-surface-alt p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3.5 py-1.5 rounded-full text-body-sm font-medium transition-colors ${
              filter === t.key ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink"
            }`}
          >
            {t.label} <span className="text-ink-dim">({t.count})</span>
          </button>
        ))}
      </div>

      {error && <p className="text-body-sm text-danger mb-3 bg-danger-soft rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <p className="text-body-md text-ink-dim">Memuat…</p>
      ) : shown.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-body-md text-ink-muted">Belum ada dokter. Tambah dokter pertama untuk mulai menerima booking.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {shown.map((d) => (
            <DoctorCard
              key={d.id} doctor={d}
              onEdit={openEdit}
              onToggle={toggleActive}
              onSchedule={() => setScheduleFor(d)}
            />
          ))}

          {/* AI Doctor Routing — premium feature card */}
          <div className="rounded-xl bg-primary-soft border border-primary-dim p-4 flex flex-col">
            <span className="eyebrow text-primary">Fitur Premium</span>
            <p className="text-headline-sm text-ink mt-1 flex items-center gap-1.5">
              <span className="material-symbols-rounded filled text-primary text-[20px]">hub</span>
              AI Doctor Routing
            </p>
            <p className="text-body-sm text-ink-muted mt-1">
              Optimalkan antrean pasien otomatis berdasarkan spesialisasi dan beban kerja dokter secara real-time.
            </p>
            <ul className="mt-3 space-y-1.5 text-body-sm text-ink">
              <li className="flex items-center gap-2"><span className="material-symbols-rounded text-[16px] text-primary">check_circle</span> Routing pasien otomatis</li>
              <li className="flex items-center gap-2"><span className="material-symbols-rounded text-[16px] text-primary">check_circle</span> Prediksi waktu tunggu</li>
            </ul>
            <button className="btn-sage mt-4 self-start" disabled>
              <span className="material-symbols-rounded text-[18px]">settings</span> Konfigurasi AI
            </button>
          </div>
        </div>
      )}

      {scheduleFor && (
        <ScheduleEditor
          doctorId={scheduleFor.id}
          doctorName={formatDoctorName(scheduleFor)}
          onClose={() => setScheduleFor(null)}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 modal-backdrop z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-surface rounded-xl p-5 modal-content shadow-modal w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-headline-sm text-ink">{editId ? "Edit dokter" : "Tambah dokter"}</h2>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Gelar</label>
                  <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="dr." />
                </div>
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Nama lengkap</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">Spesialisasi</label>
                <select className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">Bio <span className="text-ink-dim">(opsional)</span></label>
                <textarea className="input resize-none" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? "..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function DoctorCard({
  doctor, onEdit, onToggle, onSchedule,
}: {
  doctor: Doctor
  onEdit: (d: Doctor) => void
  onToggle: (d: Doctor) => void
  onSchedule: () => void
}) {
  const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum"]
  return (
    <div className="card p-4">
      <div className="flex gap-3 items-start">
        <div className="relative shrink-0">
          <div className="size-12 rounded-full bg-info-soft text-tertiary flex items-center justify-center text-sm font-semibold overflow-hidden">
            {doctor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doctor.avatar_url} alt={doctor.name} className="size-full object-cover" />
            ) : (
              doctor.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
            )}
          </div>
          {doctor.is_active && (
            <span className="absolute bottom-0 right-0 size-3 bg-primary border-2 border-surface rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-card-title text-ink truncate">{formatDoctorName(doctor)}</p>
            <span className={doctor.is_active ? "pill-sukses shrink-0" : "pill-gray shrink-0"}>
              {doctor.is_active ? "Online" : "Off duty"}
            </span>
          </div>
          <p className="text-body-sm text-ink-muted">{doctor.specialty}</p>
          {doctor.bio && <p className="text-body-sm text-ink-dim mt-1 line-clamp-2">{doctor.bio}</p>}
        </div>
      </div>

      {/* Jadwal mingguan mini */}
      <div className="mt-3">
        <p className="eyebrow mb-1.5">Jadwal Praktik</p>
        <div className="flex gap-1">
          {DAYS.map((d) => (
            <span key={d} className="flex-1 text-center text-body-sm py-1 rounded-md bg-primary-soft text-primary">{d}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-border-soft">
        <button onClick={() => onEdit(doctor)} className="btn-secondary flex-1 py-2">
          <span className="material-symbols-rounded text-[16px]">edit</span> Edit
        </button>
        <button onClick={onSchedule} className="btn-primary flex-1 py-2">
          <span className="material-symbols-rounded text-[16px]">calendar_month</span> Jadwal
        </button>
        <button
          onClick={() => onToggle(doctor)}
          title={doctor.is_active ? "Nonaktifkan" : "Aktifkan"}
          className="btn-secondary px-3 py-2"
        >
          <span className="material-symbols-rounded text-[16px]">{doctor.is_active ? "toggle_on" : "toggle_off"}</span>
        </button>
      </div>
    </div>
  )
}
