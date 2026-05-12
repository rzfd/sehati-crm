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

// GET /api/doctors/[id]/schedules
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { data, error } = await guard.supabase
    .from("doctor_schedules")
    .select("*")
    .eq("doctor_id", id)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/doctors/[id]/schedules
// Body: { day_of_week, start_time, end_time, slot_duration_minutes?, max_patients? }
export async function POST(req: Request, { params }: RouteParams) {
  const { id } = await params
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  const { day_of_week, start_time, end_time, slot_duration_minutes, max_patients } = body
  if (day_of_week == null || !start_time || !end_time) {
    return NextResponse.json({ error: "day_of_week, start_time, end_time wajib." }, { status: 400 })
  }
  if (start_time >= end_time) {
    return NextResponse.json({ error: "start_time harus sebelum end_time." }, { status: 400 })
  }

  // Verifikasi doctor milik klinik staff
  const { data: doctor } = await guard.supabase
    .from("doctors").select("id, clinic_id, name").eq("id", id).maybeSingle()
  if (!doctor || doctor.clinic_id !== guard.staff.clinic_id) {
    return NextResponse.json({ error: "Dokter tidak ditemukan." }, { status: 404 })
  }

  const { data, error } = await guard.supabase
    .from("doctor_schedules")
    .insert({
      doctor_id:             id,
      day_of_week,
      start_time,
      end_time,
      slot_duration_minutes: slot_duration_minutes ?? 30,
      max_patients:          max_patients ?? 20,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(guard.supabase, {
    clinic_id:   guard.staff.clinic_id,
    actor_id:    guard.staff.id,
    action:      "schedule.create",
    target_type: "doctor",
    target_id:   id,
    metadata:    { day_of_week, start_time, end_time, doctor_name: doctor.name },
  })

  return NextResponse.json(data, { status: 201 })
}
