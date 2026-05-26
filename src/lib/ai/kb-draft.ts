import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"
import { KB_DRAFT_SYSTEM } from "./prompts"

export interface KbDraftResult {
  answer:           string
  needs_human_info: boolean
  note:             string
}

const FAILSAFE: KbDraftResult = {
  answer:           "",
  needs_human_info: true,
  note:             "AI gagal membuat draft — silakan tulis jawaban manual.",
}

// Draft jawaban KB untuk sebuah pertanyaan pasien (Haiku), grounded ke konteks KB.
// Best-effort: kalau gagal/parse error, kembalikan fail-safe (needs_human_info).
export async function draftKbAnswer(query: string, kbContext?: string): Promise<KbDraftResult> {
  const userContent =
    `${kbContext ? `Konteks KB klinik:\n${kbContext}\n\n` : ""}Pertanyaan pasien yang perlu dijawab:\n"${query}"`
  try {
    const res = await anthropic.messages.create({
      model:      HAIKU,
      max_tokens: 500,
      system:     KB_DRAFT_SYSTEM,
      messages:   [{ role: "user", content: userContent }],
    })
    const parsed = safeParseJson<KbDraftResult>(extractText(res.content))
    if (!parsed || typeof parsed.answer !== "string") return FAILSAFE
    return {
      answer:           parsed.answer,
      needs_human_info: parsed.needs_human_info === true,
      note:             typeof parsed.note === "string" ? parsed.note : "",
    }
  } catch (err) {
    console.error("[kb-draft] error:", err)
    return FAILSAFE
  }
}
