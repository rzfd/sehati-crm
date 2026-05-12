"use client"

import { useEffect, useState } from "react"

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

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-medium text-gray-700">Dokter</h1>
          <p className="text-sm text-gray-500">Kelola data dokter klinik.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-purple">+ Tambah dokter</button>
      </div>

      {error && <p className="text-xs text-red-500 mb-3 bg-red-50 rounded-md px-3 py-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Memuat…</p>
      ) : (
        <>
          {active.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-gray-500">Belum ada dokter. Tambah dokter pertama untuk mulai menerima booking.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {active.map((d) => (
                <DoctorCard key={d.id} doctor={d} onEdit={openEdit} onToggle={toggleActive} />
              ))}
            </div>
          )}

          {inactive.length > 0 && (
            <details className="mt-6">
              <summary className="cursor-pointer text-xs text-gray-400 mb-2 hover:text-gray-600">
                {inactive.length} dokter tidak aktif
              </summary>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {inactive.map((d) => (
                  <DoctorCard key={d.id} doctor={d} onEdit={openEdit} onToggle={toggleActive} />
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white rounded-xl p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-medium text-gray-700">{editId ? "Edit dokter" : "Tambah dokter"}</h2>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Gelar</label>
                  <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="dr." />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nama lengkap</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Spesialisasi</label>
                <select className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bio <span className="text-gray-400">(opsional)</span></label>
                <textarea className="input resize-none" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1 justify-center">Batal</button>
                <button type="submit" disabled={saving} className="btn-purple flex-1 justify-center">
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
  doctor, onEdit, onToggle,
}: { doctor: Doctor; onEdit: (d: Doctor) => void; onToggle: (d: Doctor) => void }) {
  return (
    <div className="card p-4 flex gap-3 items-start">
      <div className="size-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-sm font-medium">
        {doctor.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">{doctor.title} {doctor.name}</p>
        <p className="text-xs text-gray-500">{doctor.specialty}</p>
        {doctor.bio && <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{doctor.bio}</p>}
        <div className="flex gap-1.5 mt-2">
          <button onClick={() => onEdit(doctor)} className="text-[11px] text-purple-500 hover:text-purple-700">Edit</button>
          <span className="text-gray-300">·</span>
          <button onClick={() => onToggle(doctor)} className="text-[11px] text-gray-400 hover:text-gray-700">
            {doctor.is_active ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>
      </div>
      {!doctor.is_active && <span className="pill pill-gray flex-shrink-0">Nonaktif</span>}
    </div>
  )
}
