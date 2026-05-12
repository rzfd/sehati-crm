import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams { params: Promise<{ id: string }> }

// POST /api/conversations/[id]/read — mark as read (upsert last_read_at = now)
// conversation_reads belum di-generate ke type Database, cast lewat unknown.
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("id, clinic_id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })

    const { error } = await (supabase as unknown as {
      from: (t: string) => {
        upsert: (row: Record<string, unknown>, opts?: { onConflict?: string }) => Promise<{ error: { message: string } | null }>
      }
    })
      .from("conversation_reads")
      .upsert({
        conversation_id: id,
        staff_id:        staff.id,
        last_read_at:    new Date().toISOString(),
      }, { onConflict: "conversation_id,staff_id" })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/conversations/read]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
