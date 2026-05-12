import { anthropic, SONNET, extractText, safeParseJson } from "./anthropic"
import { TRIAGE_SYSTEM } from "./prompts"
import type { TriageRequest, TriageResult } from "@/types/ai"

type RawTriage = {
  urgency_level:  number
  is_emergency:   boolean
  reason:         string
  evidence:       string[]
  recommendation: string
}

const FALLBACK: TriageResult = {
  urgency_level:  3,
  is_emergency:   false,
  reason:         "Triage error — defaulting to high urgency untuk safety",
  evidence:       [],
  recommendation: "Hubungi pasien segera untuk klarifikasi manual",
}

function clampLevel(n: number): 1 | 2 | 3 | 4 {
  if (n <= 1) return 1
  if (n === 2) return 2
  if (n >= 4) return 4
  return 3
}

// Sonnet — high-stakes urgency detection.
// Gunakan ini sebelum auto-reply diputuskan untuk kategori medical/urgent.
export async function runTriage(req: TriageRequest): Promise<TriageResult> {
  const userContent = req.history?.length
    ? `Riwayat percakapan:\n${req.history.join("\n")}\n\nPesan terbaru: "${req.message}"`
    : `Pesan: "${req.message}"`

  try {
    const res = await anthropic.messages.create({
      model: SONNET,
      max_tokens: 500,
      system: TRIAGE_SYSTEM,
      messages: [{ role: "user", content: userContent }],
    })

    const text = extractText(res.content)
    const parsed = safeParseJson<RawTriage>(text)

    if (!parsed || typeof parsed.urgency_level !== "number") {
      console.error("[triage] unparseable output:", text)
      return FALLBACK
    }

    return {
      urgency_level:  clampLevel(parsed.urgency_level),
      is_emergency:   Boolean(parsed.is_emergency),
      reason:         parsed.reason ?? "",
      evidence:       Array.isArray(parsed.evidence) ? parsed.evidence : [],
      recommendation: parsed.recommendation ?? "",
    }
  } catch (err) {
    console.error("[triage] error:", err)
    return FALLBACK
  }
}
