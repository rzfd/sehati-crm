import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { summarizeConversation } from "@/lib/ai/conversation-summary"

interface RouteParams { params: Promise<{ id: string }> }

const LABEL: Record<string, string> = { patient: "Pasien", staff: "Staff", ai_bot: "AI" }

// POST /api/conversations/[id]/summary — ringkasan + next-best-action untuk staff.
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })

    const { data: conv } = await supabase
      .from("conversations").select("clinic_id").eq("id", id).maybeSingle()
    if (!conv || conv.clinic_id !== staff.clinic_id) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }

    const { data: msgs } = await supabase
      .from("messages")
      .select("sender_type, content, is_internal")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .limit(60)

    const transcript = (msgs ?? [])
      .filter((m) => !m.is_internal)
      .map((m) => `${LABEL[m.sender_type] ?? m.sender_type}: ${m.content}`)
      .join("\n")
    if (!transcript) return NextResponse.json({ error: "Belum ada pesan." }, { status: 400 })

    const summary = await summarizeConversation(transcript)
    if (!summary) return NextResponse.json({ error: "AI gagal meringkas. Coba lagi." }, { status: 502 })
    return NextResponse.json(summary)
  } catch (err) {
    console.error("[api/conversations/[id]/summary]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
