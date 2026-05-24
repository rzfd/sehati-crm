"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useConversations } from "@/hooks/useConversations"
import { useRealtimeChat } from "@/hooks/useRealtimeChat"
import { ChatBubble } from "@/components/chat/ChatBubble"
import { ChatInput } from "@/components/chat/ChatInput"
import { TypingIndicator } from "@/components/chat/TypingIndicator"
import { EmptyChatIllustration } from "@/components/shared/Illustrations"
import type { SenderType } from "@/lib/constants"

type PipelineAction = "auto_reply" | "escalate" | "booking_request"

interface PipelineSummary {
  action:    PipelineAction
  reason:    string
  decidedAt: string
}

export default function PatientChatPage() {
  const router = useRouter()
  const { loading: userLoading, patient } = useCurrentUser()
  const { getOrCreateOpenConversation } = useConversations(patient?.id ?? null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [bootstrapping, setBootstrapping] = useState(true)
  const { messages, loading: msgLoading } = useRealtimeChat(conversationId)
  const [sending, setSending] = useState(false)
  const [optimistic, setOptimistic] = useState<{ id: string; content: string; ts: number }[]>([])
  const [lastResult, setLastResult] = useState<PipelineSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Hapus optimistic message yang sudah ada di realtime feed
  useEffect(() => {
    if (optimistic.length === 0) return
    const realContents = new Set(messages.filter((m) => m.sender_type === "patient").map((m) => m.content))
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setOptimistic((prev) => prev.filter((o) => !realContents.has(o.content)))
  }, [messages, optimistic.length])

  useEffect(() => {
    if (!userLoading && patient?.is_new) router.replace("/onboarding")
  }, [userLoading, patient, router])

  useEffect(() => {
    if (!patient) return
    let cancelled = false
    ;(async () => {
      const conv = await getOrCreateOpenConversation(patient.clinic_id, patient.id)
      if (cancelled) return
      setConversationId(conv?.id ?? null)
      setBootstrapping(false)
    })()
    return () => { cancelled = true }
  }, [patient, getOrCreateOpenConversation])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, sending, lastResult])

  async function handleSend(text: string) {
    if (!conversationId) return
    // Optimistic: tampil bubble pasien langsung
    const tempId = `temp-${Date.now()}`
    setOptimistic((prev) => [...prev, { id: tempId, content: text, ts: Date.now() }])
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ conversationId, message: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(`[${res.status}] ${data.error ?? "Gagal kirim pesan."}`)
        // Rollback optimistic
        setOptimistic((prev) => prev.filter((o) => o.id !== tempId))
        return
      }
      if (data.pipeline) {
        setLastResult({
          action:    data.pipeline.action,
          reason:    data.pipeline.reason,
          decidedAt: data.pipeline.decidedAt,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setSending(false)
    }
  }

  if (userLoading || bootstrapping) {
    return <div className="p-6 text-body-md text-ink-muted">Memuat percakapan…</div>
  }

  if (!patient) {
    return (
      <div className="p-6 text-body-md text-ink-muted">
        Akun ini bukan pasien. <a href="/login" className="text-primary underline">Login sebagai pasien</a> untuk pakai chat.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-surface border-b border-border px-4 h-topbar-height flex items-center gap-3 flex-shrink-0">
        <div className="relative">
          <div className="size-9 rounded-full bg-primary-soft flex items-center justify-center text-primary">
            <span className="material-symbols-rounded filled text-[20px]">local_hospital</span>
          </div>
          <span className="absolute bottom-0 right-0 size-2.5 bg-primary border-2 border-surface rounded-full online-dot" />
        </div>
        <div>
          <p className="text-card-title text-ink">Klinik Sehati Pratama</p>
          <p className="text-caption text-primary">Aktif sekarang · Dibantu Asisten AI</p>
        </div>
      </header>

      <div className="px-4 py-2 bg-warning-soft text-caption text-warning border-b border-warning/15">
        Untuk keadaan darurat, segera ke IGD terdekat. AI di sini tidak memberi diagnosis.
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-4 py-4 flex flex-col gap-4">
        {msgLoading ? (
          <p className="text-body-md text-ink-dim text-center">Memuat pesan…</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-8 px-4 text-center">
            <EmptyChatIllustration className="w-48 h-auto mb-3" />
            <p className="text-headline-sm text-ink">Sapa Tim Klinik 👋</p>
            <p className="text-body-md text-ink-muted mt-1 max-w-xs">
              Tanya jam buka, biaya, BPJS, atau apapun tentang klinik. AI siap bantu 24/7.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <button onClick={() => handleSend("Apakah klinik buka hari ini?")} className="pill-sukses hover:bg-primary-dim transition-colors">Jam buka?</button>
              <button onClick={() => handleSend("Berapa biaya konsul dokter umum?")} className="pill-sukses hover:bg-primary-dim transition-colors">Biaya konsul?</button>
              <button onClick={() => handleSend("Apakah klinik menerima BPJS?")} className="pill-sukses hover:bg-primary-dim transition-colors">BPJS?</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center my-1">
              <span className="text-caption px-3 py-1 bg-surface-alt rounded-full text-ink-muted">
                {format(new Date(), "'Hari ini' · EEE d MMM yyyy")}
              </span>
            </div>
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                senderType={m.sender_type as SenderType}
                content={m.content}
                timestamp={format(new Date(m.created_at), "HH:mm")}
              />
            ))}
            {optimistic.map((o) => (
              <ChatBubble
                key={o.id}
                senderType="patient"
                content={o.content}
                timestamp={format(new Date(o.ts), "HH:mm")}
                pending
              />
            ))}
          </>
        )}
        {sending && <TypingIndicator label="AI sedang menganalisis…" />}
      </div>

      {error && (
        <div className="px-4 py-2 bg-danger-soft text-caption text-danger border-t border-danger/15 flex-shrink-0">
          {error}
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={!conversationId}
        placeholder="Tulis pesan…"
      />
    </div>
  )
}

// Catatan: acknowledgment escalate/booking sekarang di-insert server-side sebagai
// pesan "Asisten AI" yang persist (lihat /api/chat) — tidak perlu hint sementara
// di klien lagi.
