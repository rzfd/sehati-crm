"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/types/database"

interface UseRealtimeChatResult {
  messages: Message[]
  loading:  boolean
  error:    string | null
}

// Subscribe ke INSERT pada messages untuk conversation tertentu via Supabase Realtime.
// Saat conversationId berubah: reset messages SEGERA agar UI tidak flash data lama.
export function useRealtimeChat(conversationId: string | null): UseRealtimeChatResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const seenIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    // Reset SEGERA saat conversation berubah supaya tidak flash data lama
    setMessages([])
    setError(null)
    seenIds.current = new Set()

    if (!conversationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    /* eslint-enable react-hooks/set-state-in-effect */

    const id = conversationId
    let cancelled = false
    const supabase = createClient()

    async function load() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
      if (cancelled) return
      if (error) { setError(error.message); setLoading(false); return }
      const list = (data ?? []) as Message[]
      list.forEach((m) => seenIds.current.add(m.id))
      setMessages(list)
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`conversation:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const m = payload.new as Message
          if (seenIds.current.has(m.id)) return
          seenIds.current.add(m.id)
          setMessages((prev) => [...prev, m])
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  return { messages, loading, error }
}
