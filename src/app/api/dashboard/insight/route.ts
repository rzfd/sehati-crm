import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateInsight } from "@/lib/ai/dashboard-insight"

// POST /api/dashboard/insight — narasi insight dari metrik dashboard (staff).
// Body: metrik dari /api/dashboard (data milik klinik staff sendiri).
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })

    const m = await req.json()
    const insight = await generateInsight({
      total_conversations: Number(m.total_conversations) || 0,
      ai_handled_pct:      Number(m.ai_handled_pct) || 0,
      urgent_count:        Number(m.urgent_count) || 0,
      open_count:          Number(m.open_count) || 0,
      hit_rate:            Number(m.hit_rate) || 0,
      kb_coverage:         Number(m.kb_coverage) || 0,
      time_saved_minutes:  Number(m.time_saved_minutes) || 0,
      anomalies:           Array.isArray(m.anomalies) ? m.anomalies.map(String) : [],
    })
    if (!insight) return NextResponse.json({ error: "AI gagal membuat insight." }, { status: 502 })
    return NextResponse.json({ insight })
  } catch (err) {
    console.error("[api/dashboard/insight]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
