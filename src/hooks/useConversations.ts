"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Conversation } from "@/types/database"

interface UseConversationsResult {
  conversations: Conversation[]
  loading:       boolean
  error:         string | null
  refresh:       () => Promise<void>
  createConversation: (clinicId: string, patientId: string) => Promise<Conversation | null>
  getOrCreateOpenConversation: (clinicId: string, patientId: string) => Promise<Conversation | null>
}

// List conversations for current patient. Untuk staff use a different hook
// (inbox/useInbox) yang punya filter berbeda.
export function useConversations(patientId: string | null): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!patientId) {
      setConversations([])
      setLoading(false)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("patient_id", patientId)
      .order("last_message_at", { ascending: false })

    if (error) setError(error.message)
    else setConversations((data ?? []) as Conversation[])
    setLoading(false)
  }, [patientId])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh() }, [refresh])

  const createConversation = useCallback(async (clinicId: string, patientId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("conversations")
      .insert({ clinic_id: clinicId, patient_id: patientId, status: "open" })
      .select()
      .single()
    if (error) { setError(error.message); return null }
    await refresh()
    return data as Conversation
  }, [refresh])

  const getOrCreateOpenConversation = useCallback(async (clinicId: string, patientId: string) => {
    const supabase = createClient()
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("patient_id", patientId)
      .eq("status", "open")
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existing) return existing as Conversation
    return createConversation(clinicId, patientId)
  }, [createConversation])

  return { conversations, loading, error, refresh, createConversation, getOrCreateOpenConversation }
}
