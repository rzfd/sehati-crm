"use client"

import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { ChatBubble } from "@/components/chat/ChatBubble"
import { ChatInput } from "@/components/chat/ChatInput"
import { UrgentBanner } from "@/components/chat/UrgentBanner"
import { useRealtimeChat } from "@/hooks/useRealtimeChat"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { SenderType } from "@/lib/constants"
import type { Message } from "@/types/database"

interface Props {
  conversationId: string
  urgencyLevel:   number
  patientId:      string
}

interface AIMetadata {
  confidence?: number
  kb_sources?: Array<{ id: string; similarity: number }>
  decided_at?: string
  triage?:     { reason: string; evidence: string[]; recommendation: string; urgency_level: number } | null
  gatekeeper?: { category: string }
}

export function ConversationView({ conversationId, urgencyLevel, patientId }: Props) {
  const { staff } = useCurrentUser()
  const { messages, loading } = useRealtimeChat(conversationId)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Patient ID acknowledged via prop — staff messages saved against staff sender_id
  void patientId

  // Auto-scroll bottom
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, sending])

  // Cari triage metadata terakhir dari patient message untuk banner
  const latestTriage = findLatestTriage(messages)

  async function handleSend(text: string) {
    if (!staff) return
    setSending(true)
    try {
      const supabase = createClient()
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_type:     "staff",
        sender_id:       staff.id,
        content:         text,
      })
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {urgencyLevel >= 3 && latestTriage && (
        <UrgentBanner
          reason={latestTriage.reason}
          evidence={latestTriage.evidence}
          recommendation={latestTriage.recommendation}
        />
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
        {loading ? (
          <p className="text-sm text-gray-400 text-center">Memuat…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8">Belum ada pesan.</p>
        ) : (
          messages.map((m) => (
            <MessageRow key={m.id} message={m} staffRole={staff?.role} />
          ))
        )}
      </div>

      <ChatInput onSend={handleSend} placeholder="Tulis balasan ke pasien…" />
    </div>
  )
}

function MessageRow({ message, staffRole }: { message: Message; staffRole?: string }) {
  const aiMeta = parseAIMeta(message.metadata)
  const isAi = message.sender_type === "ai_bot"

  return (
    <div>
      <ChatBubble
        senderType={message.sender_type as SenderType}
        content={message.content}
        timestamp={format(new Date(message.created_at), "HH:mm")}
        staffRole={staffRole === "doctor_assistant" ? "asdok" : "default"}
      />
      {isAi && aiMeta && (
        <details className="mt-1 ml-2 text-[10px] text-gray-400">
          <summary className="cursor-pointer hover:text-teal-600">
            AI citation ({aiMeta.kb_sources?.length ?? 0} sumber, conf {aiMeta.confidence?.toFixed(2) ?? "-"})
          </summary>
          <div className="mt-1 ml-2 space-y-0.5">
            {aiMeta.kb_sources?.map((s) => (
              <div key={s.id}>· KB <span className="font-mono-id">{s.id.slice(0, 8)}</span> sim={s.similarity.toFixed(2)}</div>
            ))}
            {aiMeta.decided_at && <div>decided at: {aiMeta.decided_at}</div>}
          </div>
        </details>
      )}
    </div>
  )
}

function parseAIMeta(metadata: unknown): AIMetadata | null {
  if (!metadata || typeof metadata !== "object") return null
  return metadata as AIMetadata
}

function findLatestTriage(messages: Message[]): AIMetadata["triage"] | null {
  // Cari triage di metadata patient message terakhir (pipeline simpan triage di patient msg)
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.sender_type !== "patient") continue
    const meta = parseAIMeta(m.metadata)
    if (meta?.triage) return meta.triage
  }
  return null
}
