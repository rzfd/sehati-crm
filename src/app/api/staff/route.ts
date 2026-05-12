import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Belum login.", status: 401 }
  const { data: staff, error } = await supabase
    .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (error) return { error: `Query staff gagal: ${error.message}`, status: 500 }
  if (!staff) return { error: "Akun ini bukan staff klinik. Login sebagai admin.", status: 403 }
  if (staff.role !== "admin" && staff.role !== "manager") {
    return { error: `Role '${staff.role}' tidak diizinkan.`, status: 403 }
  }
  return { supabase, staff }
}

// GET /api/staff — list staff klinik dengan dokter terlink
export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { data, error } = await guard.supabase
    .from("staff_members")
    .select("*, linked_doctor:doctors!staff_members_linked_doctor_id_fkey(id, name, specialty)")
    .eq("clinic_id", guard.staff.clinic_id)
    .order("name", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/staff — buat staff + auth user
// Body: { name, email, password, role, linked_doctor_id? }
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  const { name, email, password, role, linked_doctor_id } = body
  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: "Nama, email, password, dan role wajib." }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 })
  }
  const validRoles = ["admin", "manager", "receptionist", "cs", "doctor_assistant", "marketing"]
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Role invalid." }, { status: 400 })
  }
  if (role === "doctor_assistant" && !linked_doctor_id) {
    return NextResponse.json({ error: "Asisten dokter harus dilink ke dokter." }, { status: 400 })
  }

  // Service role untuk admin.createUser
  const service = createServiceClient()
  const { data: authData, error: authErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authErr) {
    if (authErr.message.toLowerCase().includes("already")) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 })
    }
    return NextResponse.json({ error: "Gagal membuat akun." }, { status: 500 })
  }

  const { data, error } = await service
    .from("staff_members")
    .insert({
      user_id:          authData.user.id,
      clinic_id:        guard.staff.clinic_id,
      name:             name.trim(),
      role,
      linked_doctor_id: linked_doctor_id || null,
    })
    .select()
    .single()

  if (error) {
    await service.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
