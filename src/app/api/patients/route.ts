import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/patients?q= — search patients di clinic (staff only)
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("clinic_id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff." }, { status: 403 })

    const url = new URL(req.url)
    const q = (url.searchParams.get("q") ?? "").trim()
    if (!q) return NextResponse.json([])

    // ILIKE pada name + phone
    const { data, error } = await supabase
      .from("patients")
      .select("id, name, phone, date_of_birth, is_new, tags")
      .eq("clinic_id", staff.clinic_id)
      .is("deleted_at", null)
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
      .order("name", { ascending: true })
      .limit(30)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("[api/patients GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
