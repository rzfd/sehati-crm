"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/shared/Logo"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" })
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

    // Registration is handled server-side (service role bypasses RLS)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     form.name,
        phone:    form.phone,
        email:    form.email,
        password: form.password,
      }),
    })
    const result = await res.json()

    if (!res.ok) {
      setError(result.error ?? "Gagal mendaftar. Coba lagi.")
      setLoading(false)
      return
    }

    // Sign in with the newly created credentials
    const supabase = createClient()
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    })

    if (signInErr) {
      // Account created — redirect to login so user can sign in manually
      router.push("/login")
      return
    }

    router.push("/home")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size={40} withText variant="sage" className="mb-3" />
          <h1 className="text-headline-md text-ink">Daftar akun pasien</h1>
          <p className="text-body-md text-ink-muted mt-1">Buat akun untuk mulai konsultasi</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-soft border border-danger px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name" required>Nama Lengkap</Label>
            <Input
              id="name"
              type="text"
              placeholder="Budi Santoso"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" required>Nomor HP</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="budi@email.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" required>Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full justify-center" loading={loading}>
            Daftar
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
