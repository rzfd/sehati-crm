import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

// PATCH /api/kb/qa/bulk
// Body: { ids: string[], status: 'draft'|'published'|'archived' }
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })
  const { data: staff } = await supabase
    .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (!staff || (staff.role !== "admin" && staff.role !== "manager")) {
    return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
  }

  const body = await req.json()
  const ids: string[] = Array.isArray(body.ids) ? body.ids : []
  const status = body.status
  if (ids.length === 0 || !["draft","published","archived"].includes(status)) {
    return NextResponse.json({ error: "ids dan status wajib." }, { status: 400 })
  }

  const { error, count } = await supabase
    .from("kb_qa_pairs")
    .update({ status }, { count: "exact" })
    .in("id", ids)
    .eq("clinic_id", staff.clinic_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(supabase, {
    clinic_id:   staff.clinic_id,
    actor_id:    staff.id,
    action:      "qa.bulk_status",
    metadata:    { count, status, ids },
  })

  return NextResponse.json({ ok: true, count })
}
