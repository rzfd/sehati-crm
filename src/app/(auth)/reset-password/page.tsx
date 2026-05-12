"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// Halaman ini dibuka via email link Supabase. Token sudah disetel via fragment URL
// oleh Supabase Auth callback handler — kita tinggal updateUser({ password }).
export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm]   = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError("Password minimal 8 karakter."); return }
    if (password !== confirm) { setError("Konfirmasi password tidak cocok."); return }
    setLoading(true); setError(null)
    try {
      const supabase = createClient()
      const { error: upErr } = await supabase.auth.updateUser({ password })
      if (upErr) {
        setError(upErr.message)
        return
      }
      setSuccess(true)
      setTimeout(() => router.replace("/login"), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card p-6 w-full max-w-md space-y-4">
        <div>
          <h1 className="text-lg font-medium text-gray-700">Reset password</h1>
          <p className="text-sm text-gray-500">Buat password baru.</p>
        </div>

        {success ? (
          <p className="text-sm text-teal-700 bg-teal-50 rounded-md px-3 py-2">
            ✓ Password berhasil di-update. Mengalihkan ke login…
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password baru</label>
              <input
                type="password" required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Konfirmasi password</label>
              <input
                type="password" required minLength={8}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="input"
              />
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 rounded-md px-2 py-1.5">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? "Menyimpan…" : "Simpan password baru"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
