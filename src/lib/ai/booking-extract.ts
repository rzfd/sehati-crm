import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"

export interface BookingSuggestion {
  doctor_id:    string | null
  doctor_name:  string | null
  specialty:    string | null
  date:         string | null     // YYYY-MM-DD
  time:         string | null     // HH:mm:ss
  reason:       string
}

interface DoctorLite {
  id:        string
  name:      string
  specialty: string
}

// Ekstrak booking suggestion dari pesan pasien.
// Output untuk dipakai AIBookingCard di staff inbox.
// Tidak resolve "besok"/"hari ini" → biarkan staff yang konfirmasi tanggal final.
export async function extractBookingSuggestion(
  message: string,
  clinicId: string,
  supabase: SupabaseClient<Database>,
): Promise<BookingSuggestion | null> {
  const { data: doctors } = await supabase
    .from("doctors").select("id, name, specialty").eq("clinic_id", clinicId).eq("is_active", true)
  if (!doctors || doctors.length === 0) return null

  const doctorList = (doctors as DoctorLite[])
    .map((d, i) => `${i + 1}. ${d.name} (${d.specialty}) [id=${d.id}]`)
    .join("\n")

  const today = new Date().toISOString().slice(0, 10)
  const system = `Kamu ekstrak detail booking dari pesan pasien klinik.
Hari ini: ${today}.
Daftar dokter klinik:
${doctorList}

Tugasmu: ekstrak doctor_id, date (YYYY-MM-DD), time (HH:mm:ss) dari pesan.
- Kalau pasien menyebut nama dokter, match ke daftar dan return ID-nya. Kalau tidak match, set null.
- Tanggal relatif ("besok", "Senin depan") resolve berdasarkan today.
- Waktu kasar ("pagi") → 09:00:00, ("siang") → 12:00:00, ("sore") → 15:00:00. Kalau tidak disebut, null.
- Output HANYA JSON valid, tanpa code fence.

Format:
{"doctor_id":"<uuid|null>","doctor_name":"<nama|null>","specialty":"<spesialisasi|null>","date":"<YYYY-MM-DD|null>","time":"<HH:mm:ss|null>","reason":"<alasan singkat>"}`

  try {
    const res = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 200,
      system,
      messages: [{ role: "user", content: message }],
    })
    const text = extractText(res.content)
    const parsed = safeParseJson<BookingSuggestion>(text)
    if (!parsed) return null

    // Validasi: doctor_id harus match list (avoid hallucination)
    if (parsed.doctor_id && !doctors.some((d) => d.id === parsed.doctor_id)) {
      parsed.doctor_id = null
      parsed.doctor_name = null
      parsed.specialty = null
    }
    return parsed
  } catch (err) {
    console.error("[booking-extract]", err)
    return null
  }
}
