import { anthropic, HAIKU } from "./anthropic"
import { ROUTING_SYSTEM } from "./prompts"
import { SPECIALTY_HINTS } from "@/lib/constants"
import type { RoutingResult } from "@/types/ai"

export async function runRouting(message: string): Promise<RoutingResult> {
  const lower = message.toLowerCase()

  // Fast keyword check before calling AI
  for (const [hint, specialty] of Object.entries(SPECIALTY_HINTS)) {
    if (lower.includes(hint)) {
      return { doctor_mention: null, specialty_hint: specialty, context_clue: null }
    }
  }

  try {
    const res = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 200,
      system: ROUTING_SYSTEM,
      messages: [{ role: "user", content: message }],
    })

    const text = res.content[0].type === "text" ? res.content[0].text : ""
    return JSON.parse(text) as RoutingResult
  } catch (err) {
    console.error("[routing] error:", err)
    return { doctor_mention: null, specialty_hint: null, context_clue: null }
  }
}
