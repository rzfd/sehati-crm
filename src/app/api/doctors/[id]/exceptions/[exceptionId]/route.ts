import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams { params: Promise<{ id: string; exceptionId: string }> }

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id, exceptionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })
  const { data: staff } = await supabase
    .from("staff_members").select("clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (!staff || (staff.role !== "admin" && staff.role !== "manager")) {
    return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
  }
  const { error } = await supabase
    .from("doctor_schedule_exceptions")
    .delete()
    .eq("id", exceptionId)
    .eq("doctor_id", id)
    .eq("clinic_id", staff.clinic_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
