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

  if (loading) return <div className="p-6 text-body-md text-ink-muted">Memuat…</div>
  if (!patient) return <div className="p-6 text-body-md text-ink-muted">Sesi tidak ditemukan.</div>

  const initials = (patient.name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="px-mobile-margin pt-6 pb-6 space-y-6">
      <h1 className="text-headline-lg text-ink">Profil Saya</h1>

      {/* Member card */}
      <div className="rounded-2xl bg-ink text-white p-5 shadow-modal">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full bg-surface/10 ring-2 ring-surface/20 flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
            <div>
              <p className="text-headline-sm text-white">{patient.name ?? "Pasien"}</p>
              <p className="font-mono text-code-mono text-white/50 mt-0.5">ID: {patient.id?.slice(0, 13).toUpperCase()}</p>
            </div>
          </div>
          <div className="size-9 rounded-lg bg-surface/10 flex items-center justify-center text-white/70">
            <span className="material-symbols-rounded text-[20px]">qr_code_2</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <p className="eyebrow text-white/40">Telepon</p>
            <p className="text-card-title text-white mt-0.5">{patient.phone || "—"}</p>
          </div>
          <span className="pill bg-surface/10 border border-border text-white/90">Member Aktif</span>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={save} className="space-y-3">
        <p className="eyebrow">Data Diri</p>
        <div className="card p-4 space-y-3">
          <div>
            <label className="block text-body-sm text-ink-muted mb-1">Nama lengkap</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-body-sm text-ink-muted mb-1">Nomor HP</label>
            <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-body-sm text-ink-muted mb-1">Tanggal lahir</label>
            <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          {error   && <p className="text-body-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-body-sm text-primary bg-primary-soft rounded-lg px-3 py-2">✓ Tersimpan</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </form>

      {conversations.length > 0 && (
        <div className="space-y-3">
          <p className="eyebrow">Riwayat Percakapan</p>
          <ul className="card divide-y divide-border-soft">
            {conversations.slice(0, 10).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-3 text-body-sm">
                <span className="text-ink">
                  {format(new Date(c.last_message_at), "d MMM yyyy HH:mm", { locale: idLocale })}
                  {c.category && <span className="ml-2 text-ink-dim">· {c.category}</span>}
                </span>
                <span className={c.status === "open" ? "pill-warning" : c.status === "resolved" ? "pill-sukses" : "pill-info"}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <p className="eyebrow">Privasi Data</p>
        <div className="card p-4 space-y-2">
          <button onClick={downloadData} className="btn-secondary w-full">
            <span className="material-symbols-rounded text-[18px]">download</span>
            Unduh salinan data saya
          </button>
          <button onClick={deleteAccount} className="text-body-sm text-danger hover:underline block w-full text-center pt-1">
            Hapus akun (permanen)
          </button>
        </div>
      </div>

      <button onClick={logout} className="btn-danger w-full">
        <span className="material-symbols-rounded text-[18px]">logout</span>
        Keluar
      </button>

      <p className="text-caption text-ink-dim text-center">
        Sehati CRM • klinik AI-powered
      </p>
    </div>
  )
}
