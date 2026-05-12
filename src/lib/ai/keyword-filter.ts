import { URGENT_KEYWORDS, APP_CONFIG } from "@/lib/constants"

export type KeywordHit =
  | { kind: "urgent"; matched: string }
  | { kind: "staff_escape" }
  | { kind: "none" }

// Layer 1 dari 4-layer pipeline.
// Cek HARD blocklist sebelum panggilan AI manapun supaya respons instan & tidak
// pernah ditelan oleh false-negative classifier.
export function checkKeywordFilter(message: string): KeywordHit {
  const lower = message.toLowerCase()

  for (const kw of URGENT_KEYWORDS) {
    if (lower.includes(kw)) return { kind: "urgent", matched: kw }
  }

  // Pasien tulis "staff" persis → langsung minta manusia.
  if (lower.trim() === APP_CONFIG.SUPPORT_ESCAPE) {
    return { kind: "staff_escape" }
  }

  return { kind: "none" }
}
