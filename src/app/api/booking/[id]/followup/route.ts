import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { notify } from "@/lib/notifications"
import { draftFollowUp } from "@/lib/ai/followup"

interface RouteParams { params: Promise<{ id: string }> }

// POST /api/booking/[id]/followup — staff kirim follow-up pasca-kunjungan (AI, non-medis).
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
      .from("bookings").select("id, patient_id, clinic_id, doctor_id, status").eq("id", id).maybeSingle()
    if (!booking || booking.clinic_id !== staff.clinic_id) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }
    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Follow-up hanya untuk kunjungan yang selesai." }, { status: 400 })
    }

    const { data: doc } = await supabase
      .from("doctors").select("name, specialty").eq("id", booking.doctor_id).maybeSingle()
    const message = await draftFollowUp({ doctorName: doc?.name, specialty: doc?.specialty })
    if (!message) return NextResponse.json({ error: "AI gagal membuat follow-up. Coba lagi." }, { status: 502 })

    await notify({
      clinicId:  booking.clinic_id,
      patientId: booking.patient_id,
      type:      "booking_completed",
      title:     "Follow-up dari klinik",
      body:      message,
      link:      "/booking",
      metadata:  { booking_id: id, followup: true },
    })

    return NextResponse.json({ ok: true, message })
  } catch (err) {
    console.error("[api/booking/[id]/followup]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
