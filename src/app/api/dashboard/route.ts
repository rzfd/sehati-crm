import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/dashboard
// Returns aggregate metrics for staff dashboard:
//  - kpi cards (volume, AI handled, urgent, avg response)
//  - 7-day volume series
//  - AI performance breakdown
//  - threshold-based anomalies
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })

    const now = new Date()
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Konversasi 7 hari
    const { data: convs } = await supabase
      .from("conversations")
      .select("id, urgency_level, ai_handled, status, created_at")
      .eq("clinic_id", staff.clinic_id)
      .gte("created_at", start.toISOString())

    const convList = convs ?? []
    const total = convList.length
    const aiHandled = convList.filter((c) => c.ai_handled).length
    const urgent    = convList.filter((c) => c.urgency_level >= 3).length
    const open      = convList.filter((c) => c.status === "open").length

    // Volume per hari
    const series: Record<string, { ai: number; staff: number; total: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      series[key] = { ai: 0, staff: 0, total: 0 }
    }
    for (const c of convList) {
      const key = c.created_at.slice(0, 10)
      if (!series[key]) continue
      series[key].total++
      if (c.ai_handled) series[key].ai++
      else series[key].staff++
    }
    const volumeData = Object.entries(series).map(([day, v]) => ({
      day: day.slice(5),  // MM-DD
      ai: v.ai,
      staff: v.staff,
      total: v.total,
    }))

    // KB query logs untuk hit rate
    const { data: kbLogs } = await supabase
      .from("kb_query_logs")
      .select("similarity_score, was_used, created_at")
      .eq("clinic_id", staff.clinic_id)
      .gte("created_at", start.toISOString())
    const kbCount = kbLogs?.length ?? 0
    const kbUsed  = kbLogs?.filter((l) => l.was_used).length ?? 0
    const hitRate = kbCount > 0 ? kbUsed / kbCount : 0
    const avgSim  = kbCount > 0 ? (kbLogs!.reduce((a, b) => a + (b.similarity_score ?? 0), 0) / kbCount) : 0

    // KB coverage: published qa_pairs / total questions logged
    const { count: publishedCount } = await supabase
      .from("kb_qa_pairs")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", staff.clinic_id)
      .eq("status", "published")
    const kbCoverage = publishedCount && publishedCount > 0
      ? Math.min(1, (publishedCount as number) / Math.max(20, kbCount))
      : 0

    const aiPerformance = {
      total_conversations: total,
      ai_handled:          aiHandled,
      hit_rate:            hitRate,
      avg_confidence:      avgSim,
      kb_coverage:         kbCoverage,
      time_saved_minutes:  aiHandled * 5,  // estimasi 5 menit per AI-handled chat
    }

    // Threshold anomalies
    const anomalies: Array<{ type: string; message: string }> = []
    if (urgent > total * 0.15 && urgent > 3) {
      anomalies.push({ type: "urgency_spike", message: `${urgent} urgent dalam 7 hari (>15% volume)` })
    }
    const lastDay  = volumeData[volumeData.length - 1]?.total ?? 0
    const avgDay   = volumeData.reduce((a, b) => a + b.total, 0) / 7
    if (lastDay > avgDay * 1.8 && lastDay > 5) {
      anomalies.push({ type: "volume_spike", message: `Hari ini ${lastDay} chat, ~${Math.round((lastDay / Math.max(1, avgDay) - 1) * 100)}% di atas rata-rata` })
    }
    if (avgDay > 5 && aiHandled / total < 0.2) {
      anomalies.push({ type: "ai_drop", message: `AI hanya menangani ${((aiHandled / Math.max(1, total)) * 100).toFixed(0)}% — turun. Cek KB.` })
    }

    return NextResponse.json({
      kpi: {
        total_conversations: total,
        ai_handled_pct:      total > 0 ? (aiHandled / total) * 100 : 0,
        urgent_count:        urgent,
        open_count:          open,
      },
      volume:        volumeData,
      ai_performance: aiPerformance,
      anomalies,
    })
  } catch (err) {
    console.error("[api/dashboard]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
