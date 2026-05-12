import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"
import { GATEKEEPER_SYSTEM } from "./prompts"
import { AI_CONFIG } from "@/lib/constants"
import type { GatekeeperRequest, GatekeeperResult } from "@/types/ai"

// Layer 2: AI classifier (Haiku, structured JSON).
// Layer 1 (keyword filter) sudah dijalankan oleh orchestrator sebelum sampai sini —
// fungsi ini fokus klasifikasi + confidence + escalation rules.
type RawClassification = {
  category:   GatekeeperResult["category"]
  confidence: number
  reason:     string
}

export async function runGatekeeper(req: GatekeeperRequest): Promise<GatekeeperResult> {
  try {
    const res = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 200,
      system: GATEKEEPER_SYSTEM,
      messages: [{ role: "user", content: req.message }],
    })

    const text = extractText(res.content)
    const parsed = safeParseJson<RawClassification>(text)

    if (!parsed || typeof parsed.confidence !== "number" || !parsed.category) {
      console.error("[gatekeeper] unparseable output:", text)
      return { action: "escalate", category: "unclear", confidence: 0, reason: "Unparseable classifier output" }
    }

    // Hard rule: gejala medis & complaint SELALU ke staff
    if (parsed.category === "medical" || parsed.category === "complaint" || parsed.category === "urgent") {
      return { action: "escalate", category: parsed.category, confidence: parsed.confidence, reason: parsed.reason }
    }

    // Layer 4 confidence gate (juga diterapkan kembali di pipeline setelah cek KB)
    if (parsed.confidence < AI_CONFIG.CONFIDENCE_THRESHOLD) {
      return { action: "escalate", category: parsed.category, confidence: parsed.confidence, reason: "Low confidence" }
    }

    const action = parsed.category === "booking" ? "booking_request" : "auto_reply"
    return { action, category: parsed.category, confidence: parsed.confidence, reason: parsed.reason }
  } catch (err) {
    console.error("[gatekeeper] error:", err)
    return { action: "escalate", category: "unclear", confidence: 0, reason: "Gatekeeper error" }
  }
}
