import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { composeBroadcast } from "@/lib/ai/broadcast-compose"

const ALLOWED = ["marketing", "admin", "manager"]
const SEG_LABEL: Record<string, string> = {
  all:    "semua pasien",
  new:    "pasien baru",
  doctor: "pasien dengan dokter tertentu",
  tag:    "pasien dengan tag tertentu",
}

// POST /api/broadcasts/compose — draft judul+isi broadcast dari tujuan kampanye.
// Body: { goal, segment_type? }
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("role").eq("user_id", user.id).maybeSingle()
    if (!staff || !ALLOWED.includes(staff.role)) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }

    const { goal, segment_type } = await req.json()
    if (!goal?.trim()) return NextResponse.json({ error: "Tujuan kampanye kosong." }, { status: 400 })

    const draft = await composeBroadcast(goal.trim(), segment_type ? SEG_LABEL[segment_type] : undefined)
    if (!draft.title && !draft.body) {
      return NextResponse.json({ error: "AI gagal membuat draft. Coba lagi." }, { status: 502 })
    }
    return NextResponse.json(draft)
  } catch (err) {
    console.error("[api/broadcasts/compose]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
