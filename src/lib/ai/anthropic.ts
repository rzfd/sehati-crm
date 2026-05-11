import Anthropic from "@anthropic-ai/sdk"
import { AI_CONFIG } from "@/lib/constants"

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const HAIKU  = AI_CONFIG.HAIKU
export const SONNET = AI_CONFIG.SONNET
