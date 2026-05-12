import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { isDoctorOnDuty } from "./schedule-check"

export interface FallbackSuggestion {
  reason:         "off_duty" | "no_specialty_match" | "fully_booked"
  alternatives:   Array<{ doctor_id: string; name: string; specialty: string; available_today: boolean }>
  next_start?:    string
}

// Kalau dokter target tidak tersedia (off-duty, cuti, atau penuh), cari alternatif:
// - spesialisasi sama yang sedang on-duty
// - kalau tidak ada, dokter umum yang on-duty
// - kalau tidak ada juga, return next_start dokter target
export async function findFallbackDoctors(
  targetDoctorId: string,
  clinicId: string,
  supabase: SupabaseClient<Database>,
): Promise<FallbackSuggestion> {
  const { data: target } = await supabase
    .from("doctors")
    .select("id, specialty")
    .eq("id", targetDoctorId)
    .maybeSingle()

  const targetStatus = await isDoctorOnDuty(targetDoctorId, supabase)
  if (targetStatus.on_duty) {
    // Target available — tidak butuh fallback
    return { reason: "off_duty", alternatives: [], next_start: undefined }
  }

  // Same specialty alternatives
  const { data: sameSpec } = await supabase
    .from("doctors")
    .select("id, name, specialty")
    .eq("clinic_id", clinicId)
    .eq("is_active", true)
    .eq("specialty", target?.specialty ?? "Umum")
    .neq("id", targetDoctorId)

  const alts: FallbackSuggestion["alternatives"] = []
  for (const d of sameSpec ?? []) {
    const status = await isDoctorOnDuty(d.id, supabase)
    alts.push({
      doctor_id:       d.id,
      name:            d.name,
      specialty:       d.specialty,
      available_today: status.on_duty,
    })
  }

  // Jika belum ada alternatif on-duty, tambahkan dokter Umum on-duty
  if (!alts.some((a) => a.available_today)) {
    const { data: umum } = await supabase
      .from("doctors")
      .select("id, name, specialty")
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .eq("specialty", "Umum")
      .neq("id", targetDoctorId)
    for (const d of umum ?? []) {
      if (alts.some((a) => a.doctor_id === d.id)) continue
      const status = await isDoctorOnDuty(d.id, supabase)
      if (status.on_duty) {
        alts.push({
          doctor_id:       d.id,
          name:            d.name,
          specialty:       d.specialty,
          available_today: true,
        })
      }
    }
  }

  return {
    reason:        "off_duty",
    alternatives:  alts.sort((a, b) => Number(b.available_today) - Number(a.available_today)),
    next_start:    targetStatus.next_start,
  }
}
