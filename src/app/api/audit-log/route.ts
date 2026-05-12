import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/audit-log — admin-only audit log viewer
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id, role").eq("user_id", user.id).maybeSingle()
    if (!staff || (staff.role !== "admin" && staff.role !== "manager")) {
      return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("audit_log")
      .select("id, action, target_type, target_id, metadata, created_at, actor:staff_members!audit_log_actor_id_fkey(id, name, role)")
      .eq("clinic_id", staff.clinic_id)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) {
      console.error("[audit-log]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("[api/audit-log]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
