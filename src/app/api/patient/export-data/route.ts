import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/patient/export-data — patient download semua data mereka (JSON)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

  const { data: patient } = await supabase
    .from("patients").select("*").eq("user_id", user.id).maybeSingle()
  if (!patient) return NextResponse.json({ error: "Profil tidak ditemukan." }, { status: 404 })

  const [conversations, bookings, messages] = await Promise.all([
    supabase.from("conversations").select("*").eq("patient_id", patient.id),
    supabase.from("bookings").select("*").eq("patient_id", patient.id),
    supabase
      .from("messages")
      .select("conversation_id, sender_type, content, created_at, is_internal")
      .in("conversation_id",
        (await supabase.from("conversations").select("id").eq("patient_id", patient.id)).data?.map((c) => c.id) ?? []
      ),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    patient,
    conversations: conversations.data ?? [],
    bookings:      bookings.data ?? [],
    // Filter internal notes (tidak seharusnya kelihatan oleh patient — defense in depth)
    messages: (messages.data ?? []).filter((m) => !m.is_internal),
  }

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type":        "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="sehati-data-${patient.id.slice(0, 8)}.json"`,
    },
  })
}
