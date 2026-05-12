"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export default function OnboardingPage() {
  const router = useRouter()
  const { loading, patient } = useCurrentUser()

  const [name, setName]   = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob]     = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prefill dari record patient saat available — sync external (DB-loaded) state
  // ke form controlled inputs. Effect-based init dibutuhkan karena patient async-load.
  useEffect(() => {
    if (!patient) return
    /* eslint-disable react-hooks/set-state-in-effect */
    setName(patient.name ?? "")
    setPhone(patient.phone ?? "")
    setDob(patient.date_of_birth ?? "")
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [patient])

  // Kalau sudah selesai onboarding redirect ke home
  useEffect(() => {
    if (!loading && patient && !patient.is_new) router.replace("/home")
  }, [loading, patient, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError("Nama wajib diisi."); return }
    if (!phone.trim()) { setError("Nomor HP wajib diisi."); return }

    setSaving(true)
    try {
      const res = await fetch("/api/patient/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone,
          date_of_birth: dob || undefined,
          complete_onboarding: true,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Gagal menyimpan.")
        return
      }
      router.replace("/home")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">Memuat profil…</div>
    )
  }

  if (!patient) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Sesi tidak ditemukan. <a href="/login" className="text-teal-600 underline">Login</a>
      </div>
    )
  }

  return (
    <div className="p-6 pt-10">
      <h1 className="text-xl font-medium text-gray-700 mb-1">Selamat datang!</h1>
      <p className="text-sm text-gray-500 mb-6">Lengkapi data Anda agar kami bisa melayani lebih baik.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nama lengkap</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nomor HP</label>
          <input
            className="input" type="tel"
            placeholder="08xxxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tanggal lahir <span className="text-gray-400">(opsional)</span></label>
          <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>
        )}

        <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>
          {saving ? "Menyimpan…" : "Lanjut"}
        </button>
      </form>
    </div>
  )
}
