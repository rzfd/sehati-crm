import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"
import { CONV_SUMMARY_SYSTEM } from "./prompts"

export type NextAction = "reply" | "book" | "route_doctor" | "escalate" | "resolve"

export interface ConversationSummary {
  summary:     string
  next_action: NextAction
  reason:      string
}

const VALID: NextAction[] = ["reply", "book", "route_doctor", "escalate", "resolve"]

// Ringkas percakapan + saran aksi untuk staff (Haiku). null kalau gagal.
export async function summarizeConversation(transcript: string): Promise<ConversationSummary | null> {
  try {
    const res = await anthropic.messages.create({
      model:      HAIKU,
      max_tokens: 400,
      system:     CONV_SUMMARY_SYSTEM,
      messages:   [{ role: "user", content: transcript }],
    })
    const parsed = safeParseJson<ConversationSummary>(extractText(res.content))
    if (!parsed || typeof parsed.summary !== "string") return null
    return {
      summary:     parsed.summary,
      next_action: VALID.includes(parsed.next_action) ? parsed.next_action : "reply",
      reason:      typeof parsed.reason === "string" ? parsed.reason : "",
    }
  } catch (err) {
    console.error("[conversation-summary] error:", err)
    return null
  }
}
