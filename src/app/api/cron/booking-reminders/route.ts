import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { notify, notificationContent } from "@/lib/notifications"

// GET /api/cron/booking-reminders
// Dipanggil oleh cron eksternal (Vercel Cron, GitHub Actions, atau pg_cron).
// Cek bookings H-1 + insert ke booking_reminders_log untuk avoid double-send.
// Notification delivery: di sini cuma log. Integrasi WA/SMS/email diserahkan ke caller
// yang baca log ini, atau bisa di-extend di sini dengan provider integration.
//
// Auth: header `Authorization: Bearer <CRON_SECRET>`.

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const supabase = createServiceClient()
    const { data: rows, error } = await supabase.rpc("bookings_needing_reminder")
    if (error) {
      console.error("[cron/reminders] rpc:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const list = rows ?? []

    // Insert log untuk semua agar tidak double-send
    if (list.length > 0) {
      const logs = list.map((r) => ({ booking_id: r.booking_id, kind: "h-1" as const }))
      const { error: logErr } = await supabase.from("booking_reminders_log").insert(logs)
      if (logErr) console.error("[cron/reminders] log insert:", logErr)
    }

    // Buat notifikasi in-app (+ push Phase 2) untuk tiap reminder (best-effort, paralel).
    await Promise.all(
      list.map((r) =>
        notify({
          clinicId:  r.clinic_id,
          patientId: r.patient_id,
          type:      "booking_reminder",
          ...notificationContent("booking_reminder", {
            doctorName: r.doctor_name,
            date:       r.booking_date,
            time:       r.booking_time,
          }),
          metadata:  { booking_id: r.booking_id },
        }),
      ),
    )

    // Place to integrate WA/SMS/email provider. Untuk sekarang return data
    // supaya caller bisa proses (mis. Vercel Cron + WhatsApp Business API).
    return NextResponse.json({
      count: list.length,
      reminders: list.map((r) => ({
        booking_id:   r.booking_id,
        patient_name: r.patient_name,
        patient_phone: r.patient_phone,
        doctor_name:  r.doctor_name,
        booking_date: r.booking_date,
        booking_time: r.booking_time,
        // Template default — caller bisa override
        message: `Halo ${r.patient_name}, ini reminder janji Anda dengan dr. ${r.doctor_name} besok ${r.booking_date} jam ${r.booking_time.slice(0, 5)}. Konfirmasi balas Y / batalkan balas N.`,
      })),
    })
  } catch (err) {
    console.error("[cron/booking-reminders]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
