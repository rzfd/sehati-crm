import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export interface ScheduleStatus {
  doctor_id:  string
  on_duty:    boolean
  next_start?: string  // ISO timestamp dari window berikutnya kalau bukan saat ini
}

// Cek apakah dokter sedang on-duty saat ini berdasarkan doctor_schedules.
// Saat ini fungsi pakai server time (Asia/Jakarta dianggap UTC offset +7 manual).
// Untuk akurasi lebih tinggi nanti pindah ke server-side TZ helper.
export async function isDoctorOnDuty(
  doctorId: string,
  supabase: SupabaseClient<Database>,
  at: Date = new Date(),
): Promise<ScheduleStatus> {
  // Asumsi server UTC; klinik Asia/Jakarta = +7h
  const jakarta = new Date(at.getTime() + 7 * 60 * 60 * 1000)
  const dayOfWeek = jakarta.getUTCDay() // sudah disesuaikan ke Jakarta
  const hours   = jakarta.getUTCHours()
  const minutes = jakarta.getUTCMinutes()
  const nowMin = hours * 60 + minutes

  const { data: schedules } = await supabase
    .from("doctor_schedules")
    .select("start_time, end_time, day_of_week")
    .eq("doctor_id", doctorId)

  if (!schedules || schedules.length === 0) {
    return { doctor_id: doctorId, on_duty: false }
  }

  // Cek apakah ada window today yang covering jam ini
  for (const s of schedules) {
    if (s.day_of_week !== dayOfWeek) continue
    const startMin = toMinutes(s.start_time)
    const endMin   = toMinutes(s.end_time)
    if (nowMin >= startMin && nowMin < endMin) {
      return { doctor_id: doctorId, on_duty: true }
    }
  }

  // Tidak on-duty — hitung next start (today/besok/seminggu)
  const nextStart = findNextStart(schedules, dayOfWeek, nowMin, jakarta)
  return { doctor_id: doctorId, on_duty: false, next_start: nextStart }
}

// Ambil daftar dokter yang sedang on-duty di klinik
export async function getOnDutyDoctors(
  clinicId: string,
  supabase: SupabaseClient<Database>,
  at: Date = new Date(),
): Promise<string[]> {
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("is_active", true)

  if (!doctors) return []

  const checks = await Promise.all(
    doctors.map((d) => isDoctorOnDuty(d.id, supabase, at)),
  )
  return checks.filter((c) => c.on_duty).map((c) => c.doctor_id)
}

// ── helpers ────────────────────────────────────────────────
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function findNextStart(
  schedules: { start_time: string; day_of_week: number }[],
  todayDow: number,
  nowMin: number,
  jakarta: Date,
): string | undefined {
  // Cari schedule terdekat dalam 7 hari ke depan
  for (let offset = 0; offset < 7; offset++) {
    const dow = (todayDow + offset) % 7
    const todays = schedules.filter((s) => s.day_of_week === dow)
    if (todays.length === 0) continue
    todays.sort((a, b) => a.start_time.localeCompare(b.start_time))
    for (const s of todays) {
      if (offset === 0 && toMinutes(s.start_time) <= nowMin) continue
      const target = new Date(jakarta)
      target.setUTCDate(target.getUTCDate() + offset)
      const [h, m] = s.start_time.split(":").map(Number)
      target.setUTCHours(h, m, 0, 0)
      // Kembali ke UTC asli (Jakarta -7h)
      target.setTime(target.getTime() - 7 * 60 * 60 * 1000)
      return target.toISOString()
    }
  }
  return undefined
}
