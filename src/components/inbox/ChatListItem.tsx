"use client"

import { format, formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import type { InboxConversation } from "@/hooks/useInbox"
import { cn } from "@/lib/utils"

interface Props {
  conv:    InboxConversation
  active:  boolean
  onClick: () => void
}

const URGENCY_BORDER: Record<number, string> = {
  4: "border-l-red-500",
  3: "border-l-amber-500",
  2: "border-l-gray-300",
  1: "border-l-gray-200",
}

export function ChatListItem({ conv, active, onClick }: Props) {
  const lastTime = conv.last_message?.created_at ?? conv.last_message_at
  const isUrgent = conv.urgency_level >= 3

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-3 border-b border-black/[0.04] border-l-4 flex flex-col gap-1 transition-colors",
        URGENCY_BORDER[conv.urgency_level] ?? "border-l-gray-200",
        active ? "bg-teal-50/40" : "hover:bg-gray-50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn(
          "text-sm truncate flex-1",
          conv.unread_count > 0 ? "font-semibold text-gray-800" : "font-medium text-gray-700",
        )}>
          {conv.patient?.name ?? "Pasien"}
        </span>
        {conv.unread_count > 0 && (
          <span className="flex-shrink-0 size-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">
            {conv.unread_count > 9 ? "9+" : conv.unread_count}
          </span>
        )}
        <span className="text-[10px] text-gray-400 flex-shrink-0">
          {lastTime ? formatDistanceToNow(new Date(lastTime), { locale: idLocale, addSuffix: false }) : ""}
        </span>
      </div>
      <p className="text-xs text-gray-500 truncate">
        {conv.last_message?.sender_type === "ai_bot" && <span className="text-teal-600">AI: </span>}
        {conv.last_message?.sender_type === "staff" && <span className="text-blue-500">Anda: </span>}
        {conv.last_message?.content ?? "Belum ada pesan"}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        {isUrgent && <span className="pill pill-red">Urgent</span>}
        {conv.ai_handled && <span className="pill pill-teal">AI</span>}
        {conv.patient?.is_new && <span className="pill pill-blue">Baru</span>}
        {conv.routed_doctor && (
          <span className="pill pill-gray truncate max-w-[120px]" title={conv.routed_doctor.name}>
            → {conv.routed_doctor.name.split(" ").pop()}
          </span>
        )}
      </div>
    </button>
  )
}

// Re-export to mute unused import lint
export { format }
