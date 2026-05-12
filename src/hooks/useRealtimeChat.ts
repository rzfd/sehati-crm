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
// Loading bukan loading awal saja — juga mengisi history snapshot dari REST sebelum subscribe.
export function useRealtimeChat(conversationId: string | null): UseRealtimeChatResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const seenIds = useRef<Set<string>>(new Set())

  // Data-fetching effect: sync messages from DB + subscribe to realtime updates.
  useEffect(() => {
    if (!conversationId) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setMessages([])
      setLoading(false)
      /* eslint-enable react-hooks/set-state-in-effect */
      return
    }
    const id = conversationId
    let cancelled = false
    const supabase = createClient()
    seenIds.current = new Set()

    async function load() {
      setLoading(true)
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
