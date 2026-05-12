import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

interface RouteParams { params: Promise<{ id: string }> }

const VALID = ["open", "resolved", "archived"] as const

// PATCH /api/conversations/[id]/status — staff close/reopen/archive conversation
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })

    const body = await req.json()
    const status = body.status
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: `Status invalid. Pilih ${VALID.join("|")}.` }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("conversations")
      .update({ status })
      .eq("id", id)
      .eq("clinic_id", staff.clinic_id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit(supabase, {
      clinic_id:   staff.clinic_id,
      actor_id:    staff.id,
      action:      `conversation.${status}`,
      target_type: "conversation",
      target_id:   id,
    })

    return NextResponse.json({ conversation: data })
  } catch (err) {
    console.error("[api/conversations/status]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
