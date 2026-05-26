import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { notify, notificationContent } from "@/lib/notifications"

interface RouteParams { params: Promise<{ id: string }> }

// POST /api/conversations/[id]/messages
// Staff kirim balasan ke pasien: insert message + update conversation
// (last_message_at, auto-assign kalau belum). Kalau bukan internal note,
// buat notifikasi staff_reply untuk pasien (in-app + push).
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const content = typeof body.content === "string" ? body.content.trim() : ""
    const isInternal = body.is_internal === true
    if (!content) return NextResponse.json({ error: "Pesan kosong." }, { status: 400 })

    const { data: staff } = await supabase
      .from("staff_members").select("id, name, clinic_id").eq("user_id", user.id).maybeSingle()
    if (!staff) return NextResponse.json({ error: "Hanya staff yang bisa membalas." }, { status: 403 })

    const { data: conv } = await supabase
      .from("conversations").select("id, clinic_id, patient_id, assigned_to").eq("id", id).maybeSingle()
    if (!conv) return NextResponse.json({ error: "Percakapan tidak ditemukan." }, { status: 404 })
    if (conv.clinic_id !== staff.clinic_id) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }

    const { data: msg, error: msgErr } = await supabase
      .from("messages")
      .insert({
        conversation_id: id,
        sender_type:     "staff",
        sender_id:       staff.id,
        content,
        is_internal:     isInternal,
      })
      .select()
      .single()
    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })

    // Internal note tidak terlihat pasien → tidak update conv & tidak notif.
    if (!isInternal) {
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          ...(conv.assigned_to ? {} : { assigned_to: staff.id }),
        })
        .eq("id", id)

      await notify({
        clinicId:  conv.clinic_id,
        patientId: conv.patient_id,
        type:      "staff_reply",
        ...notificationContent("staff_reply", { staffName: staff.name }),
        metadata:  { conversation_id: id, message_id: msg.id },
      })
    }

    return NextResponse.json(msg)
  } catch (err) {
    console.error("[api/conversations/[id]/messages POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
