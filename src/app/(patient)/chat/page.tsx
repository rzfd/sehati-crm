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
  const [lastResult, setLastResult] = useState<PipelineSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
          <p className="text-sm text-gray-400 text-center mt-8">
            Belum ada pesan. Mulai dengan menyapa Tim Klinik 👋
          </p>
        ) : (
          messages.map((m) => (
            <ChatBubble
              key={m.id}
              senderType={m.sender_type as SenderType}
              content={m.content}
              timestamp={format(new Date(m.created_at), "HH:mm")}
            />
          ))
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
