import { anthropic, SONNET } from "./anthropic"
import { TRIAGE_SYSTEM } from "./prompts"
import type { TriageRequest, TriageResult } from "@/types/ai"

export async function runTriage(req: TriageRequest): Promise<TriageResult> {
  const userContent = req.history?.length
    ? `Riwayat percakapan:\n${req.history.join("\n")}\n\nPesan terbaru: "${req.message}"`
    : `Pesan: "${req.message}"`

  try {
    const res = await anthropic.messages.create({
      model: SONNET,
      max_tokens: 400,
      system: TRIAGE_SYSTEM,
      messages: [{ role: "user", content: userContent }],
    })

    const text = res.content[0].type === "text" ? res.content[0].text : ""
    return JSON.parse(text) as TriageResult
  } catch (err) {
    console.error("[triage] error:", err)
    return {
      urgency_level: 3,
      is_emergency: false,
      reason: "Triage error — defaulting to high urgency",
      evidence: [],
      recommendation: "Hubungi pasien segera untuk klarifikasi",
    }
  }
}
