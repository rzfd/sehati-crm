"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useInboxStore, type InboxFilter } from "@/store/inboxStore"

export interface InboxConversation {
  id:                string
  patient_id:        string
  status:            string
  category:          string | null
  urgency_level:     number
  ai_handled:        boolean
  routed_to_doctor:  string | null
  assigned_to:       string | null
  last_message_at:   string
  patient:           { id: string; name: string; phone: string | null; is_new: boolean; tags: string[] } | null
  routed_doctor:     { id: string; name: string; specialty: string } | null
  last_message:      { content: string; sender_type: string; created_at: string } | null
  unread_count:      number
}

interface UseInboxResult {
  conversations: InboxConversation[]
  loading:       boolean
  error:         string | null
  refresh:       () => Promise<void>
}

// Inbox conversation list dengan filter. Subscribe realtime untuk live updates.
export function useInbox(filter: InboxFilter): UseInboxResult {
  const [conversations, setConversations] = useState<InboxConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const refreshNonce = useInboxStore((s) => s.refreshNonce)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/conversations?filter=${filter}`)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Gagal memuat inbox.")
      setLoading(false)
      return
    }
    const data = (await res.json()) as InboxConversation[]
    setConversations(data)
    setLoading(false)
  }, [filter])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { refresh() }, [refresh, refreshNonce])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Realtime: refetch on conversation UPDATE (status change, urgency, assignment)
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("inbox-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => refresh(),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refresh])

  return { conversations, loading, error, refresh }
}

// Re-export filter type untuk convenience
export { type InboxFilter }
export const useInboxFilter = useInboxStore
