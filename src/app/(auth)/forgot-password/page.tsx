"use client"

import { useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/shared/Logo"

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("")
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError("Email wajib."); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal kirim.")
        return
      }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center flex flex-col items-center">
          <Logo size={40} withText variant="sage" className="mb-3" />
        </div>
        <div className="card p-6 space-y-4">
        <div>
          <h1 className="text-headline-sm text-ink">Lupa password</h1>
          <p className="text-sm text-ink-muted">Kami akan kirim link reset password ke email Anda.</p>
        </div>

        {sent ? (
          <div className="space-y-3">
            <p className="text-sm text-primary bg-primary-soft rounded-md px-3 py-2">
              ✓ Cek inbox email <strong>{email}</strong>. Klik link reset di email untuk lanjut.
            </p>
            <Link href="/login" className="btn-primary w-full justify-center">Kembali ke login</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs text-ink-muted mb-1">Email</label>
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="anda@email.com"
              />
            </div>
            {error && <p className="text-xs text-danger bg-danger-soft rounded-md px-2 py-1.5">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? "Mengirim…" : "Kirim link reset"}
            </button>
            <Link href="/login" className="text-xs text-ink-muted hover:text-primary block text-center">
              ← Kembali ke login
            </Link>
          </form>
        )}
        </div>
      </div>
    </div>
  )
}
