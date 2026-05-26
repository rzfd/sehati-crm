"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/types/database"

interface UseNotifications {
  items:       Notification[]
  loading:     boolean
  unread:      number
  markRead:    (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

// Notifikasi pasien: fetch + realtime subscribe (bell live-update), plus mark-read.
export function useNotifications(patientId: string | null): UseNotifications {
  const [items, setItems]     = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!patientId) return
    const supabase = createClient()
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(30)
    setItems((data ?? []) as Notification[])
    setLoading(false)
  }, [patientId])

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!patientId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`notifications:${patientId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `patient_id=eq.${patientId}` },
        () => load(),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [patientId, load])

  const unread = items.reduce((n, x) => n + (x.read_at ? 0 : 1), 0)

  const markRead = useCallback(async (id: string) => {
    const now = new Date().toISOString()
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: now } : n)))
    const supabase = createClient()
    await supabase.from("notifications").update({ read_at: now }).eq("id", id)
  }, [])

  const markAllRead = useCallback(async () => {
    if (!patientId) return
    const now = new Date().toISOString()
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })))
    const supabase = createClient()
    await supabase.from("notifications").update({ read_at: now }).eq("patient_id", patientId).is("read_at", null)
  }, [patientId])

  return { items, loading, unread, markRead, markAllRead }
}
