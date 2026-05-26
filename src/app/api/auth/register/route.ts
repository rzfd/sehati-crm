import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(req: Request) {
  try {
    const { name, phone, email, password, clinic: clinicSlug } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Klinik tujuan: dari slug (link registrasi per klinik) atau fallback single-clinic
    // (dev) bila hanya ada satu klinik.
    let clinicId: string | null = null
    if (clinicSlug) {
      const { data: c } = await supabase.from("clinics").select("id").eq("slug", clinicSlug).maybeSingle()
      if (!c) return NextResponse.json({ error: "Klinik tidak ditemukan." }, { status: 404 })
      clinicId = c.id
    } else {
      const { data: list } = await supabase.from("clinics").select("id").limit(2)
      if (list && list.length === 1) clinicId = list[0].id
      else return NextResponse.json({ error: "Pilih klinik untuk mendaftar." }, { status: 400 })
    }

    // Create auth user (email_confirm: true skips email verification)
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authErr) {
      if (authErr.message.toLowerCase().includes("already")) {
        return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 })
      }
      console.error("[register] auth.admin.createUser:", authErr)
      return NextResponse.json({ error: "Gagal membuat akun." }, { status: 500 })
    }

    // Create patient record
    const { error: patientErr } = await supabase.from("patients").insert({
      user_id:   authData.user.id,
      clinic_id: clinicId!,
      name,
      phone:     phone || null,
    })
    if (patientErr) {
      // Roll back auth user so the email can be reused
      await supabase.auth.admin.deleteUser(authData.user.id)
      console.error("[register] patient insert:", patientErr)
      return NextResponse.json({ error: "Gagal menyimpan data pasien." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/auth/register]", err)
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi." }, { status: 500 })
  }
}
