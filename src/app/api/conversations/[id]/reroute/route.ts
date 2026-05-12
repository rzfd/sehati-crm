import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams { params: Promise<{ id: string }> }

// POST /api/conversations/[id]/reroute
// Body: { assigned_to?: string, routed_to_doctor?: string, notes?: string }
// Hanya staff yang boleh reroute. Patient call → 403.
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Verify caller is staff
    const { data: staff } = await supabase
      .from("staff_members")
      .select("id, clinic_id, role")
      .eq("user_id", user.id)
      .maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff yang boleh reroute." }, { status: 403 })

    const body = await req.json()
    const { assigned_to, routed_to_doctor, notes } = body

    const update: Record<string, unknown> = {}
    if (typeof assigned_to === "string")      update.assigned_to      = assigned_to
    if (assigned_to === null)                 update.assigned_to      = null
    if (typeof routed_to_doctor === "string") update.routed_to_doctor = routed_to_doctor
    if (routed_to_doctor === null)            update.routed_to_doctor = null

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("conversations")
      .update(update)
      .eq("id", id)
      .eq("clinic_id", staff.clinic_id)  // safety
      .select()
      .single()
    if (error) {
      console.error("[reroute]", error)
      return NextResponse.json({ error: "Gagal reroute." }, { status: 500 })
    }

    // Audit log message (sistem) untuk transparansi
    await supabase.from("messages").insert({
      conversation_id: id,
      sender_type:     "staff",
      sender_id:       staff.id,
      content:         notes
        ? `Conversation di-reroute oleh staff. Catatan: ${notes}`
        : "Conversation di-reroute oleh staff.",
      metadata: JSON.parse(JSON.stringify({
        action: "reroute",
        ...update,
      })),
    })

    return NextResponse.json({ conversation: data })
  } catch (err) {
    console.error("[api/conversations/reroute]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
