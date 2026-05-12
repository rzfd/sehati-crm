import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

async function getStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Belum login.", status: 401 }
  const { data: staff } = await supabase
    .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (!staff) return { error: "Hanya staff.", status: 403 }
  return { supabase, staff }
}

export async function GET() {
  const guard = await getStaff()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })
  const { data, error } = await guard.supabase
    .from("reply_templates")
    .select("*")
    .eq("clinic_id", guard.staff.clinic_id)
    .order("category", { ascending: true })
    .order("title", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const guard = await getStaff()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })
  if (guard.staff.role !== "admin" && guard.staff.role !== "manager") {
    return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
  }
  const body = await req.json()
  const { title, content, category } = body
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title dan content wajib." }, { status: 400 })
  }
  const { data, error } = await guard.supabase
    .from("reply_templates")
    .insert({
      clinic_id:  guard.staff.clinic_id,
      title:      title.trim(),
      content:    content.trim(),
      category:   category?.trim() || null,
      created_by: guard.staff.id,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(guard.supabase, {
    clinic_id:   guard.staff.clinic_id,
    actor_id:    guard.staff.id,
    action:      "template.create",
    target_type: "reply_template",
    target_id:   data.id,
  })

  return NextResponse.json(data, { status: 201 })
}
