import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit"

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

// POST /api/clinic/signup — pendaftaran klinik baru (publik, rate-limited).
// Body: { clinic_name, name, email, password }
// Buat clinic + owner auth user + staff_member(role=admin), rollback bila gagal.
export async function POST(req: Request) {
  try {
    const rl = await checkRateLimit(rateLimitKey(req, null, "clinic-signup"), { capacity: 5, refillRate: 5 / 3600 })
    if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 })

    const { clinic_name, name, email, password } = await req.json()
    if (!clinic_name?.trim() || !name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 })
    }

    const service = createServiceClient()

    // Slug unik dari nama klinik.
    const base = slugify(clinic_name) || "klinik"
    let slug = base
    for (let i = 2; i <= 50; i++) {
      const { data: existing } = await service.from("clinics").select("id").eq("slug", slug).maybeSingle()
      if (!existing) break
      slug = `${base}-${i}`
    }

    const { data: clinic, error: cErr } = await service
      .from("clinics").insert({ name: clinic_name.trim(), slug }).select("id, slug").single()
    if (cErr || !clinic) {
      console.error("[clinic/signup] clinic insert:", cErr)
      return NextResponse.json({ error: "Gagal membuat klinik." }, { status: 500 })
    }

    const { data: authData, error: aErr } = await service.auth.admin.createUser({ email, password, email_confirm: true })
    if (aErr || !authData?.user) {
      await service.from("clinics").delete().eq("id", clinic.id) // rollback
      if (aErr?.message.toLowerCase().includes("already")) {
        return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 })
      }
      return NextResponse.json({ error: "Gagal membuat akun." }, { status: 500 })
    }

    const { error: sErr } = await service.from("staff_members").insert({
      user_id:   authData.user.id,
      clinic_id: clinic.id,
      name:      name.trim(),
      role:      "admin",
    })
    if (sErr) {
      await service.auth.admin.deleteUser(authData.user.id) // rollback
      await service.from("clinics").delete().eq("id", clinic.id)
      console.error("[clinic/signup] staff insert:", sErr)
      return NextResponse.json({ error: "Gagal menyiapkan klinik." }, { status: 500 })
    }

    return NextResponse.json({ ok: true, slug: clinic.slug })
  } catch (err) {
    console.error("[api/clinic/signup]", err)
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi." }, { status: 500 })
  }
}
