import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!staff || !["admin", "manager"].includes(staff.role)) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 })
    }

    // ON DELETE CASCADE will remove chunks automatically
    const admin = createServiceClient()
    const { error } = await admin.from("kb_documents").delete().eq("id", id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/kb/documents DELETE]", err)
    return NextResponse.json({ error: "Gagal menghapus dokumen." }, { status: 500 })
  }
}
