import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createServiceClient } from "@/lib/supabase/service"
import type { Json } from "@/types/database"

export type NotificationType =
  | "staff_reply"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "booking_reminder"
  | "booking_rescheduled"
  | "broadcast"

export interface NotifyInput {
  clinicId:  string
  patientId: string
  type:      NotificationType
  title:     string
  body:      string
  link?:     string
  metadata?: Record<string, unknown>
}

interface NotificationCtx {
  staffName?:  string | null
  doctorName?: string | null
  date?:       string | null // YYYY-MM-DD
  time?:       string | null // HH:MM[:SS]
}

// Pure mapper: event type + context → user-facing copy (Bahasa Indonesia) + deep link.
// Dipisah dari notify() agar mudah di-unit-test tanpa DB.
export function notificationContent(
  type: NotificationType,
  ctx: NotificationCtx = {},
): { title: string; body: string; link: string } {
  const dr   = ctx.doctorName ? `dr. ${ctx.doctorName}` : "dokter"
  const when = ctx.date ? format(parseISO(ctx.date), "EEEE, d MMM", { locale: idLocale }) : ""
  const t    = ctx.time ? ctx.time.slice(0, 5) : ""

  switch (type) {
    case "staff_reply":
      return {
        title: "Balasan dari klinik",
        body:  `${ctx.staffName || "Tim klinik"} membalas pesan Anda.`,
        link:  "/chat",
      }
    case "booking_confirmed":
      return {
        title: "Booking dikonfirmasi",
        body:  `Janji Anda dengan ${dr}${when ? ` pada ${when}` : ""}${t ? ` jam ${t} WIB` : ""} telah dikonfirmasi.`,
        link:  "/history",
      }
    case "booking_cancelled":
      return {
        title: "Booking dibatalkan",
        body:  `Janji Anda dengan ${dr}${when ? ` pada ${when}` : ""} dibatalkan oleh klinik.`,
        link:  "/history",
      }
    case "booking_completed":
      return {
        title: "Kunjungan selesai",
        body:  "Terima kasih telah berkunjung. Semoga lekas sehat!",
        link:  "/history",
      }
    case "booking_reminder":
      return {
        title: "Pengingat janji besok",
        body:  `Jangan lupa janji Anda dengan ${dr} besok${t ? ` jam ${t} WIB` : ""}.`,
        link:  "/history",
      }
    case "booking_rescheduled":
      return {
        title: "Jadwal janji diubah",
        body:  `Janji Anda dengan ${dr} dijadwalkan ulang${when ? ` ke ${when}` : ""}${t ? ` jam ${t} WIB` : ""}.`,
        link:  "/history",
      }
    case "broadcast":
      // Broadcast membawa title/body kustom dari penyusun; ini hanya fallback.
      return { title: "Info dari klinik", body: "Ada pesan dari klinik Anda.", link: "/home" }
  }
}

// Kirim notifikasi ke pasien: insert row (in-app, realtime) [+ web push di Phase 2].
// Best-effort — kegagalan notifikasi tidak boleh menggagalkan aksi utama (kirim pesan,
// konfirmasi booking, dll). Server-only (pakai service role).
export async function notify(input: NotifyInput): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from("notifications").insert({
      clinic_id:  input.clinicId,
      patient_id: input.patientId,
      type:       input.type,
      title:      input.title,
      body:       input.body,
      link:       input.link ?? null,
      metadata:   (input.metadata ?? {}) as Json,
    })
    if (error) {
      console.error("[notify] insert:", error.message)
      return
    }
    // Web push (best-effort, server-only). Dynamic import agar web-push tidak ikut
    // ter-load saat hanya notificationContent yang dipakai (mis. unit test).
    try {
      const { dispatchPush } = await import("@/lib/push")
      await dispatchPush(input.patientId, {
        title: input.title,
        body:  input.body,
        url:   input.link ?? "/home",
      })
    } catch (e) {
      console.error("[notify] push:", e)
    }
  } catch (err) {
    console.error("[notify]", err)
  }
}

// Broadcast: satu notifikasi → banyak pasien (batch insert berchunk + push fan-out).
// Best-effort, server-only.
export async function notifyMany(
  clinicId: string,
  patientIds: string[],
  payload: { type: NotificationType; title: string; body: string; link?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  if (patientIds.length === 0) return
  try {
    const supabase = createServiceClient()
    const rows = patientIds.map((pid) => ({
      clinic_id:  clinicId,
      patient_id: pid,
      type:       payload.type,
      title:      payload.title,
      body:       payload.body,
      link:       payload.link ?? null,
      metadata:   (payload.metadata ?? {}) as Json,
    }))
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from("notifications").insert(rows.slice(i, i + 500))
      if (error) console.error("[notifyMany] insert:", error.message)
    }
    try {
      const { dispatchPushMany } = await import("@/lib/push")
      await dispatchPushMany(patientIds, { title: payload.title, body: payload.body, url: payload.link ?? "/home" })
    } catch (e) {
      console.error("[notifyMany] push:", e)
    }
  } catch (e) {
    console.error("[notifyMany]", e)
  }
}
