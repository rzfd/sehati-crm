import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/conversations?filter=all|open|urgent|mine|ai_handled
// Returns conversation list dengan patient + last message preview untuk inbox.
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members")
      .select("id, clinic_id, role, linked_doctor_id")
      .eq("user_id", user.id)
      .maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff yang boleh akses." }, { status: 403 })

    const url    = new URL(req.url)
    const filter = url.searchParams.get("filter") ?? "all"

    let query = supabase
      .from("conversations")
      .select(`
        *,
        patient:patients(id, name, phone, is_new, tags),
        routed_doctor:doctors!conversations_routed_to_doctor_fkey(id, name, specialty)
      `)
      .eq("clinic_id", staff.clinic_id)
      .order("last_message_at", { ascending: false })
      .limit(100)

    if (filter === "open")       query = query.eq("status", "open")
    if (filter === "urgent")     query = query.gte("urgency_level", 3)
    if (filter === "mine")       query = query.eq("assigned_to", staff.id)
    if (filter === "ai_handled") query = query.eq("ai_handled", true)

    // Doctor assistant: filter ke conversations yang routed ke dokter mereka
    if (staff.role === "doctor_assistant" && staff.linked_doctor_id) {
      query = query.eq("routed_to_doctor", staff.linked_doctor_id)
    }

    const { data, error } = await query
    if (error) {
      console.error("[conversations GET]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const convs = data ?? []
    const ids = convs.map((c) => c.id)
    const previewMap = new Map<string, { content: string; sender_type: string; created_at: string }>()
    const allMessages: { conversation_id: string; sender_type: string; created_at: string }[] = []

    if (ids.length > 0) {
      const { data: messages } = await supabase
        .from("messages")
        .select("conversation_id, content, sender_type, created_at")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false })
      for (const m of messages ?? []) {
        allMessages.push(m as { conversation_id: string; sender_type: string; created_at: string })
        if (!previewMap.has(m.conversation_id)) {
          previewMap.set(m.conversation_id, {
            content: m.content, sender_type: m.sender_type, created_at: m.created_at,
          })
        }
      }
    }

    // Unread count per conversation untuk staff ini
    // conversation_reads belum di-generate type. Cast lewat any.
    const readsMap = new Map<string, string>()
    if (ids.length > 0) {
      const { data: reads } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (k: string, v: string) => {
              in: (k: string, v: string[]) => Promise<{ data: { conversation_id: string; last_read_at: string }[] | null }>
            }
          }
        }
      })
        .from("conversation_reads")
        .select("conversation_id, last_read_at")
        .eq("staff_id", staff.id)
        .in("conversation_id", ids)
      for (const r of reads ?? []) readsMap.set(r.conversation_id, r.last_read_at)
    }

    const result = convs.map((c) => {
      const lastReadAt = readsMap.get(c.id)
      const unreadCount = allMessages.filter((m) =>
        m.conversation_id === c.id
        && m.sender_type === "patient"  // hanya hitung pasien message sebagai "unread"
        && (!lastReadAt || m.created_at > lastReadAt)
      ).length
      return {
        ...c,
        last_message: previewMap.get(c.id) ?? null,
        unread_count: unreadCount,
      }
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/conversations GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
