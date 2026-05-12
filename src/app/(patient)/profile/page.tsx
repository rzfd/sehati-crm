"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useConversations } from "@/hooks/useConversations"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { toast } from "@/lib/toast"

export default function PatientProfilePage() {
  const router = useRouter()
  const { loading, patient } = useCurrentUser()
  const { conversations } = useConversations(patient?.id ?? null)

  const [name, setName]   = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob]     = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!patient) return
    /* eslint-disable react-hooks/set-state-in-effect */
    setName(patient.name ?? "")
    setPhone(patient.phone ?? "")
    setDob(patient.date_of_birth ?? "")
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [patient])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      const res = await fetch("/api/patient/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, date_of_birth: dob || null }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal simpan.")
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    await fetch("/api/auth/signout", { method: "POST" })
    router.replace("/login")
  }

  async function downloadData() {
    const res = await fetch("/api/patient/export-data")
    if (!res.ok) { toast.error("Gagal export data."); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sehati-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function deleteAccount() {
    if (!confirm("Yakin hapus akun? Ini permanen. Data profil Anda akan dianonimkan, tapi history kunjungan untuk dokumentasi medis tetap disimpan klinik.")) return
    if (!confirm("Sekali lagi — Anda yakin? Aksi ini tidak bisa dibatalkan.")) return
    const res = await fetch("/api/patient/delete-account", { method: "POST" })
    if (!res.ok) { toast.error("Gagal hapus akun."); return }
    toast.success("Akun dihapus.")
    router.replace("/login")
  }

  if (loading) return <div className="p-6 text-sm text-gray-500">Memuat…</div>
  if (!patient) return <div className="p-6 text-sm text-gray-500">Sesi tidak ditemukan.</div>

  return (
    <div className="p-4 pt-6 space-y-5">
      <h1 className="text-xl font-medium text-gray-700">Profil</h1>

      <form onSubmit={save} className="card p-4 space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nama lengkap</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nomor HP</label>
          <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tanggal lahir</label>
          <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        {error   && <p className="text-xs text-red-500 bg-red-50 rounded-md px-2 py-1.5">{error}</p>}
        {success && <p className="text-xs text-teal-600 bg-teal-50 rounded-md px-2 py-1.5">✓ Tersimpan</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </form>

      {conversations.length > 0 && (
        <div className="card p-4 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Riwayat percakapan</p>
          <ul className="space-y-1">
            {conversations.slice(0, 10).map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">
                  {format(new Date(c.last_message_at), "d MMM yyyy HH:mm", { locale: idLocale })}
                  {c.category && <span className="ml-2 text-gray-400">· {c.category}</span>}
                </span>
                <span className={`pill ${c.status === "open" ? "pill-amber" : c.status === "resolved" ? "pill-teal" : "pill-gray"}`}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-4 space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Privasi data</p>
        <button onClick={downloadData} className="btn-secondary w-full justify-center text-xs">
          Unduh salinan data saya
        </button>
        <button onClick={deleteAccount} className="text-xs text-red-500 hover:text-red-700 underline block w-full text-center">
          Hapus akun (permanen)
        </button>
      </div>

      <div className="card p-4 space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Akun</p>
        <button onClick={logout} className="btn-danger w-full justify-center">
          Keluar
        </button>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Sehati CRM • klinik AI-powered
      </p>
    </div>
  )
}
