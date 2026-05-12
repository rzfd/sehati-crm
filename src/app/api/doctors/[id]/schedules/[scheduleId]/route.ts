import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

interface RouteParams { params: Promise<{ id: string; scheduleId: string }> }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Belum login.", status: 401 }
  const { data: staff } = await supabase
    .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (!staff) return { error: "Bukan staff.", status: 403 }
  if (staff.role !== "admin" && staff.role !== "manager") {
    return { error: `Role '${staff.role}' tidak diizinkan.`, status: 403 }
  }
  return { supabase, staff }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id, scheduleId } = await params
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  // Verifikasi doctor di clinic staff
  const { data: doctor } = await guard.supabase
    .from("doctors").select("clinic_id").eq("id", id).maybeSingle()
  if (!doctor || doctor.clinic_id !== guard.staff.clinic_id) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
  }

  const { error } = await guard.supabase
    .from("doctor_schedules")
    .delete()
    .eq("id", scheduleId)
    .eq("doctor_id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(guard.supabase, {
    clinic_id:   guard.staff.clinic_id,
    actor_id:    guard.staff.id,
    action:      "schedule.delete",
    target_type: "doctor_schedule",
    target_id:   scheduleId,
  })

  return NextResponse.json({ ok: true })
}
