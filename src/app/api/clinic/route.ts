import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Belum login.", status: 401 }
  const { data: staff } = await supabase
    .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (!staff) return { error: "Bukan staff.", status: 403 }
  if (staff.role !== "admin") return { error: "Hanya admin.", status: 403 }
  return { supabase, staff }
}

// GET /api/clinic — info klinik current admin
export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { data, error } = await guard.supabase
    .from("clinics").select("*").eq("id", guard.staff.clinic_id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/clinic — update klinik current admin
export async function PATCH(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.name === "string")     update.name     = body.name.trim()
  if (typeof body.address === "string")  update.address  = body.address.trim() || null
  if (typeof body.phone === "string")    update.phone    = body.phone.trim() || null
  if (typeof body.logo_url === "string") update.logo_url = body.logo_url.trim() || null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 })
  }

  const { data, error } = await guard.supabase
    .from("clinics").update(update).eq("id", guard.staff.clinic_id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(guard.supabase, {
    clinic_id:   guard.staff.clinic_id,
    actor_id:    guard.staff.id,
    action:      "clinic.update",
    target_type: "clinic",
    target_id:   guard.staff.clinic_id,
    metadata:    update,
  })

  return NextResponse.json(data)
}
