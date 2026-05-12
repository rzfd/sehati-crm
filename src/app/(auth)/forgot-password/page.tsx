"use client"

import { useState } from "react"
import Link from "next/link"

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
      <div className="card p-6 w-full max-w-md space-y-4">
        <div>
          <h1 className="text-lg font-medium text-gray-700">Lupa password</h1>
          <p className="text-sm text-gray-500">Kami akan kirim link reset password ke email Anda.</p>
        </div>

        {sent ? (
          <div className="space-y-3">
            <p className="text-sm text-teal-700 bg-teal-50 rounded-md px-3 py-2">
              ✓ Cek inbox email <strong>{email}</strong>. Klik link reset di email untuk lanjut.
            </p>
            <Link href="/login" className="btn-primary w-full justify-center">Kembali ke login</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="anda@email.com"
              />
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 rounded-md px-2 py-1.5">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? "Mengirim…" : "Kirim link reset"}
            </button>
            <Link href="/login" className="text-xs text-gray-500 hover:text-teal-600 block text-center">
              ← Kembali ke login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
