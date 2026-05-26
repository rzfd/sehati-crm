"use client"

import { useEffect, useState } from "react"
import { useInboxStore } from "@/store/inboxStore"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { ChatList } from "@/components/inbox/ChatList"
import { ConversationView } from "@/components/inbox/ConversationView"
import { PatientDetail } from "@/components/inbox/PatientDetail"
import { TriagePanel } from "@/components/inbox/TriagePanel"
import { SmartReplyPanel } from "@/components/chat/SmartReplyPanel"
import { ChatSummaryPanel } from "@/components/inbox/ChatSummaryPanel"
import { EmptyInboxIllustration } from "@/components/shared/Illustrations"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Conversation, Message } from "@/types/database"

export default function StaffInboxPage() {
  const activeId = useInboxStore((s) => s.activeId)
  const { staff } = useCurrentUser()
  const [conv, setConv] = useState<Conversation | null>(null)
  const [lastPatientMsg, setLastPatientMsg] = useState<Message | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [detailsTab, setDetailsTab] = useState<"patient" | "triage" | "reply" | "summary">("patient")

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
    return <div className="p-6 text-sm text-ink-muted">Memuat sesi staff…</div>
  }

  function refetchConv() {
    if (!conv) return
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("conversations").select("*").eq("id", conv.id).maybeSingle()
      setConv(data as Conversation | null)
    })()
  }

  // Layout: ChatList (320, scroll mandiri) | ConversationView (flex, scroll mandiri) | DetailsPanel overlay
  // Outer h-full overflow-hidden — page tidak scroll, fit ke parent main (di bawah breadcrumb).
  return (
    <div className="grid grid-cols-[320px_1fr] h-full max-h-full overflow-hidden relative bg-background dark:bg-surface-alt">
      <div className="min-w-0 min-h-0 h-full overflow-hidden">
        <ChatList />
      </div>

      <div className="relative min-w-0 min-h-0 h-full overflow-hidden">
        {conv ? (
          <ConversationView
            conversationId={conv.id}
            urgencyLevel={conv.urgency_level}
            status={conv.status as "open" | "resolved" | "archived"}
            patientId={conv.patient_id}
            onStatusChange={refetchConv}
            onToggleDetails={() => setShowDetails((v) => !v)}
            detailsOpen={showDetails}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-background dark:bg-surface-alt text-center p-6">
            <EmptyInboxIllustration className="w-56 h-auto mb-4 opacity-80" />
            <p className="text-base font-medium text-ink dark:text-ink-dim">Mulai percakapan</p>
            <p className="text-sm text-ink-muted dark:text-ink-dim mt-1 max-w-sm">
              Pilih chat dari daftar di kiri untuk lihat detail dan balas pasien.
            </p>
          </div>
        )}

        {/* Right details panel — overlay slide-in, toggle dari ConversationView header */}
        {conv && showDetails && (
          <>
            {/* Mobile/tablet backdrop */}
            <div
              className="absolute inset-0 bg-black/20 dark:bg-black/40 modal-backdrop z-10 lg:hidden"
              onClick={() => setShowDetails(false)}
            />
            <aside className={cn(
              "absolute right-0 top-0 bottom-0 z-20",
              "w-full sm:w-96 lg:w-80",
              "bg-surface dark:bg-surface-alt",
              "border-l border-border dark:border-border",
              "flex flex-col modal-content shadow-xl lg:shadow-none",
            )}>
              {/* Tab header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border dark:border-border flex-shrink-0">
                <div className="flex gap-1 text-xs">
                  <TabBtn active={detailsTab === "patient"} onClick={() => setDetailsTab("patient")}>Pasien</TabBtn>
                  {lastPatientMsg && <TabBtn active={detailsTab === "triage"}  onClick={() => setDetailsTab("triage")}>Triage</TabBtn>}
                  {lastPatientMsg && <TabBtn active={detailsTab === "reply"}   onClick={() => setDetailsTab("reply")}>AI Reply</TabBtn>}
                  <TabBtn active={detailsTab === "summary"} onClick={() => setDetailsTab("summary")}>Ringkasan</TabBtn>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  aria-label="Tutup panel"
                  className="size-7 rounded-md hover:bg-surface-alt dark:hover:bg-surface-alt flex items-center justify-center text-ink-muted"
                >
                  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4L4 12" />
                  </svg>
                </button>
              </div>

              {/* Tab content (scrollable) */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {detailsTab === "patient" && (
                  <PatientDetail
                    patientId={conv.patient_id}
                    conversationId={conv.id}
                    clinicId={conv.clinic_id}
                  />
                )}
                {detailsTab === "triage" && lastPatientMsg && (
                  <div className="p-3">
                    <TriagePanel message={lastPatientMsg.content} conversationId={conv.id} />
                  </div>
                )}
                {detailsTab === "reply" && lastPatientMsg && (
                  <div className="p-3">
                    <SmartReplyPanel
                      patientMessage={lastPatientMsg.content}
                      clinicId={conv.clinic_id}
                      onUseReply={async (text) => {
                        await fetch(`/api/conversations/${conv.id}/messages`, {
                          method:  "POST",
                          headers: { "Content-Type": "application/json" },
                          body:    JSON.stringify({ content: text }),
                        })
                        setShowDetails(false)
                      }}
                    />
                  </div>
                )}
                {detailsTab === "summary" && (
                  <ChatSummaryPanel conversationId={conv.id} />
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md transition-colors",
        active
          ? "bg-primary-soft dark:bg-primary/15 text-primary dark:text-primary font-medium"
          : "text-ink-muted hover:bg-surface-alt dark:hover:bg-surface-alt",
      )}
    >
      {children}
    </button>
  )
}
