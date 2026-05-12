import { checkKeywordFilter } from "./keyword-filter"
import { runGatekeeper } from "./gatekeeper"
import { runTriage } from "./triage"
import { generateAutoReply } from "./auto-reply"
import { retrieveFromKB } from "@/lib/kb"
import type { PipelineRequest, PipelineResult, GatekeeperResult, KBMatch } from "@/types/ai"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export interface PipelineOptions {
  // Optional explicit client — required dari CLI scripts (di luar Next request scope).
  supabase?: SupabaseClient<Database>
}

// ── 4-layer pipeline orchestrator ─────────────────────────
// L1 keyword blocklist → L2 gatekeeper classifier → L3 KB retrieval → L4 confidence gate
// Triage (Sonnet) dijalankan paralel hanya saat L1 urgent atau L2 medical/urgent.
export async function runChatPipeline(req: PipelineRequest, opts: PipelineOptions = {}): Promise<PipelineResult> {
  // ── Layer 1: keyword filter (synchronous, instant) ──────
  const kw = checkKeywordFilter(req.message)

  if (kw.kind === "urgent") {
    // Pasien jelas darurat → jalankan triage paralel agar staff dapat konteks lengkap.
    const triage = await runTriage({
      message:        req.message,
      conversationId: req.conversationId ?? "",
      history:        req.history,
    })
    return {
      action:     "escalate",
      confidence: 1,
      gatekeeper: { action: "escalate", category: "urgent", confidence: 1, reason: `URGENT_KEYWORD: ${kw.matched}` },
      kbMatches:  [],
      triage,
      decidedAt:  "keyword",
      reason:     `Keyword darurat terdeteksi: "${kw.matched}"`,
    }
  }

  if (kw.kind === "staff_escape") {
    return {
      action:     "escalate",
      confidence: 1,
      gatekeeper: { action: "escalate", category: "unclear", confidence: 1, reason: "Patient requested staff" },
      kbMatches:  [],
      decidedAt:  "keyword",
      reason:     "Pasien minta staff manusia",
    }
  }

  // ── Layer 2 & 3 paralel: classifier + KB retrieval ──────
  // KB di-fetch eager karena murah relatif ke gatekeeper, dan dipakai kalau lolos ke L4.
  const [gatekeeper, kbMatches] = await Promise.all([
    runGatekeeper({
      message:        req.message,
      conversationId: req.conversationId ?? "",
      clinicId:       req.clinicId,
      patientId:      req.patientId ?? "",
    }),
    retrieveFromKB(req.message, req.clinicId, opts.supabase).catch((err) => {
      console.error("[pipeline] KB retrieval error:", err)
      return [] as KBMatch[]
    }),
  ])

  // Gatekeeper minta escalate (medical/urgent/complaint/unclear/low-conf)
  if (gatekeeper.action === "escalate") {
    const triage = await maybeRunTriage(gatekeeper, req)
    return {
      action:     "escalate",
      confidence: gatekeeper.confidence,
      gatekeeper,
      kbMatches,
      triage,
      decidedAt:  "gatekeeper",
      reason:     gatekeeper.reason,
    }
  }

  // Booking request — bukan auto-reply, juga bukan full escalate; route ke booking flow
  if (gatekeeper.action === "booking_request") {
    return {
      action:     "booking_request",
      confidence: gatekeeper.confidence,
      gatekeeper,
      kbMatches,
      decidedAt:  "gatekeeper",
      reason:     gatekeeper.reason,
    }
  }

  // ── Layer 4: auto-reply generation + confidence gate ────
  // generateAutoReply mengembalikan null jika model tandai not-answerable
  // atau confidence di bawah threshold — kasus itu escalate.
  if (!kbMatches.length) {
    return {
      action:     "escalate",
      confidence: gatekeeper.confidence,
      gatekeeper,
      kbMatches,
      decidedAt:  "kb",
      reason:     "KB tidak punya konteks relevan untuk pertanyaan ini",
    }
  }

  const autoReply = await generateAutoReply(req.message, kbMatches)
  if (!autoReply) {
    return {
      action:     "escalate",
      confidence: gatekeeper.confidence,
      gatekeeper,
      kbMatches,
      decidedAt:  "confidence",
      reason:     "Auto-reply tidak yakin atau KB tidak cukup — escalate ke staff",
    }
  }

  return {
    action:     "auto_reply",
    reply:      autoReply.reply,
    confidence: autoReply.confidence,
    gatekeeper,
    kbMatches,
    decidedAt:  "auto_reply",
    reason:     gatekeeper.reason,
  }
}

async function maybeRunTriage(gatekeeper: GatekeeperResult, req: PipelineRequest) {
  if (gatekeeper.category !== "medical" && gatekeeper.category !== "urgent") return undefined
  return runTriage({
    message:        req.message,
    conversationId: req.conversationId ?? "",
    history:        req.history,
  })
}
