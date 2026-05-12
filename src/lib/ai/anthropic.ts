import Anthropic from "@anthropic-ai/sdk"
import { AI_CONFIG } from "@/lib/constants"

// Lazy singleton — ANTHROPIC_API_KEY mungkin di-load setelah modul ini diresolve
// (mis. script CLI yang baca .env.local secara manual).
let _client: Anthropic | null = null
export function getAnthropic(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// Proxy untuk backward-compat — fungsi lama bisa tetap pakai `anthropic.messages.create(...)`
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop, receiver) {
    return Reflect.get(getAnthropic(), prop, receiver)
  },
})

export const HAIKU  = AI_CONFIG.HAIKU
export const SONNET = AI_CONFIG.SONNET

// ── JSON helpers ───────────────────────────────────────────
// Haiku/Sonnet kadang membungkus JSON dalam ```json ... ``` walau diminta plain.
export function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim()
}

export function stripJsonFences(raw: string): string {
  let s = raw.trim()
  const fenceMatch = s.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) s = fenceMatch[1].trim()
  const first = s.indexOf("{")
  const last  = s.lastIndexOf("}")
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1)
  }
  return s.trim()
}

export function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(stripJsonFences(raw)) as T
  } catch {
    return null
  }
}
