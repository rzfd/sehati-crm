"use client"

import { useEffect, useState } from "react"
import { useInboxStore } from "@/store/inboxStore"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { ChatList } from "@/components/inbox/ChatList"
import { ConversationView } from "@/components/inbox/ConversationView"
import { PatientDetail } from "@/components/inbox/PatientDetail"
import { SmartReplyPanel } from "@/components/chat/SmartReplyPanel"
import { createClient } from "@/lib/supabase/client"
import type { Conversation, Message } from "@/types/database"

export default function StaffInboxPage() {
  const activeId = useInboxStore((s) => s.activeId)
  const { staff } = useCurrentUser()
  const [conv, setConv] = useState<Conversation | null>(null)
  const [lastPatientMsg, setLastPatientMsg] = useState<Message | null>(null)

  useEffect(() => {
    if (!activeId) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setConv(null)
      setLastPatientMsg(null)
      /* eslint-enable react-hooks/set-state-in-effect */
      return
    }
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", activeId)
        .maybeSingle()
      if (cancelled) return
      setConv(data as Conversation | null)

      const { data: msg } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeId)
        .eq("sender_type", "patient")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (cancelled) return
      setLastPatientMsg(msg as Message | null)
    })()
    return () => { cancelled = true }
  }, [activeId])

  if (!staff) {
    return <div className="p-6 text-sm text-gray-500">Memuat sesi staff…</div>
  }

  return (
    <div className="grid grid-cols-[320px_1fr_320px] h-screen">
      <ChatList />

      {conv ? (
        <ConversationView
          conversationId={conv.id}
          urgencyLevel={conv.urgency_level}
          patientId={conv.patient_id}
        />
      ) : (
        <div className="flex items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-400">Pilih percakapan dari daftar.</p>
        </div>
      )}

      <aside className="bg-white border-l border-black/[0.08] overflow-y-auto scrollbar-thin">
        {conv ? (
          <>
            <PatientDetail
              patientId={conv.patient_id}
              conversationId={conv.id}
              clinicId={conv.clinic_id}
            />
            {lastPatientMsg && (
              <div className="p-3 border-t border-black/[0.06]">
                <SmartReplyPanel
                  patientMessage={lastPatientMsg.content}
                  clinicId={conv.clinic_id}
                  onUseReply={async (text) => {
                    const supabase = createClient()
                    await supabase.from("messages").insert({
                      conversation_id: conv.id,
                      sender_type:     "staff",
                      sender_id:       staff.id,
                      content:         text,
                    })
                    await supabase
                      .from("conversations")
                      .update({ last_message_at: new Date().toISOString() })
                      .eq("id", conv.id)
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <p className="p-6 text-sm text-gray-400">Pilih percakapan untuk lihat detail.</p>
        )}
      </aside>
    </div>
  )
}
