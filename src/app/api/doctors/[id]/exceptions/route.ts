import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

interface RouteParams { params: Promise<{ id: string }> }

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

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { data, error } = await guard.supabase
    .from("doctor_schedule_exceptions")
    .select("*")
    .eq("doctor_id", id)
    .order("date", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request, { params }: RouteParams) {
  const { id } = await params
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  const { date, kind = "full_day", start_time, end_time, reason } = body
  if (!date) return NextResponse.json({ error: "date wajib." }, { status: 400 })

  const { data: doctor } = await guard.supabase
    .from("doctors").select("clinic_id, name").eq("id", id).maybeSingle()
  if (!doctor || doctor.clinic_id !== guard.staff.clinic_id) {
    return NextResponse.json({ error: "Dokter tidak ditemukan." }, { status: 404 })
  }

  const { data, error } = await guard.supabase
    .from("doctor_schedule_exceptions")
    .insert({
      doctor_id:  id,
      clinic_id:  guard.staff.clinic_id,
      date,
      kind,
      start_time: kind === "partial" ? start_time : null,
      end_time:   kind === "partial" ? end_time : null,
      reason:     reason ?? null,
      created_by: guard.staff.id,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(guard.supabase, {
    clinic_id:   guard.staff.clinic_id,
    actor_id:    guard.staff.id,
    action:      "schedule.exception.create",
    target_type: "doctor",
    target_id:   id,
    metadata:    { date, kind, doctor_name: doctor.name },
  })

  return NextResponse.json(data, { status: 201 })
}
