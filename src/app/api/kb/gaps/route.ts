import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/kb/gaps
// Returns "unanswered" patient queries — pesan pasien yang menyebabkan escalate
// via decided_at=kb (KB tidak punya konteks) atau decided_at=confidence (low conf).
// Tujuannya: admin tahu Q&A apa yang perlu ditambah.
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id, role").eq("user_id", user.id).maybeSingle()
    if (!staff || (staff.role !== "admin" && staff.role !== "manager")) {
      return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
    }

    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Ambil patient messages 30 hari yang escalate via kb/confidence
    const { data, error } = await supabase
      .from("messages")
      .select("id, content, created_at, conversation_id, metadata, conversations!inner(clinic_id, category)")
      .eq("sender_type", "patient")
      .gte("created_at", start)
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("[kb/gaps]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter di client side: decided_at in (kb, confidence)
    type Row = {
      id: string; content: string; created_at: string; conversation_id: string
      metadata: { decided_at?: string; gatekeeper?: { category?: string } } | null
      conversations: { clinic_id: string; category: string | null }
    }
    const rows = (data ?? []) as unknown as Row[]
    const gaps = rows.filter((r) => {
      if (r.conversations.clinic_id !== staff.clinic_id) return false
      const at = r.metadata?.decided_at
      return at === "kb" || at === "confidence"
    })

    // Group by similar content (simple normalisasi)
    const grouped = new Map<string, { content: string; count: number; latest: string; sample_ids: string[]; categories: Set<string> }>()
    for (const r of gaps) {
      const key = normalize(r.content)
      const cat = r.metadata?.gatekeeper?.category ?? "unknown"
      const existing = grouped.get(key)
      if (existing) {
        existing.count++
        if (r.created_at > existing.latest) existing.latest = r.created_at
        if (existing.sample_ids.length < 3) existing.sample_ids.push(r.id)
        existing.categories.add(cat)
      } else {
        grouped.set(key, {
          content:    r.content,
          count:      1,
          latest:     r.created_at,
          sample_ids: [r.id],
          categories: new Set([cat]),
        })
      }
    }

    const result = Array.from(grouped.values())
      .map((g) => ({ ...g, categories: Array.from(g.categories) }))
      .sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest))
      .slice(0, 30)

    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/kb/gaps]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim().slice(0, 80)
}
