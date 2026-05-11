import { anthropic, HAIKU } from "./anthropic"
import { SMART_REPLY_SYSTEM } from "./prompts"
import type { SmartReplyResult } from "@/types/ai"

export async function generateSmartReplies(
  patientMessage: string,
  kbContext?: string
): Promise<SmartReplyResult> {
  const userContent = kbContext
    ? `Konteks KB:\n${kbContext}\n\nPesan pasien: "${patientMessage}"`
    : `Pesan pasien: "${patientMessage}"`

  try {
    const res = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 600,
      system: SMART_REPLY_SYSTEM,
      messages: [{ role: "user", content: userContent }],
    })

    const text = res.content[0].type === "text" ? res.content[0].text : ""
    return JSON.parse(text) as SmartReplyResult
  } catch (err) {
    console.error("[smart-reply] error:", err)
    return {
      formal:  "Terima kasih atas pesan Anda. Kami akan segera menghubungi Anda.",
      warm:    "Halo! Terima kasih sudah menghubungi kami. Tim kami akan segera membantu ya 😊",
      concise: "Terima kasih, kami akan segera merespons.",
    }
  }
}
