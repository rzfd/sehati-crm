import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(req: Request) {
  try {
    const { name, phone, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get default clinic
    const { data: clinic, error: clinicErr } = await supabase
      .from("clinics")
      .select("id")
      .limit(1)
      .single()
    if (clinicErr || !clinic) {
      console.error("[register] clinic lookup failed:", clinicErr)
      return NextResponse.json(
        { error: "Klinik tidak ditemukan. Hubungi administrator." },
        { status: 500 }
      )
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
      clinic_id: clinic.id,
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
