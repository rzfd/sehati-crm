import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { computeAvailableSlots } from "@/lib/slots"

// GET /api/booking/slots?doctor_id=X&date=YYYY-MM-DD
// Availability dihitung otoritatif di lib/slots (service client → lihat semua booking).
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

    const result = await computeAvailableSlots(doctorId, dateStr)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/booking/slots]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
