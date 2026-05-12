import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/whoami — debug helper. Tampilkan auth user + linked patient/staff.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ user: null, patient: null, staff: null })
  }

  const [pRes, sRes] = await Promise.all([
    supabase.from("patients").select("id, name, clinic_id, is_new").eq("user_id", user.id).maybeSingle(),
    supabase.from("staff_members").select("id, name, role, clinic_id, is_active").eq("user_id", user.id).maybeSingle(),
  ])

  return NextResponse.json({
    user: {
      id:    user.id,
      email: user.email,
    },
    patient: pRes.data ?? null,
    staff:   sRes.data ?? null,
    errors: {
      patient: pRes.error?.message ?? null,
      staff:   sRes.error?.message ?? null,
    },
  })
}
