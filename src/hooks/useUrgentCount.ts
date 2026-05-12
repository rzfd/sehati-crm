"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface UrgentCount {
  total:  number
  unread: number
}

// Track jumlah conversation urgent (level >= 3) untuk current clinic.
// Plus browser notification saat ada urgent baru (opt-in).
export function useUrgentCount(clinicId: string | null): UrgentCount {
  const [count, setCount] = useState<UrgentCount>({ total: 0, unread: 0 })
  const prevUrgentIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!clinicId) return
    let cancelled = false
    const supabase = createClient()

    async function refresh() {
      const res = await fetch("/api/conversations?filter=urgent")
      if (cancelled || !res.ok) return
      const list = (await res.json()) as Array<{ id: string; unread_count: number; urgency_level: number }>

      const urgentIds = new Set(list.map((c) => c.id))
      const newIds = [...urgentIds].filter((id) => !prevUrgentIds.current.has(id))

      if (prevUrgentIds.current.size > 0 && newIds.length > 0) {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Pesan urgent baru", {
              body:  `${newIds.length} chat butuh perhatian segera`,
              icon:  "/icons/icon-192.svg",
              tag:   "urgent-chat",
            })
          } catch {}
        }
      }
      prevUrgentIds.current = urgentIds

      setCount({
        total:  list.length,
        unread: list.reduce((sum, c) => sum + (c.unread_count > 0 ? 1 : 0), 0),
      })
    }

    refresh()

    const channel = supabase
      .channel("urgent-watcher")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => refresh())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => refresh())
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [clinicId])

  return count
}

// Request permission (call dari user gesture mis. button click)
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied")  return false
  const r = await Notification.requestPermission()
  return r === "granted"
}
