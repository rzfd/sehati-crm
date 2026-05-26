import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/push/subscribe — pasien simpan Web Push subscription (upsert by endpoint).
// Body: PushSubscription JSON { endpoint, keys: { p256dh, auth } }
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: patient } = await supabase
      .from("patients").select("id").eq("user_id", user.id).maybeSingle()
    if (!patient) return NextResponse.json({ error: "Hanya pasien." }, { status: 403 })

    const body = await req.json().catch(() => ({}))
    const endpoint = body?.endpoint as string | undefined
    const p256dh   = body?.keys?.p256dh as string | undefined
    const auth     = body?.keys?.auth as string | undefined
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Subscription tidak lengkap." }, { status: 400 })
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          patient_id: patient.id,
          endpoint,
          p256dh,
          auth,
          user_agent: req.headers.get("user-agent"),
        },
        { onConflict: "endpoint" },
      )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/push/subscribe]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
