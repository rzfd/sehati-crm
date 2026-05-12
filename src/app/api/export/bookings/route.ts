import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { csvResponse } from "@/lib/csv"

// GET /api/export/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD — CSV export untuk admin
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

  const { data: staff } = await supabase
    .from("staff_members").select("clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (!staff || (staff.role !== "admin" && staff.role !== "manager")) {
    return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
  }

  const url = new URL(req.url)
  const from = url.searchParams.get("from") ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const to   = url.searchParams.get("to")   ?? new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_date, booking_time, status, payment_status, payment_method, insurance_provider, insurance_number, notes, patient:patients(name, phone), doctor:doctors(name, specialty)")
    .eq("clinic_id", staff.clinic_id)
    .gte("booking_date", from)
    .lte("booking_date", to)
    .order("booking_date", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = {
    id: string; booking_date: string; booking_time: string; status: string
    payment_status: string | null; payment_method: string | null
    insurance_provider: string | null; insurance_number: string | null
    notes: string | null
    patient: { name: string; phone: string | null } | null
    doctor:  { name: string; specialty: string } | null
  }
  const rows = ((data ?? []) as unknown as Row[]).map((r) => ({
    id:              r.id,
    booking_date:    r.booking_date,
    booking_time:    r.booking_time,
    status:          r.status,
    patient_name:    r.patient?.name ?? "",
    patient_phone:   r.patient?.phone ?? "",
    doctor_name:     r.doctor?.name ?? "",
    doctor_specialty: r.doctor?.specialty ?? "",
    payment_status:  r.payment_status ?? "",
    payment_method:  r.payment_method ?? "",
    insurance:       r.insurance_provider ?? "",
    insurance_no:    r.insurance_number ?? "",
    notes:           r.notes ?? "",
  }))
  return csvResponse(`bookings-${from}-to-${to}.csv`, rows as unknown as Record<string, unknown>[])
}
