import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { logAudit } from "@/lib/audit"
import { notify, notificationContent } from "@/lib/notifications"
import { computeAvailableSlots } from "@/lib/slots"

interface RouteParams { params: Promise<{ id: string }> }

const VALID_STATUS = ["pending", "confirmed", "completed", "no_show", "cancelled"]

// PATCH /api/booking/[id]
// - Status change: { status }                         (pasien hanya boleh cancel)
// - Reschedule:    { booking_date, booking_time }      (dokter tetap)
//
// Authz dilakukan di kode (isStaff / isOwner), lalu mutasi via service client —
// bookings tidak punya policy UPDATE untuk pasien, jadi cancel/reschedule pasien
// harus lewat service role setelah diotorisasi di sini.
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const body = await req.json().catch(() => ({}))

    const [{ data: staff }, { data: patient }] = await Promise.all([
      supabase.from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle(),
      supabase.from("patients").select("id, clinic_id").eq("user_id", user.id).maybeSingle(),
    ])

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, patient_id, clinic_id, status, doctor_id, booking_date, booking_time")
      .eq("id", id)
      .maybeSingle()
    if (!booking) return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 })

    const isStaff = !!staff && booking.clinic_id === staff.clinic_id
    const isOwner = !!patient && booking.patient_id === patient.id
    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }

    const db = createServiceClient()

    // ── Reschedule branch ──
    if (body.booking_date != null || body.booking_time != null) {
      const newDate = String(body.booking_date ?? "")
      const rawTime = String(body.booking_time ?? "")
      if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate) || !/^\d{2}:\d{2}(:\d{2})?$/.test(rawTime)) {
        return NextResponse.json({ error: "Tanggal/jam tidak valid." }, { status: 400 })
      }
      const newTime = rawTime.length === 5 ? `${rawTime}:00` : rawTime

      if (booking.status !== "pending" && booking.status !== "confirmed") {
        return NextResponse.json({ error: `Booking ${booking.status} tidak bisa dijadwalkan ulang.` }, { status: 400 })
      }
      const todayStr = new Date().toISOString().split("T")[0]
      if (newDate < todayStr) {
        return NextResponse.json({ error: "Tidak bisa memilih tanggal yang sudah lewat." }, { status: 400 })
      }

      // Validasi otoritatif: slot harus benar-benar tersedia (abaikan slot booking ini sendiri).
      const { slots } = await computeAvailableSlots(booking.doctor_id, newDate, { excludeBookingId: id })
      if (!slots.includes(newTime)) {
        return NextResponse.json({ error: "Slot tidak tersedia. Pilih waktu lain." }, { status: 409 })
      }

      // Pasien reschedule → kembali ke 'pending' (klinik konfirmasi ulang). Staff → status tetap.
      const newStatus = isStaff ? booking.status : "pending"

      const { data, error } = await db
        .from("bookings")
        .update({ booking_date: newDate, booking_time: newTime, status: newStatus })
        .eq("id", id)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      if (isStaff) {
        await logAudit(supabase, {
          clinic_id:   staff!.clinic_id,
          actor_id:    staff!.id,
          action:      "booking.rescheduled",
          target_type: "booking",
          target_id:   id,
          metadata:    { from: { date: booking.booking_date, time: booking.booking_time }, to: { date: newDate, time: newTime } },
        })
        const { data: doc } = await supabase.from("doctors").select("name").eq("id", booking.doctor_id).maybeSingle()
        await notify({
          clinicId:  booking.clinic_id,
          patientId: booking.patient_id,
          type:      "booking_rescheduled",
          ...notificationContent("booking_rescheduled", { doctorName: doc?.name, date: newDate, time: newTime }),
          metadata:  { booking_id: id },
        })
      }

      return NextResponse.json(data)
    }

    // ── Status-change branch ──
    const newStatus = body.status
    if (!VALID_STATUS.includes(newStatus)) {
      return NextResponse.json({ error: "Status invalid." }, { status: 400 })
    }
    if (!isStaff && newStatus !== "cancelled") {
      return NextResponse.json({ error: "Pasien hanya bisa membatalkan booking." }, { status: 403 })
    }
    if (!isStaff && booking.status !== "pending" && booking.status !== "confirmed") {
      return NextResponse.json({ error: `Booking ${booking.status} tidak bisa dibatalkan.` }, { status: 400 })
    }

    const { data, error } = await db
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (isStaff) {
      await logAudit(supabase, {
        clinic_id:   staff!.clinic_id,
        actor_id:    staff!.id,
        action:      `booking.${newStatus}`,
        target_type: "booking",
        target_id:   id,
        metadata:    { from: booking.status, to: newStatus },
      })
      const NTYPE = {
        confirmed: "booking_confirmed",
        cancelled: "booking_cancelled",
        completed: "booking_completed",
      } as const
      const ntype = NTYPE[newStatus as keyof typeof NTYPE]
      if (ntype) {
        const { data: doc } = await supabase.from("doctors").select("name").eq("id", booking.doctor_id).maybeSingle()
        await notify({
          clinicId:  booking.clinic_id,
          patientId: booking.patient_id,
          type:      ntype,
          ...notificationContent(ntype, {
            doctorName: doc?.name,
            date:       booking.booking_date,
            time:       booking.booking_time,
          }),
          metadata:  { booking_id: id },
        })
      }
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/booking PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
