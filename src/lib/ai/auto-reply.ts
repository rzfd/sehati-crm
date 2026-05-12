import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"
import { AUTO_REPLY_SYSTEM, buildAutoReplyUserPrompt } from "./prompts"
import { AI_CONFIG } from "@/lib/constants"
import type { AutoReplyResult, KBMatch } from "@/types/ai"

type RawAutoReply = {
  answerable: boolean
  reply:      string
  confidence: number
  reason:     string
}

// Layer 3+4: RAG-augmented reply generator dengan confidence gate.
// Mengembalikan null kalau model tandai not-answerable atau confidence di bawah threshold —
// kasus itu harus di-escalate oleh caller.
export async function generateAutoReply(
  patientMessage: string,
  kbMatches: KBMatch[],
): Promise<AutoReplyResult | null> {
  const kbContext = formatKBContext(kbMatches)
  const userPrompt = buildAutoReplyUserPrompt(patientMessage, kbContext)

  try {
    const res = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 500,
      system: AUTO_REPLY_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    })

    const text = extractText(res.content)
    const parsed = safeParseJson<RawAutoReply>(text)

    if (!parsed || typeof parsed.reply !== "string") {
      console.error("[auto-reply] unparseable output:", text)
      return null
    }

    if (!parsed.answerable) return null
    if (parsed.confidence < AI_CONFIG.CONFIDENCE_THRESHOLD) return null

    return {
      reply:      parsed.reply.trim(),
      confidence: parsed.confidence,
      kb_sources: kbMatches,
    }
  } catch (err) {
    console.error("[auto-reply] error:", err)
    return null
  }
}

function formatKBContext(matches: KBMatch[]): string {
  if (!matches.length) return ""
  return matches.map((m, i) => `[${i + 1}] (sim=${m.similarity.toFixed(2)}) ${m.content}`).join("\n\n")
}
