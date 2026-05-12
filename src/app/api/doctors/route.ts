import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/audit"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Belum login.", status: 401 }
  const { data: staff, error } = await supabase
    .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (error) {
    console.error("[requireAdmin]", error)
    return { error: `Query staff gagal: ${error.message}`, status: 500 }
  }
  if (!staff) {
    return { error: "Akun ini bukan staff klinik. Login sebagai admin.", status: 403 }
  }
  if (staff.role !== "admin" && staff.role !== "manager") {
    return { error: `Role '${staff.role}' tidak diizinkan. Butuh admin/manager.`, status: 403 }
  }
  return { supabase, staff }
}

// GET /api/doctors — list semua dokter (termasuk inactive) untuk admin
export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { data, error } = await guard.supabase
    .from("doctors")
    .select("*")
    .eq("clinic_id", guard.staff.clinic_id)
    .order("name", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/doctors — buat dokter baru
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  const { name, specialty, title, bio } = body
  if (!name?.trim() || !specialty?.trim()) {
    return NextResponse.json({ error: "Nama dan spesialisasi wajib." }, { status: 400 })
  }

  const { data, error } = await guard.supabase
    .from("doctors")
    .insert({
      clinic_id: guard.staff.clinic_id,
      name:      name.trim(),
      specialty: specialty.trim(),
      title:     title?.trim() || "dr.",
      bio:       bio?.trim() || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(guard.supabase, {
    clinic_id:   guard.staff.clinic_id,
    actor_id:    guard.staff.id,
    action:      "doctor.create",
    target_type: "doctor",
    target_id:   data.id,
    metadata:    { name, specialty },
  })

  return NextResponse.json(data, { status: 201 })
}
