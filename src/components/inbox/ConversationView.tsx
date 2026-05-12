"use client"

import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { ChatBubble } from "@/components/chat/ChatBubble"
import { ChatInput } from "@/components/chat/ChatInput"
import { UrgentBanner } from "@/components/chat/UrgentBanner"
import { AIBookingCard } from "@/components/booking/AIBookingCard"
import { Avatar } from "@/components/shared/Avatar"
import { useRealtimeChat } from "@/hooks/useRealtimeChat"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useInboxStore } from "@/store/inboxStore"
import { cn } from "@/lib/utils"
import type { SenderType } from "@/lib/constants"
import type { Message } from "@/types/database"

interface Props {
  conversationId:  string
  urgencyLevel:    number
  status:          "open" | "resolved" | "archived"
  patientId:       string
  onStatusChange:  () => void
  onToggleDetails?: () => void
  detailsOpen?:    boolean
}

interface AIMetadata {
  confidence?:        number
  kb_sources?:        Array<{ id: string; similarity: number }>
  decided_at?:        string
  triage?:            { reason: string; evidence: string[]; recommendation: string; urgency_level: number } | null
  gatekeeper?:        { category: string }
  booking_suggestion?: BookingSuggestion
}

interface BookingSuggestion {
  doctor_id:    string | null
  doctor_name:  string | null
  specialty:    string | null
  date:         string | null
  time:         string | null
}

export function ConversationView({
  conversationId, urgencyLevel, status, patientId,
  onStatusChange, onToggleDetails, detailsOpen,
}: Props) {
  const { staff } = useCurrentUser()
  const { messages, loading } = useRealtimeChat(conversationId)
  const [sending, setSending] = useState(false)
  const [internalMode, setInternalMode] = useState(false)
  const [patientName, setPatientName] = useState<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const triggerInboxRefresh = useInboxStore((s) => s.triggerRefresh)

  // Load patient name untuk header
  useEffect(() => {
    if (!patientId) return
    const supabase = createClient()
    ;(async () => {
      const { data } = await supabase
        .from("patients").select("name").eq("id", patientId).maybeSingle()
      if (data) setPatientName(data.name)
    })()
  }, [patientId])

  // Auto-scroll ke bawah:
  //  - saat buka chat (conversationId/loading berubah)
  //  - saat pesan baru masuk (messages.length)
  //  - saat sedang kirim (typing indicator muncul)
  // Pakai rAF supaya DOM sudah painted sebelum set scrollTop, plus instant behavior
  // saat conversation switch (tidak smooth-scroll panjang yang janggal).
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const raf = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
    return () => cancelAnimationFrame(raf)
  }, [conversationId, loading, messages.length, sending])

  // Mark read + trigger inbox refresh supaya badge unread di ChatList ke-clear
  useEffect(() => {
    if (!conversationId || messages.length === 0) return
    fetch(`/api/conversations/${conversationId}/read`, { method: "POST" })
      .then(() => triggerInboxRefresh())
      .catch((e) => console.error("[mark read]", e))
  }, [conversationId, messages.length, triggerInboxRefresh])

  const latestTriage  = findLatestTriage(messages)
  const latestBooking = findLatestBookingSuggestion(messages)

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
        is_internal:     internalMode,
      })
      if (!internalMode) {
        const { data: conv } = await supabase
          .from("conversations").select("assigned_to").eq("id", conversationId).maybeSingle()
        await supabase
          .from("conversations")
          .update({
            last_message_at: new Date().toISOString(),
            ...(conv?.assigned_to ? {} : { assigned_to: staff.id }),
          })
          .eq("id", conversationId)
      }
    } finally {
      setSending(false)
    }
  }

  async function setStatus(newStatus: "open" | "resolved" | "archived") {
    await fetch(`/api/conversations/${conversationId}/status`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: newStatus }),
    })
    onStatusChange()
  }

  const isClosed = status === "resolved" || status === "archived"

  // Group messages by date untuk WhatsApp-style separator
  const grouped = groupByDate(messages)

  return (
    <div className="flex flex-col h-full bg-[#EFEAE2] dark:bg-neutral-950">
      {/* WhatsApp-style header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-teal-600 dark:bg-neutral-900 text-white flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={patientName || "Pasien"} size="md" status="online" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{patientName || "Pasien"}</p>
            <div className="flex items-center gap-1.5 text-[11px] opacity-90">
              <span className={cn(
                "inline-block",
                status === "open"     ? "text-amber-200" :
                status === "resolved" ? "text-teal-200" : "text-gray-300",
              )}>
                {status === "open" ? "● Open" : status === "resolved" ? "✓ Resolved" : "⏸ Archived"}
              </span>
              {urgencyLevel >= 3 && <span className="text-red-200">• Urgent {urgencyLevel}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {status === "open" && (
            <IconButton onClick={() => setStatus("resolved")} title="Tandai selesai">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          )}
          {status === "resolved" && (
            <IconButton onClick={() => setStatus("open")} title="Buka kembali">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path d="M4 8a6 6 0 1 1 1.5 4M4 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          )}
          {onToggleDetails && (
            <IconButton onClick={onToggleDetails} title="Detail pasien" active={detailsOpen}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4">
                <circle cx="10" cy="7" r="3"/>
                <path d="M4 17a6 6 0 0 1 12 0" strokeLinecap="round"/>
              </svg>
            </IconButton>
          )}
        </div>
      </header>

      {urgencyLevel >= 3 && latestTriage && (
        <div className="flex-shrink-0">
          <UrgentBanner
            reason={latestTriage.reason}
            evidence={latestTriage.evidence}
            recommendation={latestTriage.recommendation}
          />
        </div>
      )}

      {latestBooking && latestBooking.doctor_id && latestBooking.date && latestBooking.time && !isClosed && (
        <div className="px-4 pt-3 flex-shrink-0">
          <AIBookingCard
            suggestion={{
              doctor_id:   latestBooking.doctor_id,
              doctor_name: latestBooking.doctor_name ?? "",
              specialty:   latestBooking.specialty ?? "",
              date:        latestBooking.date,
              time:        latestBooking.time,
            }}
            conversationId={conversationId}
            onConfirmed={() => setStatus("resolved")}
            onRejected={() => { /* staff fall through to manual reply */ }}
          />
        </div>
      )}

      {/* Messages area — flex-1 + min-h-0 supaya scrollable di dalam flex parent.
          overscroll-contain mencegah scroll merembet ke parent (page / sidebar list). */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin px-4 py-4 space-y-1 chat-bg"
      >
        {loading ? (
          <p className="text-sm text-gray-400 text-center mt-8">Memuat…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-12">
            Belum ada pesan. Tulis balasan untuk memulai.
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <div className="flex justify-center my-3">
                <span className="text-[10px] bg-white/80 dark:bg-neutral-800/80 backdrop-blur text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full shadow-sm">
                  {group.label}
                </span>
              </div>
              {group.messages.map((m) => (
                <MessageRow key={m.id} message={m} staffRole={staff?.role} />
              ))}
            </div>
          ))
        )}
      </div>

      {isClosed ? (
        <div className="px-4 py-3 bg-gray-100 dark:bg-neutral-900 text-xs text-gray-500 dark:text-gray-400 text-center flex-shrink-0 border-t border-black/[0.04] dark:border-white/[0.04]">
          Percakapan ini sudah {status === "resolved" ? "diselesaikan" : "diarsipkan"}. Buka kembali untuk membalas.
        </div>
      ) : (
        <div className="flex-shrink-0">
          <div className={cn(
            "flex items-center justify-between gap-2 px-3 py-1.5 text-[11px] border-t",
            internalMode
              ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
              : "bg-gray-50 dark:bg-neutral-900 border-black/[0.04] dark:border-white/[0.04] text-gray-500",
          )}>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={internalMode}
                onChange={(e) => setInternalMode(e.target.checked)}
                className="accent-amber-500"
              />
              <span>📌 Internal note (tidak terlihat pasien)</span>
            </label>
          </div>
          <ChatInput
            onSend={handleSend}
            placeholder={internalMode ? "Catatan internal untuk tim…" : "Tulis balasan…"}
          />
        </div>
      )}
    </div>
  )
}

function IconButton({ children, onClick, title, active }: {
  children: React.ReactNode; onClick: () => void; title?: string; active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "size-9 rounded-full flex items-center justify-center transition-colors",
        active
          ? "bg-white/25"
          : "hover:bg-white/15",
      )}
    >
      {children}
    </button>
  )
}

function MessageRow({ message, staffRole }: { message: Message; staffRole?: string }) {
  const aiMeta = parseAIMeta(message.metadata)
  const isAi = message.sender_type === "ai_bot"

  if (message.is_internal) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-amber-100/90 dark:bg-amber-500/10 border border-amber-300/50 dark:border-amber-500/30 rounded-lg px-3 py-2 max-w-[85%]">
          <p className="text-[10px] text-amber-700 dark:text-amber-400 mb-0.5 font-medium">
            📌 Internal note · {format(new Date(message.created_at), "HH:mm")}
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="group">
      <ChatBubble
        senderType={message.sender_type as SenderType}
        content={message.content}
        timestamp={format(new Date(message.created_at), "HH:mm")}
        staffRole={staffRole === "doctor_assistant" ? "asdok" : "default"}
        isRead={message.is_read}
      />
      {isAi && aiMeta && aiMeta.kb_sources && aiMeta.kb_sources.length > 0 && (
        <details className="mt-0.5 ml-2 text-[10px] text-gray-400 dark:text-gray-500 max-w-[80%] opacity-0 group-hover:opacity-100 transition-opacity">
          <summary className="cursor-pointer hover:text-teal-600 dark:hover:text-teal-400">
            AI citation ({aiMeta.kb_sources.length} sumber, conf {aiMeta.confidence?.toFixed(2) ?? "-"})
          </summary>
          <div className="mt-1 ml-2 space-y-0.5">
            {aiMeta.kb_sources.map((s) => (
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
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.sender_type !== "patient") continue
    const meta = parseAIMeta(m.metadata)
    if (meta?.triage) return meta.triage
  }
  return null
}

function findLatestBookingSuggestion(messages: Message[]): BookingSuggestion | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.sender_type !== "patient") continue
    const meta = parseAIMeta(m.metadata)
    if (meta?.booking_suggestion) return meta.booking_suggestion
  }
  return null
}

function groupByDate(messages: Message[]): { label: string; messages: Message[] }[] {
  const groups: { label: string; messages: Message[] }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  for (const m of messages) {
    const d = new Date(m.created_at)
    d.setHours(0, 0, 0, 0)
    let label: string
    if (d.getTime() === today.getTime()) label = "Hari ini"
    else if (d.getTime() === yesterday.getTime()) label = "Kemarin"
    else label = format(new Date(m.created_at), "d MMMM yyyy")

    const last = groups[groups.length - 1]
    if (last && last.label === label) {
      last.messages.push(m)
    } else {
      groups.push({ label, messages: [m] })
    }
  }
  return groups
}
