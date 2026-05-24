"use client"

import { ChatListItem } from "./ChatListItem"
import { PatientSearchBar } from "./PatientSearchBar"
import { useInbox } from "@/hooks/useInbox"
import { useInboxStore, type InboxFilter } from "@/store/inboxStore"
import { SkeletonListItem } from "@/components/shared/Skeleton"
import { EmptyInboxIllustration } from "@/components/shared/Illustrations"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { cn } from "@/lib/utils"

const FILTERS: { value: InboxFilter; label: string }[] = [
  { value: "all",        label: "Semua" },
  { value: "open",       label: "Open" },
  { value: "urgent",     label: "Urgent" },
  { value: "mine",       label: "Saya" },
  { value: "ai_handled", label: "AI" },
]

export function ChatList() {
  const filter   = useInboxStore((s) => s.filter)
  const setFilter = useInboxStore((s) => s.setFilter)
  const activeId  = useInboxStore((s) => s.activeId)
  const setActive = useInboxStore((s) => s.setActive)
  const { conversations, loading, error } = useInbox(filter)
  const { staff } = useCurrentUser()
  const isAsdokUnlinked = staff?.role === "doctor_assistant" && !staff.linked_doctor_id

  return (
    // h-full + overflow-hidden — boundary scroll. Setiap section internal: header fixed, list scroll.
    <div className="flex flex-col h-full overflow-hidden bg-surface dark:bg-surface-alt border-r border-border dark:border-border">
      {/* Header: search — fixed */}
      <div className="p-3 border-b border-border dark:border-border flex-shrink-0">
        <PatientSearchBar />
      </div>
      {/* Filters — fixed */}
      <div className="px-3 py-2 border-b border-border dark:border-border flex gap-1.5 overflow-x-auto flex-shrink-0">
        {FILTERS.map((f) => {
          const active = filter === f.value
          const count = f.value === "urgent" ? conversations.filter((c) => c.urgency_level >= 3).length : null
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "pill flex-shrink-0 transition-colors",
                active ? "pill-teal ring-1 ring-primary" : "pill-gray hover:bg-surface-dim dark:hover:bg-surface-alt",
              )}
            >
              {f.label}
              {count !== null && count > 0 && <span className="ml-0.5 opacity-70">·{count}</span>}
            </button>
          )
        })}
      </div>

      {/* List — flex-1 + min-h-0 + overscroll-contain agar scroll terbatas di sini saja */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin overscroll-contain">
        {error && <p className="p-4 text-xs text-danger">{error}</p>}
        {loading ? (
          <div>{Array.from({ length: 6 }).map((_, i) => <SkeletonListItem key={i} />)}</div>
        ) : conversations.length === 0 ? (
          isAsdokUnlinked ? (
            <div className="p-6 text-sm text-ink-muted text-center">
              <p className="font-medium text-ink dark:text-ink-dim mb-1">Belum di-link ke dokter</p>
              <p className="text-xs">Hubungi admin untuk link akun ini ke dokter yang Anda bantu.</p>
            </div>
          ) : staff?.role === "doctor_assistant" ? (
            <div className="p-6 text-sm text-ink-muted text-center">
              <p className="font-medium text-ink dark:text-ink-dim mb-1">Belum ada chat untuk dokter Anda</p>
              <p className="text-xs">Saat pasien tanya/booking untuk dokter yang Anda bantu, akan muncul di sini.</p>
            </div>
          ) : (
            <div className="p-6 text-center flex flex-col items-center">
              <EmptyInboxIllustration className="w-36 h-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-ink dark:text-ink-dim">Inbox kosong</p>
              <p className="text-xs text-ink-muted dark:text-ink-dim mt-1">
                Belum ada percakapan dengan filter ini.
              </p>
            </div>
          )
        ) : (
          conversations.map((c) => (
            <ChatListItem
              key={c.id}
              conv={c}
              active={c.id === activeId}
              onClick={() => setActive(c.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
