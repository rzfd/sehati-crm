import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"
import { BROADCAST_COMPOSE_SYSTEM } from "./prompts"

export interface BroadcastDraft {
  title: string
  body:  string
}

// Draft judul + isi broadcast dari tujuan kampanye (Haiku). Best-effort:
// kalau gagal/parse error → kembalikan string kosong (caller tampilkan error).
export async function composeBroadcast(goal: string, segmentLabel?: string): Promise<BroadcastDraft> {
  const userContent = `Tujuan kampanye: "${goal}"${segmentLabel ? `\nTarget penerima: ${segmentLabel}` : ""}`
  try {
    const res = await anthropic.messages.create({
      model:      HAIKU,
      max_tokens: 400,
      system:     BROADCAST_COMPOSE_SYSTEM,
      messages:   [{ role: "user", content: userContent }],
    })
    const parsed = safeParseJson<BroadcastDraft>(extractText(res.content))
    if (!parsed || typeof parsed.title !== "string" || typeof parsed.body !== "string") {
      return { title: "", body: "" }
    }
    return { title: parsed.title, body: parsed.body }
  } catch (err) {
    console.error("[broadcast-compose] error:", err)
    return { title: "", body: "" }
  }
}
