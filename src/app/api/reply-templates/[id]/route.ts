import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams { params: Promise<{ id: string }> }

async function guard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Belum login.", status: 401 }
  const { data: staff } = await supabase
    .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (!staff || (staff.role !== "admin" && staff.role !== "manager")) {
    return { error: "Hanya admin/manager.", status: 403 }
  }
  return { supabase, staff }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params
  const g = await guard()
  if ("error" in g) return NextResponse.json({ error: g.error }, { status: g.status })
  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.title === "string")    update.title    = body.title.trim()
  if (typeof body.content === "string")  update.content  = body.content.trim()
  if (typeof body.category === "string") update.category = body.category.trim() || null
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 })
  }
  const { data, error } = await g.supabase
    .from("reply_templates")
    .update(update)
    .eq("id", id)
    .eq("clinic_id", g.staff.clinic_id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const g = await guard()
  if ("error" in g) return NextResponse.json({ error: g.error }, { status: g.status })
  const { error } = await g.supabase
    .from("reply_templates").delete().eq("id", id).eq("clinic_id", g.staff.clinic_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// POST /api/reply-templates/[id] — bump usage_count (called saat template dipakai)
export async function POST(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })
  const { data: staff } = await supabase
    .from("staff_members").select("clinic_id").eq("user_id", user.id).maybeSingle()
  if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })

  const { data: current } = await supabase
    .from("reply_templates").select("usage_count").eq("id", id).maybeSingle()
  if (!current) return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 404 })

  await supabase
    .from("reply_templates")
    .update({ usage_count: current.usage_count + 1 })
    .eq("id", id)
    .eq("clinic_id", staff.clinic_id)
  return NextResponse.json({ ok: true })
}
