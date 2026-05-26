import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"
import { DOC_QA_SYSTEM } from "./prompts"

export interface QAPair { question: string; answer: string }

// Ekstrak hingga 10 pasangan Q&A dari teks dokumen (Haiku). [] kalau gagal.
export async function extractQAFromText(text: string): Promise<QAPair[]> {
  try {
    const res = await anthropic.messages.create({
      model:      HAIKU,
      max_tokens: 1500,
      system:     DOC_QA_SYSTEM,
      messages:   [{ role: "user", content: text.slice(0, 8000) }],
    })
    const parsed = safeParseJson<{ pairs: QAPair[] }>(extractText(res.content))
    if (!parsed || !Array.isArray(parsed.pairs)) return []
    return parsed.pairs
      .filter((p) => p && typeof p.question === "string" && typeof p.answer === "string" && p.question.trim() && p.answer.trim())
      .slice(0, 10)
      .map((p) => ({ question: p.question.trim(), answer: p.answer.trim() }))
  } catch (err) {
    console.error("[doc-to-qa] error:", err)
    return []
  }
}
