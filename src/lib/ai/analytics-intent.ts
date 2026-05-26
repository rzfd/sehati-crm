import { anthropic, HAIKU, extractText, safeParseJson } from "./anthropic"
import { ANALYTICS_INTENT_SYSTEM } from "./prompts"

export const ANALYTICS_INTENTS = [
  "new_patients", "bookings_total", "bookings_by_status", "busiest_doctor",
  "no_show_rate", "conversations_total", "ai_handled_rate", "unknown",
] as const
export type AnalyticsIntent = typeof ANALYTICS_INTENTS[number]

export const ANALYTICS_PERIODS = ["today", "7d", "30d", "all"] as const
export type AnalyticsPeriod = typeof ANALYTICS_PERIODS[number]

export interface AnalyticsQuery { intent: AnalyticsIntent; period: AnalyticsPeriod }

// Petakan pertanyaan NL → {intent (whitelist), period} (Haiku). Aman: tidak ada SQL bebas.
export async function classifyAnalyticsQuestion(question: string): Promise<AnalyticsQuery> {
  try {
    const res = await anthropic.messages.create({
      model:      HAIKU,
      max_tokens: 100,
      system:     ANALYTICS_INTENT_SYSTEM,
      messages:   [{ role: "user", content: question }],
    })
    const parsed = safeParseJson<AnalyticsQuery>(extractText(res.content))
    const intent: AnalyticsIntent =
      parsed && (ANALYTICS_INTENTS as readonly string[]).includes(parsed.intent) ? parsed.intent : "unknown"
    const period: AnalyticsPeriod =
      parsed && (ANALYTICS_PERIODS as readonly string[]).includes(parsed.period) ? parsed.period : "30d"
    return { intent, period }
  } catch (err) {
    console.error("[analytics-intent] error:", err)
    return { intent: "unknown", period: "30d" }
  }
}
