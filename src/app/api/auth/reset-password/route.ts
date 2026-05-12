import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/auth/reset-password
// Body: { email } → kirim Supabase password reset email
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = (body.email ?? "").trim()
  if (!email) return NextResponse.json({ error: "Email wajib." }, { status: 400 })

  const supabase = await createClient()
  const origin = req.headers.get("origin") ?? "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  // Tidak expose apakah email terdaftar (avoid enumeration)
  if (error) console.error("[reset-password]", error)
  return NextResponse.json({ ok: true, message: "Jika email terdaftar, link reset sudah dikirim." })
}
