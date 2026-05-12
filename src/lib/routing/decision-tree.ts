import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { detectDoctorMention, type DoctorMatch } from "./doctor-detect"
import { classifySpecialty, type SpecialtyResult } from "./specialty-classifier"
import { isDoctorOnDuty, type ScheduleStatus } from "./schedule-check"
import { findFallbackDoctors, type FallbackSuggestion } from "./fallback"

export interface RoutingDecision {
  recommended_doctor_id: string | null
  reason:                "primary_doctor" | "name_match" | "specialty_match" | "fallback" | "no_match"
  detail:                string
  doctor_match?:         DoctorMatch
  specialty?:            SpecialtyResult
  schedule?:             ScheduleStatus
  fallback?:             FallbackSuggestion
}

interface RouteInput {
  message:           string
  clinicId:          string
  primaryDoctorId?:  string | null
  supabase:          SupabaseClient<Database>
}

// Decision tree priority:
//   1. primary doctor (kalau pasien sebut "dokter saya")
//   2. dokter dengan nama disebut + sedang on-duty
//   3. specialty classifier → cari dokter spesialisasi itu yang on-duty
//   4. fallback (dokter umum on-duty)
//   5. no_match → biar staff yang tentukan manual
export async function routeMessage(input: RouteInput): Promise<RoutingDecision> {
  const { message, clinicId, primaryDoctorId, supabase } = input

  // 1) detect doctor mention (handles "dokter saya" → primary)
  const mention = await detectDoctorMention(message, clinicId, supabase, primaryDoctorId)

  if (mention) {
    const sched = await isDoctorOnDuty(mention.doctor_id, supabase)
    if (sched.on_duty) {
      return {
        recommended_doctor_id: mention.doctor_id,
        reason:                mention.matched_via === "primary" ? "primary_doctor" : "name_match",
        detail:                `${mention.matched_via} match: ${mention.name}`,
        doctor_match:          mention,
        schedule:              sched,
      }
    }
    // Dokter disebut tapi tidak on-duty → fallback
    const fb = await findFallbackDoctors(mention.doctor_id, clinicId, supabase)
    return {
      recommended_doctor_id: fb.alternatives.find((a) => a.available_today)?.doctor_id ?? null,
      reason:                "fallback",
      detail:                `${mention.name} tidak on-duty, sarankan alternatif`,
      doctor_match:          mention,
      schedule:              sched,
      fallback:              fb,
    }
  }

  // 2) specialty inference
  const spec = await classifySpecialty(message)
  if (spec.specialty) {
    const { data: specDoctors } = await supabase
      .from("doctors")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .eq("specialty", spec.specialty)

    for (const d of specDoctors ?? []) {
      const sched = await isDoctorOnDuty(d.id, supabase)
      if (sched.on_duty) {
        return {
          recommended_doctor_id: d.id,
          reason:                "specialty_match",
          detail:                `Specialty ${spec.specialty} match: ${d.name}`,
          specialty:             spec,
          schedule:              sched,
        }
      }
    }
  }

  // 3) Default fallback ke dokter umum on-duty
  const { data: umum } = await supabase
    .from("doctors")
    .select("id, name, specialty")
    .eq("clinic_id", clinicId)
    .eq("is_active", true)
    .eq("specialty", "Umum")

  for (const d of umum ?? []) {
    const sched = await isDoctorOnDuty(d.id, supabase)
    if (sched.on_duty) {
      return {
        recommended_doctor_id: d.id,
        reason:                "fallback",
        detail:                `Dokter Umum on-duty: ${d.name}`,
        specialty:             spec,
        schedule:              sched,
      }
    }
  }

  return {
    recommended_doctor_id: null,
    reason:                "no_match",
    detail:                "Tidak ada dokter on-duty yang relevan — escalate manual",
    specialty:             spec,
  }
}
