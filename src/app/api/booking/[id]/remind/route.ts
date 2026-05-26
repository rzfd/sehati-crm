import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { notify, notificationContent } from "@/lib/notifications"

interface RouteParams { params: Promise<{ id: string }> }

// POST /api/booking/[id]/remind — staff kirim pengingat manual ke pasien (booking_reminder).
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, patient_id, clinic_id, doctor_id, booking_date, booking_time, status")
      .eq("id", id).maybeSingle()
    if (!booking || booking.clinic_id !== staff.clinic_id) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }
    if (booking.status !== "pending" && booking.status !== "confirmed") {
      return NextResponse.json({ error: "Hanya booking aktif yang bisa diingatkan." }, { status: 400 })
    }

    const { data: doc } = await supabase.from("doctors").select("name").eq("id", booking.doctor_id).maybeSingle()
    await notify({
      clinicId:  booking.clinic_id,
      patientId: booking.patient_id,
      type:      "booking_reminder",
      ...notificationContent("booking_reminder", { doctorName: doc?.name, date: booking.booking_date, time: booking.booking_time }),
      metadata:  { booking_id: id, manual: true },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/booking/[id]/remind]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
