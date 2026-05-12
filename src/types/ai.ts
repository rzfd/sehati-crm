// types/ai.ts — AI pipeline request/response types

// ── Gatekeeper ────────────────────────────────────────────
export interface GatekeeperRequest {
  message:         string
  conversationId:  string
  clinicId:        string
  patientId:       string
}

export interface GatekeeperResult {
  action:     "auto_reply" | "escalate" | "booking_request"
  category:   "faq" | "booking" | "medical" | "urgent" | "complaint" | "unclear"
  confidence: number
  reason:     string
}

// ── RAG / KB retrieval ────────────────────────────────────
export interface KBMatch {
  id:          string
  content:     string
  similarity:  number
  source_type: "qa_pair" | "document_chunk"
  source_id:   string
}

export interface RAGContext {
  matches:    KBMatch[]
  used:       boolean
}

// ── Auto-reply ────────────────────────────────────────────
export interface AutoReplyResult {
  reply:      string
  confidence: number
  kb_sources: KBMatch[]
}

// ── Triage ────────────────────────────────────────────────
export interface TriageRequest {
  message:        string
  conversationId: string
  history?:       string[]
}

export interface TriageResult {
  urgency_level:  1 | 2 | 3 | 4
  is_emergency:   boolean
  reason:         string
  evidence:       string[]
  recommendation: string
}

// ── Doctor routing ────────────────────────────────────────
export interface RoutingResult {
  doctor_mention?:    string | null
  specialty_hint?:    string | null
  context_clue?:      string | null
  recommended_doctor?: string | null
}

// ── Smart reply ───────────────────────────────────────────
export interface SmartReplyResult {
  formal:  string
  warm:    string
  concise: string
}

// ── Pipeline (4-layer orchestrator) ───────────────────────
export type PipelineLayer = "keyword" | "gatekeeper" | "kb" | "confidence" | "auto_reply"

export interface PipelineRequest {
  message:         string
  clinicId:        string
  conversationId?: string
  patientId?:      string
  history?:        string[]
}

export interface PipelineResult {
  action:     "auto_reply" | "escalate" | "booking_request"
  reply?:     string
  confidence: number
  gatekeeper: GatekeeperResult
  kbMatches:  KBMatch[]
  triage?:    TriageResult
  decidedAt:  PipelineLayer
  reason:     string
}
