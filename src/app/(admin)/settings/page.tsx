"use client"

import { useEffect, useState } from "react"

interface Clinic {
  id:       string
  name:     string
  address:  string | null
  phone:    string | null
  logo_url: string | null
}

export default function ClinicSettingsPage() {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName]       = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone]     = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/clinic")
      if (cancelled) return
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal memuat.")
      } else {
        const c = (await res.json()) as Clinic
        setClinic(c)
        setName(c.name)
        setAddress(c.address ?? "")
        setPhone(c.phone ?? "")
        setLogoUrl(c.logo_url ?? "")
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/clinic", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, address, phone, logo_url: logoUrl }),
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

  if (loading) return <div className="p-6 text-sm text-ink-muted">Memuat…</div>

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-medium text-ink">Pengaturan Klinik</h1>
        <p className="text-sm text-ink-muted">Edit informasi klinik yang ditampilkan ke pasien.</p>
      </div>

      {!clinic ? (
        <p className="text-sm text-danger">{error ?? "Klinik tidak ditemukan."}</p>
      ) : (
        <form onSubmit={save} className="card p-5 space-y-3">
          <div>
            <label className="block text-xs text-ink-muted mb-1">Nama klinik</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">Alamat</label>
            <textarea className="input resize-none" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">Telepon</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">Logo URL</label>
            <input className="input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </div>
          {error   && <p className="text-xs text-danger bg-danger-soft rounded-md px-2 py-1.5">{error}</p>}
          {success && <p className="text-xs text-primary bg-primary-soft rounded-md px-2 py-1.5">✓ Tersimpan</p>}
          <button type="submit" disabled={saving} className="btn-purple w-full justify-center">
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </form>
      )}
    </div>
  )
}
