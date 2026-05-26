import { createServiceClient } from "@/lib/supabase/service"

export interface ScheduleWindow {
  start_time:            string
  end_time:              string
  slot_duration_minutes: number
}

export interface AvailableSlots {
  slots:   string[]
  reason?: string
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

// Pure: enumerate semua slot "HH:MM:SS" dari window jadwal (belum filter booking/exception).
export function enumerateSlots(windows: ScheduleWindow[]): string[] {
  const all: string[] = []
  for (const s of windows) {
    const startMin = toMinutes(s.start_time)
    const endMin   = toMinutes(s.end_time)
    for (let t = startMin; t < endMin; t += s.slot_duration_minutes) {
      const h = Math.floor(t / 60).toString().padStart(2, "0")
      const m = (t % 60).toString().padStart(2, "0")
      all.push(`${h}:${m}:00`)
    }
  }
  return all
}

// Authoritative availability: jadwal − exception (full/partial) − booking aktif.
// Pakai SERVICE client agar lihat semua booking (bukan hanya milik caller) — penting
// supaya pasien tidak bisa double-book slot pasien lain. `excludeBookingId` mengabaikan
// booking yang sedang di-reschedule (slotnya sendiri tidak dihitung terisi).
export async function computeAvailableSlots(
  doctorId: string,
  dateStr: string,
  opts: { excludeBookingId?: string } = {},
): Promise<AvailableSlots> {
  const date = new Date(`${dateStr}T00:00:00`)
  if (isNaN(date.getTime())) return { slots: [] }
  const dayOfWeek = date.getDay() // 0=Minggu .. 6=Sabtu
  const supabase = createServiceClient()

  const { data: exceptions } = await supabase
    .from("doctor_schedule_exceptions")
    .select("kind, start_time, end_time")
    .eq("doctor_id", doctorId)
    .eq("date", dateStr)
  if ((exceptions ?? []).some((e) => e.kind === "full_day")) {
    return { slots: [], reason: "Dokter cuti hari ini" }
  }
  const partialBlocks = (exceptions ?? []).filter((e) => e.kind === "partial")

  const { data: schedules } = await supabase
    .from("doctor_schedules")
    .select("start_time, end_time, slot_duration_minutes")
    .eq("doctor_id", doctorId)
    .eq("day_of_week", dayOfWeek)
  if (!schedules || schedules.length === 0) return { slots: [] }

  const allSlots = enumerateSlots(schedules)

  const { data: booked } = await supabase
    .from("bookings")
    .select("id, booking_time")
    .eq("doctor_id", doctorId)
    .eq("booking_date", dateStr)
    .in("status", ["pending", "confirmed"])
  const bookedSet = new Set(
    (booked ?? []).filter((b) => b.id !== opts.excludeBookingId).map((b) => b.booking_time),
  )

  const blockedSet = new Set<string>()
  for (const block of partialBlocks) {
    if (!block.start_time || !block.end_time) continue
    const startBlk = toMinutes(block.start_time)
    const endBlk   = toMinutes(block.end_time)
    for (const slot of allSlots) {
      const sMin = toMinutes(slot)
      if (sMin >= startBlk && sMin < endBlk) blockedSet.add(slot)
    }
  }

  const slots = allSlots
    .filter((s) => !bookedSet.has(s) && !blockedSet.has(s))
    .sort((a, b) => a.localeCompare(b))
  return { slots }
}
