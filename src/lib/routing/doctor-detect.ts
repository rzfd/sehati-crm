import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Match "dr X", "dokter X", "Dr. X" — bahkan typo ringan.
// Cara kerja: ambil daftar dokter aktif klinik, lakukan substring + Levenshtein-lite check.

export interface DoctorMatch {
  doctor_id:    string
  name:         string
  specialty:    string
  match_score:  number   // 1.0 = exact substring; <1 = fuzzy
  matched_via:  "exact" | "fuzzy" | "primary"
}

interface DoctorRow {
  id:        string
  name:      string
  specialty: string
  title:     string
}

const PREFIX_RE = /\b(dr\.?|dokter|doktor)\s+([a-z][a-z\s\.\-]{1,40})/gi

export async function detectDoctorMention(
  message: string,
  clinicId: string,
  supabase: SupabaseClient<Database>,
  primaryDoctorId?: string | null,
): Promise<DoctorMatch | null> {
  const lower = message.toLowerCase()

  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, name, specialty, title")
    .eq("clinic_id", clinicId)
    .eq("is_active", true)

  if (!doctors || doctors.length === 0) return null

  // 1) Exact substring — cek setiap nama dokter (full + last + first name token)
  for (const d of doctors as DoctorRow[]) {
    const tokens = d.name.toLowerCase().split(/\s+/).filter((t) => t.length >= 3)
    if (lower.includes(d.name.toLowerCase())) {
      return { doctor_id: d.id, name: d.name, specialty: d.specialty, match_score: 1, matched_via: "exact" }
    }
    for (const tok of tokens) {
      // Hanya match kalau token dipakai dengan prefix "dr"/"dokter" — hindari false positive
      // dari nama umum (Bu Sari, dll).
      const re = new RegExp(`\\b(dr\\.?|dokter|doktor)\\s+${tok}\\b`, "i")
      if (re.test(lower)) {
        return { doctor_id: d.id, name: d.name, specialty: d.specialty, match_score: 0.9, matched_via: "exact" }
      }
    }
  }

  // 2) Fuzzy — ekstrak frasa setelah "dr"/"dokter" lalu compare ke nama dokter.
  const mentions: string[] = []
  for (const m of message.matchAll(PREFIX_RE)) {
    const candidate = m[2].trim().split(/\s+/).slice(0, 2).join(" ")
    if (candidate) mentions.push(candidate.toLowerCase())
  }

  if (mentions.length > 0) {
    let best: { d: DoctorRow; score: number } | null = null
    for (const d of doctors as DoctorRow[]) {
      const lastName = d.name.toLowerCase().split(/\s+/).pop() ?? ""
      for (const cand of mentions) {
        const score = similarity(cand, lastName)
        if (!best || score > best.score) best = { d, score }
      }
    }
    if (best && best.score >= 0.6) {
      return {
        doctor_id:   best.d.id,
        name:        best.d.name,
        specialty:   best.d.specialty,
        match_score: best.score,
        matched_via: "fuzzy",
      }
    }
  }

  // 3) Fall back ke primary doctor (pasien sebut "dokter saya" / "biasanya")
  if (primaryDoctorId && /\b(dokter|dr\.?)\s+(saya|biasanya|yg biasa|yang biasa)/i.test(lower)) {
    const primary = (doctors as DoctorRow[]).find((d) => d.id === primaryDoctorId)
    if (primary) {
      return {
        doctor_id:   primary.id,
        name:        primary.name,
        specialty:   primary.specialty,
        match_score: 0.85,
        matched_via: "primary",
      }
    }
  }

  return null
}

// ── Similarity (Levenshtein-based, normalized) ─────────────
function similarity(a: string, b: string): number {
  if (a === b) return 1
  if (!a || !b) return 0
  const dist = levenshtein(a, b)
  return 1 - dist / Math.max(a.length, b.length)
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[] = new Array(n + 1)
  for (let j = 0; j <= n; j++) dp[j] = j
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : Math.min(prev, dp[j], dp[j - 1]) + 1
      prev = tmp
    }
  }
  return dp[n]
}
