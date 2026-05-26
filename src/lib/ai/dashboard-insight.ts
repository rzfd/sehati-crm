import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"
import { DASHBOARD_INSIGHT_SYSTEM } from "./prompts"

export interface InsightMetrics {
  total_conversations: number
  ai_handled_pct:      number
  urgent_count:        number
  open_count:          number
  hit_rate:            number
  kb_coverage:         number
  time_saved_minutes:  number
  anomalies:           string[]
}

// Narasi insight dari metrik dashboard (Haiku). null kalau gagal/parse error.
export async function generateInsight(m: InsightMetrics): Promise<string | null> {
  const summary = [
    `Total chat 7 hari: ${m.total_conversations}`,
    `AI auto-handle: ${m.ai_handled_pct.toFixed(0)}%`,
    `Urgent: ${m.urgent_count}`,
    `Belum selesai: ${m.open_count}`,
    `KB hit rate: ${(m.hit_rate * 100).toFixed(0)}%`,
    `KB coverage: ${(m.kb_coverage * 100).toFixed(0)}%`,
    `Estimasi waktu staff dihemat: ${m.time_saved_minutes} menit`,
    m.anomalies.length ? `Anomali: ${m.anomalies.join("; ")}` : "Tidak ada anomali",
  ].join("\n")

  try {
    const res = await anthropic.messages.create({
      model:      HAIKU,
      max_tokens: 250,
      system:     DASHBOARD_INSIGHT_SYSTEM,
      messages:   [{ role: "user", content: summary }],
    })
    const parsed = safeParseJson<{ insight: string }>(extractText(res.content))
    if (!parsed || typeof parsed.insight !== "string" || !parsed.insight.trim()) return null
    return parsed.insight.trim()
  } catch (err) {
    console.error("[dashboard-insight] error:", err)
    return null
  }
}
