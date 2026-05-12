import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/booking/doctors — list dokter aktif untuk current patient's clinic.
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: patient } = await supabase
      .from("patients").select("clinic_id").eq("user_id", user.id).maybeSingle()
    if (!patient) return NextResponse.json({ error: "Profil tidak ditemukan." }, { status: 400 })

    const { data, error } = await supabase
      .from("doctors")
      .select("id, name, specialty, title, bio, avatar_url")
      .eq("clinic_id", patient.clinic_id)
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("[api/booking/doctors]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
