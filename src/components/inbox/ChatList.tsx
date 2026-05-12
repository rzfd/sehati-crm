"use client"

import { ChatListItem } from "./ChatListItem"
import { useInbox } from "@/hooks/useInbox"
import { useInboxStore, type InboxFilter } from "@/store/inboxStore"
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

  return (
    <div className="flex flex-col h-full bg-white border-r border-black/[0.08]">
      <div className="p-3 border-b border-black/[0.08] flex gap-1.5 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = filter === f.value
          const count = f.value === "urgent" ? conversations.filter((c) => c.urgency_level >= 3).length : null
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "pill flex-shrink-0 transition-colors",
                active ? "pill-teal ring-1 ring-teal-400" : "pill-gray hover:bg-gray-200",
              )}
            >
              {f.label}
              {count !== null && count > 0 && <span className="ml-0.5 opacity-70">·{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {error && <p className="p-4 text-xs text-red-500">{error}</p>}
        {loading ? (
          <p className="p-4 text-sm text-gray-400">Memuat…</p>
        ) : conversations.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Tidak ada percakapan.</p>
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
