import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PATCH /api/patient/profile — update current user's patient record.
// Pakai anon client (RLS policy "patient update own record" sudah memastikan
// hanya record milik user.id yang bisa diupdate).
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, phone, date_of_birth, complete_onboarding } = body

    const update: Record<string, unknown> = {}
    if (typeof name === "string" && name.trim()) update.name = name.trim()
    if (typeof phone === "string")               update.phone = phone.trim() || null
    if (typeof date_of_birth === "string")       update.date_of_birth = date_of_birth || null
    if (complete_onboarding === true)            update.is_new = false

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("patients")
      .update(update)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[api/patient/profile]", error)
      return NextResponse.json({ error: "Gagal menyimpan profil." }, { status: 500 })
    }

    return NextResponse.json({ patient: data })
  } catch (err) {
    console.error("[api/patient/profile]", err)
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 })
  }
}
