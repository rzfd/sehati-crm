import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/booking/slots?doctor_id=X&date=YYYY-MM-DD
// Generate slot dari doctor_schedules untuk day_of_week tertentu,
// kurangi slot yang sudah dibooked (pending/confirmed).
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const doctorId = url.searchParams.get("doctor_id")
    const dateStr  = url.searchParams.get("date")
    if (!doctorId || !dateStr) {
      return NextResponse.json({ error: "doctor_id dan date wajib." }, { status: 400 })
    }

    const date = new Date(`${dateStr}T00:00:00`)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Format tanggal invalid." }, { status: 400 })
    }
    const dayOfWeek = date.getDay() // 0=Minggu .. 6=Sabtu

    const { data: schedules, error: schedErr } = await supabase
      .from("doctor_schedules")
      .select("start_time, end_time, slot_duration_minutes")
      .eq("doctor_id", doctorId)
      .eq("day_of_week", dayOfWeek)

    if (schedErr) throw schedErr
    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ slots: [] })
    }

    // Generate semua possible slot dari semua schedule windows hari itu
    const allSlots: string[] = []
    for (const s of schedules) {
      const [sh, sm] = s.start_time.split(":").map(Number)
      const [eh, em] = s.end_time.split(":").map(Number)
      const startMin = sh * 60 + sm
      const endMin   = eh * 60 + em
      for (let t = startMin; t < endMin; t += s.slot_duration_minutes) {
        const h = Math.floor(t / 60).toString().padStart(2, "0")
        const m = (t % 60).toString().padStart(2, "0")
        allSlots.push(`${h}:${m}:00`)
      }
    }

    // Fetch existing bookings untuk hari + dokter
    const { data: booked } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("doctor_id", doctorId)
      .eq("booking_date", dateStr)
      .in("status", ["pending", "confirmed"])

    const bookedSet = new Set((booked ?? []).map((b) => b.booking_time))
    const slots = allSlots
      .filter((s) => !bookedSet.has(s))
      .sort((a, b) => a.localeCompare(b))

    return NextResponse.json({ slots })
  } catch (err) {
    console.error("[api/booking/slots]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
