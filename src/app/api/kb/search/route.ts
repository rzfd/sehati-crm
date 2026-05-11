import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { retrieveFromKB, formatKBContext } from "@/lib/kb"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })

    const { query, clinicId: clinicIdFromBody } = await req.json()
    if (!query?.trim()) {
      return NextResponse.json({ error: "Query wajib diisi." }, { status: 400 })
    }

    // Derive clinic from user if not provided (staff or patient)
    let clinicId: string | null = clinicIdFromBody ?? null
    if (!clinicId) {
      const { data: staff } = await supabase
        .from("staff_members")
        .select("clinic_id")
        .eq("user_id", user.id)
        .maybeSingle()
      if (staff) clinicId = staff.clinic_id
    }
    if (!clinicId) {
      const { data: patient } = await supabase
        .from("patients")
        .select("clinic_id")
        .eq("user_id", user.id)
        .maybeSingle()
      if (patient) clinicId = patient.clinic_id
    }
    if (!clinicId) {
      return NextResponse.json({ error: "Klinik tidak ditemukan untuk user ini." }, { status: 400 })
    }

    const matches = await retrieveFromKB(query, clinicId)
    const context = formatKBContext(matches)
    return NextResponse.json({ matches, context })
  } catch (err) {
    console.error("[api/kb/search]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
