import { anthropic, HAIKU } from "./anthropic"
import { GATEKEEPER_SYSTEM } from "./prompts"
import { URGENT_KEYWORDS } from "@/lib/constants"
import type { GatekeeperRequest, GatekeeperResult } from "@/types/ai"

export async function runGatekeeper(req: GatekeeperRequest): Promise<GatekeeperResult> {
  const lower = req.message.toLowerCase()

  // Layer 1: keyword blocklist — bypass AI entirely
  const isUrgent = URGENT_KEYWORDS.some((kw) => lower.includes(kw))
  if (isUrgent) {
    return { action: "escalate", category: "urgent", confidence: 1, reason: "URGENT_KEYWORD match" }
  }

  // Layer 2: patient escape hatch
  if (lower.trim() === "staff") {
    return { action: "escalate", category: "unclear", confidence: 1, reason: "Patient requested staff" }
  }

  try {
    const res = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 200,
      system: GATEKEEPER_SYSTEM,
      messages: [{ role: "user", content: req.message }],
    })

    const text = res.content[0].type === "text" ? res.content[0].text : ""
    const parsed = JSON.parse(text) as { category: GatekeeperResult["category"]; confidence: number; reason: string }

    // Layer 3: medical/complaint always escalates
    if (parsed.category === "medical" || parsed.category === "complaint") {
      return { action: "escalate", category: parsed.category, confidence: parsed.confidence, reason: parsed.reason }
    }

    // Layer 4: low confidence → escalate
    if (parsed.confidence < 0.75) {
      return { action: "escalate", category: parsed.category, confidence: parsed.confidence, reason: "Low confidence" }
    }

    const action = parsed.category === "booking" ? "booking_request" : "auto_reply"
    return { action, category: parsed.category, confidence: parsed.confidence, reason: parsed.reason }
  } catch (err) {
    console.error("[gatekeeper] error:", err)
    return { action: "escalate", category: "unclear", confidence: 0, reason: "Gatekeeper error" }
  }
}
