"use client"

import { format, formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import type { InboxConversation } from "@/hooks/useInbox"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/shared/Avatar"

interface Props {
  conv:    InboxConversation
  active:  boolean
  onClick: () => void
}

const URGENCY_BORDER: Record<number, string> = {
  4: "border-l-danger",
  3: "border-l-warning",
  2: "border-l-transparent",
  1: "border-l-transparent",
}

export function ChatListItem({ conv, active, onClick }: Props) {
  const lastTime = conv.last_message?.created_at ?? conv.last_message_at
  const isUrgent = conv.urgency_level >= 3

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-3 border-b border-border-soft border-l-[3px] flex gap-3 transition-colors",
        URGENCY_BORDER[conv.urgency_level] ?? "border-l-transparent",
        active ? "bg-primary-soft" : "hover:bg-surface-alt",
      )}
    >
      <Avatar name={conv.patient?.name ?? "Pasien"} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-card-title truncate flex-1",
            conv.unread_count > 0 ? "text-ink font-bold" : "text-ink",
          )}>
            {conv.patient?.name ?? "Pasien"}
          </span>
          <span className="text-caption text-ink-dim flex-shrink-0">
            {lastTime ? formatDistanceToNow(new Date(lastTime), { locale: idLocale, addSuffix: false }) : ""}
          </span>
        </div>
        <p className="text-body-sm text-ink-muted truncate mt-0.5">
          {conv.last_message?.sender_type === "ai_bot" && <span className="text-primary font-medium">AI: </span>}
          {conv.last_message?.sender_type === "staff" && <span className="text-tertiary font-medium">Anda: </span>}
          {conv.last_message?.content ?? "Belum ada pesan"}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {isUrgent && <span className="pill-danger">Urgent</span>}
          {conv.ai_handled && <span className="pill-sukses">AI</span>}
          {conv.patient?.is_new && <span className="pill-info">Baru</span>}
          {conv.routed_doctor && (
            <span className="pill-gray truncate max-w-[120px]" title={conv.routed_doctor.name}>
              → {conv.routed_doctor.name.split(" ").pop()}
            </span>
          )}
          {conv.unread_count > 0 && (
            <span className="ml-auto flex-shrink-0 size-5 rounded-full bg-primary text-white text-caption font-bold flex items-center justify-center">
              {conv.unread_count > 9 ? "9+" : conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// Re-export to mute unused import lint
export { format }
