import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { scoreNoShowRisk } from "@/lib/no-show-risk"

interface UpcomingRow {
  id:           string
  patient_id:   string
  booking_date: string
  booking_time: string
  status:       string
  patient:      { name: string; is_new: boolean } | null
  doctor:       { name: string; title: string } | null
}

// GET /api/booking/at-risk — booking 8 hari ke depan dengan risiko no-show medium/high.
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })
    const clinicId = staff.clinic_id

    const today   = new Date().toISOString().slice(0, 10)
    const horizon = new Date(Date.now() + 8 * 86_400_000).toISOString().slice(0, 10)

    const { data: upcoming } = await supabase
      .from("bookings")
      .select("id, patient_id, booking_date, booking_time, status, patient:patients(name, is_new), doctor:doctors(name, title)")
      .eq("clinic_id", clinicId)
      .in("status", ["pending", "confirmed"])
      .gte("booking_date", today)
      .lte("booking_date", horizon)
      .order("booking_date", { ascending: true })

    const list = (upcoming ?? []) as unknown as UpcomingRow[]
    if (list.length === 0) return NextResponse.json([])

    const patientIds = [...new Set(list.map((b) => b.patient_id))]
    const { data: past } = await supabase
      .from("bookings")
      .select("patient_id, status")
      .eq("clinic_id", clinicId)
      .in("patient_id", patientIds)
      .in("status", ["completed", "no_show", "cancelled"])

    const hist: Record<string, { ns: number; total: number }> = {}
    for (const p of past ?? []) {
      const h = (hist[p.patient_id] ??= { ns: 0, total: 0 })
      h.total++
      if (p.status === "no_show") h.ns++
    }

    const now = Date.now()
    const result = list
      .map((b) => {
        const h = hist[b.patient_id] ?? { ns: 0, total: 0 }
        const leadDays = Math.round((new Date(`${b.booking_date}T00:00:00`).getTime() - now) / 86_400_000)
        const risk = scoreNoShowRisk({ pastNoShows: h.ns, pastTotal: h.total, isNew: !!b.patient?.is_new, leadDays })
        return {
          id:           b.id,
          booking_date: b.booking_date,
          booking_time: b.booking_time,
          patient_name: b.patient?.name ?? "Pasien",
          doctor_name:  b.doctor?.name ?? null,
          risk,
        }
      })
      .filter((r) => r.risk.level !== "low")
      .sort((a, b) => b.risk.score - a.risk.score)

    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/booking/at-risk]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
