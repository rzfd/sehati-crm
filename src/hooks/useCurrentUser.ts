"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Patient, StaffMember } from "@/types/database"

interface CurrentUserState {
  loading:  boolean
  userId:   string | null
  patient:  Patient | null
  staff:    StaffMember | null
}

// Resolve auth user → linked patient OR staff_member untuk current clinic.
// Komponen patient bisa pakai .patient; staff bisa pakai .staff.
export function useCurrentUser() {
  const [state, setState] = useState<CurrentUserState>({
    loading: true, userId: null, patient: null, staff: null,
  })

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function run() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) setState({ loading: false, userId: null, patient: null, staff: null })
        return
      }

      const [{ data: patient }, { data: staff }] = await Promise.all([
        supabase.from("patients").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("staff_members").select("*").eq("user_id", user.id).maybeSingle(),
      ])

      if (cancelled) return
      setState({ loading: false, userId: user.id, patient: patient ?? null, staff: staff ?? null })
    }

    run()
    return () => { cancelled = true }
  }, [])

  return state
}
