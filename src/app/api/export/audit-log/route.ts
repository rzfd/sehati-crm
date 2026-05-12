import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { csvResponse } from "@/lib/csv"

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

  const { data: staff } = await supabase
    .from("staff_members").select("clinic_id, role").eq("user_id", user.id).maybeSingle()
  if (!staff || (staff.role !== "admin" && staff.role !== "manager")) {
    return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
  }

  const url = new URL(req.url)
  const limit = Math.min(Number(url.searchParams.get("limit")) || 1000, 10000)

  const { data, error } = await supabase
    .from("audit_log")
    .select("created_at, action, target_type, target_id, metadata, actor:staff_members!audit_log_actor_id_fkey(name, role)")
    .eq("clinic_id", staff.clinic_id)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = {
    created_at: string; action: string; target_type: string | null; target_id: string | null
    metadata: unknown
    actor: { name: string; role: string } | null
  }
  const rows = ((data ?? []) as unknown as Row[]).map((r) => ({
    timestamp:   r.created_at,
    actor:       r.actor?.name ?? "system",
    actor_role:  r.actor?.role ?? "",
    action:      r.action,
    target_type: r.target_type ?? "",
    target_id:   r.target_id ?? "",
    metadata:    r.metadata ? JSON.stringify(r.metadata) : "",
  }))
  return csvResponse(`audit-log-${new Date().toISOString().slice(0, 10)}.csv`, rows as unknown as Record<string, unknown>[])
}
