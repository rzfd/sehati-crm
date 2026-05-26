"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/shared/Logo"

export default function RegisterClinicPage() {
  const router = useRouter()
  const [form, setForm] = useState({ clinic_name: "", name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.")
      return
    }
    setLoading(true)

    const res = await fetch("/api/clinic/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const result = await res.json()
    if (!res.ok) {
      setError(result.error ?? "Gagal mendaftarkan klinik.")
      setLoading(false)
      return
    }

    // Auto sign-in sebagai admin klinik baru
    const supabase = createClient()
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    })
    if (signInErr) { router.push("/login"); return }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size={40} withText variant="sage" className="mb-3" />
          <h1 className="text-headline-md text-ink">Daftarkan klinik Anda</h1>
          <p className="text-body-md text-ink-muted mt-1">Buat akun admin & mulai kelola klinik di Sehati</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-soft border border-danger px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="clinic_name" required>Nama klinik</Label>
            <Input id="clinic_name" value={form.clinic_name} onChange={(e) => update("clinic_name", e.target.value)} placeholder="Klinik Sehat Sentosa" required />
          </div>
          <div>
            <Label htmlFor="name" required>Nama Anda (admin)</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="dr. Budi" required />
          </div>
          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="admin@klinik.com" required />
          </div>
          <div>
            <Label htmlFor="password" required>Password</Label>
            <Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Minimal 8 karakter" required minLength={8} />
          </div>

          <Button type="submit" className="w-full justify-center" loading={loading}>
            Daftarkan klinik
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          Pasien?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">Daftar sebagai pasien</Link>
        </p>
        <p className="text-center text-sm text-ink-muted mt-2">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
