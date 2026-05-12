import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

interface AuditLogParams {
  clinic_id:    string
  actor_id?:    string | null
  action:       string
  target_type?: string
  target_id?:   string
  metadata?:    Record<string, unknown>
}

// Lightweight audit logger. Pakai supabase client yang sudah authenticated (admin/staff).
// Tidak throw kalau gagal — audit log gagal tidak boleh blok main flow.
export async function logAudit(
  supabase: SupabaseClient<Database>,
  params: AuditLogParams,
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_log").insert({
      clinic_id:   params.clinic_id,
      actor_id:    params.actor_id ?? null,
      action:      params.action,
      target_type: params.target_type ?? null,
      target_id:   params.target_id ?? null,
      metadata:    params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
    })
    if (error) console.error("[audit]", error.message)
  } catch (err) {
    console.error("[audit] unexpected:", err)
  }
}
