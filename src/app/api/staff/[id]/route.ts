import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams { params: Promise<{ id: string }> }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Belum login.", status: 401 }
  const { data: staff, error } = await supabase
    .from("staff_members").select("clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (error) return { error: `Query staff gagal: ${error.message}`, status: 500 }
  if (!staff) return { error: "Akun ini bukan staff klinik. Login sebagai admin.", status: 403 }
  if (staff.role !== "admin" && staff.role !== "manager") {
    return { error: `Role '${staff.role}' tidak diizinkan.`, status: 403 }
  }
  return { supabase, staff }
}

// PATCH /api/staff/[id] — update role / linked_doctor_id / is_active / name
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.name === "string")              update.name             = body.name.trim()
  if (typeof body.role === "string")              update.role             = body.role
  if (typeof body.linked_doctor_id === "string")  update.linked_doctor_id = body.linked_doctor_id
  if (body.linked_doctor_id === null)             update.linked_doctor_id = null
  if (typeof body.is_active === "boolean")        update.is_active        = body.is_active

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 })
  }

  const { data, error } = await guard.supabase
    .from("staff_members")
    .update(update)
    .eq("id", id)
    .eq("clinic_id", guard.staff.clinic_id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/staff/[id] — soft delete
export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { error } = await guard.supabase
    .from("staff_members")
    .update({ is_active: false })
    .eq("id", id)
    .eq("clinic_id", guard.staff.clinic_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
