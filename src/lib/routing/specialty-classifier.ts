import { anthropic, HAIKU, extractText, safeParseJson } from "@/lib/ai/anthropic"
import { SPECIALTY_HINTS, DOCTOR_SPECIALTY } from "@/lib/constants"

export interface SpecialtyResult {
  specialty:  string | null
  confidence: number
  source:     "keyword" | "ai" | "none"
}

const SPECIALTIES = Object.values(DOCTOR_SPECIALTY)

const SYSTEM = `Kamu adalah klasifier spesialisasi medis untuk klinik Indonesia.
Pilih spesialisasi paling relevan untuk pesan pasien dari daftar berikut:
${SPECIALTIES.join(", ")}

PENTING:
- JANGAN diagnosa. Tujuanmu hanya routing administratif.
- Jika tidak yakin, set specialty = null.
- Output HANYA JSON valid, tanpa code fence atau prose.

Format respons (JSON):
{"specialty":"<nama spesialisasi atau null>","confidence":<0.0-1.0>,"reason":"<alasan singkat>"}`

// Lapis cepat: keyword hints di SPECIALTY_HINTS (dari constants).
// Lapis kedua: panggil Haiku jika tidak ada hint cocok.
export async function classifySpecialty(message: string): Promise<SpecialtyResult> {
  const lower = message.toLowerCase()

  for (const [hint, specialty] of Object.entries(SPECIALTY_HINTS)) {
    if (lower.includes(hint)) {
      return { specialty, confidence: 0.85, source: "keyword" }
    }
  }

  try {
    const res = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 150,
      system: SYSTEM,
      messages: [{ role: "user", content: message }],
    })
    const text = extractText(res.content)
    const parsed = safeParseJson<{ specialty: string | null; confidence: number; reason: string }>(text)
    if (!parsed || !parsed.specialty) {
      return { specialty: null, confidence: 0, source: "none" }
    }
    // Hanya terima jika specialty match daftar resmi (avoid hallucination)
    if (!SPECIALTIES.includes(parsed.specialty as typeof SPECIALTIES[number])) {
      return { specialty: null, confidence: 0, source: "none" }
    }
    return { specialty: parsed.specialty, confidence: parsed.confidence, source: "ai" }
  } catch (err) {
    console.error("[specialty-classifier]", err)
    return { specialty: null, confidence: 0, source: "none" }
  }
}
