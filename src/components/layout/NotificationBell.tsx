"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useNotifications } from "@/hooks/useNotifications"
import { PushOptIn } from "@/components/layout/PushOptIn"
import { cn } from "@/lib/utils"
import type { Notification } from "@/types/database"

const TYPE_ICON: Record<string, string> = {
  staff_reply:       "chat_bubble",
  booking_confirmed: "event_available",
  booking_cancelled: "event_busy",
  booking_completed: "task_alt",
  booking_reminder:  "notifications_active",
}

export function NotificationBell({ patientId }: { patientId: string | null }) {
  const router = useRouter()
  const { items, unread, markRead, markAllRead } = useNotifications(patientId)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Tutup dropdown saat klik di luar.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  function handleClick(n: Notification) {
    if (!n.read_at) markRead(n.id)
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
        className="relative size-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink-muted hover:text-primary transition-colors"
      >
        <span className="material-symbols-rounded text-[20px]">notifications</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[26rem] overflow-y-auto rounded-xl border border-border bg-surface shadow-lg z-50 modal-content">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-soft sticky top-0 bg-surface">
            <p className="text-card-title text-ink">Notifikasi</p>
            {unread > 0 && (
              <button onClick={() => markAllRead()} className="text-caption text-primary hover:underline">
                Tandai semua dibaca
              </button>
            )}
          </div>

          <PushOptIn />

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-body-sm text-ink-muted">Belum ada notifikasi.</div>
          ) : (
            <ul className="divide-y divide-border-soft">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-alt transition-colors",
                      !n.read_at && "bg-primary-soft/40",
                    )}
                  >
                    <span className="material-symbols-rounded text-[20px] text-primary shrink-0 mt-0.5">
                      {TYPE_ICON[n.type] ?? "notifications"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-md text-ink font-medium truncate">{n.title}</span>
                      <span className="block text-body-sm text-ink-muted line-clamp-2">{n.body}</span>
                      <span className="block text-caption text-ink-dim mt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: idLocale })}
                      </span>
                    </span>
                    {!n.read_at && <span className="size-2 rounded-full bg-danger shrink-0 mt-1.5" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
