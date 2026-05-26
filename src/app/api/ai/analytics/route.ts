import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { classifyAnalyticsQuestion, type AnalyticsPeriod } from "@/lib/ai/analytics-intent"

const PERIOD_LABEL: Record<AnalyticsPeriod, string> = {
  today: "hari ini", "7d": "7 hari terakhir", "30d": "30 hari terakhir", all: "sepanjang waktu",
}
const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu", confirmed: "Terkonfirmasi", completed: "Selesai", no_show: "Tidak hadir", cancelled: "Dibatalkan",
}

function startISO(p: AnalyticsPeriod): string | null {
  const now = Date.now()
  if (p === "today") { const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString() }
  if (p === "7d")  return new Date(now - 7 * 86_400_000).toISOString()
  if (p === "30d") return new Date(now - 30 * 86_400_000).toISOString()
  return null
}
const startDate = (p: AnalyticsPeriod): string | null => startISO(p)?.slice(0, 10) ?? null

// POST /api/ai/analytics — "tanya data klinik" (NL → intent whitelist → metrik terhitung).
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })
    const clinicId = staff.clinic_id

    const { question } = await req.json()
    if (!question?.trim()) return NextResponse.json({ error: "Pertanyaan kosong." }, { status: 400 })

    const { intent, period } = await classifyAnalyticsQuestion(question.trim())
    const sISO  = startISO(period)
    const sDate = startDate(period)
    const pl    = PERIOD_LABEL[period]
    let answer = ""

    switch (intent) {
      case "new_patients": {
        let q = supabase.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId).is("deleted_at", null)
        if (sISO) q = q.gte("created_at", sISO)
        const { count } = await q
        answer = `Ada ${count ?? 0} pasien baru ${pl}.`
        break
      }
      case "bookings_total": {
        let q = supabase.from("bookings").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId)
        if (sDate) q = q.gte("booking_date", sDate)
        const { count } = await q
        answer = `Ada ${count ?? 0} booking ${pl}.`
        break
      }
      case "bookings_by_status": {
        let q = supabase.from("bookings").select("status").eq("clinic_id", clinicId)
        if (sDate) q = q.gte("booking_date", sDate)
        const { data } = await q
        const tally: Record<string, number> = {}
        for (const b of data ?? []) tally[b.status] = (tally[b.status] ?? 0) + 1
        const parts = Object.entries(tally).map(([s, n]) => `${STATUS_LABEL[s] ?? s}: ${n}`)
        answer = parts.length ? `Booking ${pl} — ${parts.join(", ")}.` : `Belum ada booking ${pl}.`
        break
      }
      case "busiest_doctor": {
        let q = supabase.from("bookings").select("doctor_id").eq("clinic_id", clinicId)
        if (sDate) q = q.gte("booking_date", sDate)
        const { data } = await q
        const tally: Record<string, number> = {}
        for (const b of data ?? []) if (b.doctor_id) tally[b.doctor_id] = (tally[b.doctor_id] ?? 0) + 1
        const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
        if (!top) { answer = `Belum ada booking ${pl}.`; break }
        const { data: doc } = await supabase.from("doctors").select("name, title").eq("id", top[0]).maybeSingle()
        answer = `Dokter tersibuk ${pl}: ${doc?.title ?? "dr."} ${doc?.name ?? "—"} dengan ${top[1]} booking.`
        break
      }
      case "no_show_rate": {
        let q = supabase.from("bookings").select("status").eq("clinic_id", clinicId).in("status", ["completed", "no_show"])
        if (sDate) q = q.gte("booking_date", sDate)
        const { data } = await q
        const total = (data ?? []).length
        const ns = (data ?? []).filter((b) => b.status === "no_show").length
        answer = total ? `Tingkat no-show ${pl}: ${((ns / total) * 100).toFixed(0)}% (${ns} dari ${total}).` : `Belum ada data kehadiran ${pl}.`
        break
      }
      case "conversations_total": {
        let q = supabase.from("conversations").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId)
        if (sISO) q = q.gte("created_at", sISO)
        const { count } = await q
        answer = `Ada ${count ?? 0} percakapan ${pl}.`
        break
      }
      case "ai_handled_rate": {
        let q = supabase.from("conversations").select("ai_handled").eq("clinic_id", clinicId)
        if (sISO) q = q.gte("created_at", sISO)
        const { data } = await q
        const total = (data ?? []).length
        const ai = (data ?? []).filter((c) => c.ai_handled).length
        answer = total ? `AI menangani ${((ai / total) * 100).toFixed(0)}% percakapan ${pl} (${ai} dari ${total}).` : `Belum ada percakapan ${pl}.`
        break
      }
      default:
        answer = "Maaf, pertanyaan itu di luar metrik yang tersedia. Coba tanya soal pasien baru, booking, dokter tersibuk, tingkat no-show, atau jumlah chat."
    }

    return NextResponse.json({ answer, intent, period })
  } catch (err) {
    console.error("[api/ai/analytics]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
