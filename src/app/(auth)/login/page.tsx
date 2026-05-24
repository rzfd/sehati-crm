"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/shared/Logo"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError("Email atau password salah. Silakan coba lagi.")
      setLoading(false)
      return
    }

    // Get user role to redirect accordingly
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from("staff_members")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
    const staffRole = (data as { role: string } | null)?.role

    if (staffRole) {
      if (staffRole === "admin") {
        router.push("/dashboard")
      } else if (staffRole === "manager") {
        router.push("/kb")
      } else {
        router.push("/inbox")
      }
    } else {
      router.push("/home")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size={40} withText variant="sage" className="mb-3" />
          <h1 className="text-headline-md text-ink">Selamat datang</h1>
          <p className="text-body-md text-ink-muted mt-1">Masuk untuk melanjutkan ke klinik Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-danger-soft border border-danger px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@klinik.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" required>Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full justify-center" loading={loading}>
            Masuk
          </Button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-3">
          <Link href="/forgot-password" className="hover:underline">Lupa password?</Link>
        </p>
        <p className="text-center text-sm text-ink-muted mt-2">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Daftar sebagai pasien
          </Link>
        </p>
      </div>
    </div>
  )
}
