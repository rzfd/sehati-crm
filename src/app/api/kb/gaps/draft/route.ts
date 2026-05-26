import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { retrieveFromKB, formatKBContext } from "@/lib/kb"
import { draftKbAnswer } from "@/lib/ai/kb-draft"

// POST /api/kb/gaps/draft — draft jawaban KB untuk sebuah gap (admin/manager).
// Body: { query }. Retrieve konteks KB (RAG) → Haiku draft.
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id, role").eq("user_id", user.id).maybeSingle()
    if (!staff || !["admin", "manager"].includes(staff.role)) {
      return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
    }

    const { query } = await req.json()
    if (!query?.trim()) return NextResponse.json({ error: "Query kosong." }, { status: 400 })

    // Konteks KB terkait (kalau Voyage gagal/429 → lanjut tanpa konteks).
    let kbContext = ""
    try {
      const matches = await retrieveFromKB(query, staff.clinic_id, supabase)
      kbContext = formatKBContext(matches)
    } catch (e) {
      console.error("[kb/gaps/draft] retrieve:", e)
    }

    const draft = await draftKbAnswer(query, kbContext)
    return NextResponse.json(draft)
  } catch (err) {
    console.error("[api/kb/gaps/draft]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
