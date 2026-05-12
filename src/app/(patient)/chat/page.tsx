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
    return <div className="p-6 text-sm text-gray-500">Memuat percakapan…</div>
  }

  if (!patient) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Akun ini bukan pasien. <a href="/login" className="text-teal-600 underline">Login sebagai pasien</a> untuk pakai chat.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-black/[0.08] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="size-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">🏥</div>
        <div>
          <p className="text-sm font-medium text-gray-700">Tim Klinik</p>
          <p className="text-[11px] text-gray-500">Dibantu Asisten AI</p>
        </div>
      </header>

      <div className="px-4 py-2 bg-amber-50 text-[11px] text-amber-700 border-b border-amber-100">
        Untuk keadaan darurat, segera ke IGD terdekat. AI di sini tidak memberi diagnosis.
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {msgLoading ? (
          <p className="text-sm text-gray-400 text-center">Memuat pesan…</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-8 px-4 text-center">
            <EmptyChatIllustration className="w-48 h-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Sapa Tim Klinik 👋</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Tanya jam buka, biaya, BPJS, atau apapun tentang klinik. AI siap bantu 24/7.
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-4">
              <button onClick={() => handleSend("Apakah klinik buka hari ini?")} className="pill pill-teal text-[10px]">Jam buka?</button>
              <button onClick={() => handleSend("Berapa biaya konsul dokter umum?")} className="pill pill-teal text-[10px]">Biaya konsul?</button>
              <button onClick={() => handleSend("Apakah klinik menerima BPJS?")} className="pill pill-teal text-[10px]">BPJS?</button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                senderType={m.sender_type as SenderType}
                content={m.content}
                timestamp={format(new Date(m.created_at), "HH:mm")}
              />
            ))}
            {optimistic.map((o) => (
              <div key={o.id} className="opacity-60">
                <ChatBubble
                  senderType="patient"
                  content={o.content}
                  timestamp={format(new Date(o.ts), "HH:mm")}
                />
              </div>
            ))}
          </>
        )}
        {sending && <TypingIndicator label="AI sedang menganalisis…" />}
        {lastResult && lastResult.action !== "auto_reply" && !sending && (
          <PipelineHint result={lastResult} />
        )}
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 text-[11px] text-red-700 border-t border-red-100 flex-shrink-0">
          {error}
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={!conversationId}
        placeholder="Tanya tentang klinik…"
      />
    </div>
  )
}

// Catatan kecil setelah pipeline. Hanya tampil kalau bukan auto_reply (karena
// auto_reply akan langsung kirim bubble AI). Untuk escalate/booking_request,
// kasih tahu pasien bahwa staff akan respon.
function PipelineHint({ result }: { result: PipelineSummary }) {
  const message = (() => {
    if (result.action === "escalate") {
      return "Pesan Anda diteruskan ke staff klinik. Tim kami akan segera membalas."
    }
    if (result.action === "booking_request") {
      return "Permintaan booking Anda dicatat. Staff akan mengonfirmasi waktu yang tersedia."
    }
    return ""
  })()
  if (!message) return null
  return (
    <div className="flex justify-start">
      <div className="text-[11px] text-gray-500 bg-gray-100 rounded-lg px-3 py-1.5 max-w-[80%]">
        {message}
      </div>
    </div>
  )
}
