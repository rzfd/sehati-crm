import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

interface RouteParams { params: Promise<{ id: string }> }

const VALID_STATUS = ["pending", "confirmed", "completed", "no_show", "cancelled"]

// PATCH /api/booking/[id]
// Body: { status: "cancelled" } — patient bisa cancel booking sendiri kalau status pending/confirmed.
// Staff bisa update ke status manapun.
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const body = await req.json()
    const newStatus = body.status
    if (!VALID_STATUS.includes(newStatus)) {
      return NextResponse.json({ error: "Status invalid." }, { status: 400 })
    }

    // Identifikasi user: staff atau patient
    const [{ data: staff }, { data: patient }] = await Promise.all([
      supabase.from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle(),
      supabase.from("patients").select("id, clinic_id").eq("user_id", user.id).maybeSingle(),
    ])

    // Load booking
    const { data: booking } = await supabase
      .from("bookings").select("id, patient_id, clinic_id, status").eq("id", id).maybeSingle()
    if (!booking) return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 })

    // Authorization
    const isStaff = staff && booking.clinic_id === staff.clinic_id
    const isOwner = patient && booking.patient_id === patient.id

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }

    // Patient hanya boleh cancel; tidak boleh ubah ke status lain
    if (!isStaff && newStatus !== "cancelled") {
      return NextResponse.json({ error: "Pasien hanya bisa membatalkan booking." }, { status: 403 })
    }

    // Patient hanya bisa cancel kalau pending/confirmed
    if (!isStaff && booking.status !== "pending" && booking.status !== "confirmed") {
      return NextResponse.json({ error: `Booking ${booking.status} tidak bisa dibatalkan.` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (isStaff) {
      await logAudit(supabase, {
        clinic_id:   staff.clinic_id,
        actor_id:    staff.id,
        action:      `booking.${newStatus}`,
        target_type: "booking",
        target_id:   id,
        metadata:    { from: booking.status, to: newStatus },
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/booking PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
