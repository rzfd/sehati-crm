import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

// POST /api/patient/delete-account — soft delete patient + revoke auth.
// Tidak hard delete agar audit/booking history tetap intact untuk klinik (kewajiban dokumentasi medis).
// Patient bisa request hard-delete via admin (out of scope sekarang).
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

  const { data: patient } = await supabase
    .from("patients").select("id").eq("user_id", user.id).maybeSingle()
  if (!patient) return NextResponse.json({ error: "Profil tidak ditemukan." }, { status: 404 })

  // Anonymize patient + unlink dari auth user
  const service = createServiceClient()
  const anonName = `Pasien terhapus #${patient.id.slice(0, 6)}`
  await service
    .from("patients")
    .update({
      name:           anonName,
      phone:          null,
      date_of_birth:  null,
      user_id:        null,
      deleted_at:     new Date().toISOString(),
    })
    .eq("id", patient.id)

  // Delete auth user (Supabase admin API)
  await service.auth.admin.deleteUser(user.id)

  return NextResponse.json({ ok: true })
}
