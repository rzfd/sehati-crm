import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { notifyMany } from "@/lib/notifications"
import { logAudit } from "@/lib/audit"

const ALLOWED  = ["marketing", "admin", "manager"]
const SEGMENTS = ["all", "new", "doctor", "tag"]

// GET /api/broadcasts — riwayat broadcast klinik.
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
    if (!staff || !ALLOWED.includes(staff.role)) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }

    const { data } = await supabase
      .from("broadcasts").select("*").eq("clinic_id", staff.clinic_id)
      .order("created_at", { ascending: false }).limit(50)
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("[api/broadcasts GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/broadcasts — kirim campaign, atau { dryRun: true } untuk preview jumlah penerima.
// Body: { title, body, link?, segment_type, segment_value?, dryRun? }
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
    if (!staff || !ALLOWED.includes(staff.role)) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 })
    }

    const b = await req.json().catch(() => ({}))
    const dryRun       = b.dryRun === true
    const segmentType  = String(b.segment_type ?? "")
    const segmentValue = b.segment_value != null ? String(b.segment_value) : null
    if (!SEGMENTS.includes(segmentType)) {
      return NextResponse.json({ error: "Segmen tidak valid." }, { status: 400 })
    }
    if ((segmentType === "doctor" || segmentType === "tag") && !segmentValue) {
      return NextResponse.json({ error: "Pilih nilai segmen." }, { status: 400 })
    }

    const db = createServiceClient()
    // Resolve penerima (service role → semua pasien klinik, kecuali yang sudah dihapus).
    let q = db.from("patients").select("id").eq("clinic_id", staff.clinic_id).is("deleted_at", null)
    if (segmentType === "new")    q = q.eq("is_new", true)
    if (segmentType === "doctor") q = q.eq("primary_doctor_id", segmentValue!)
    if (segmentType === "tag")    q = q.contains("tags", [segmentValue!])
    const { data: patients, error: pErr } = await q
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
    const ids = (patients ?? []).map((p) => p.id)

    if (dryRun) return NextResponse.json({ count: ids.length })

    const title = String(b.title ?? "").trim()
    const body  = String(b.body ?? "").trim()
    const link  = b.link ? String(b.link).trim() : null
    if (!title || !body) return NextResponse.json({ error: "Judul & isi wajib." }, { status: 400 })
    if (ids.length === 0) return NextResponse.json({ error: "Tidak ada penerima pada segmen ini." }, { status: 400 })

    const { data: rec, error: recErr } = await db
      .from("broadcasts")
      .insert({
        clinic_id:       staff.clinic_id,
        created_by:      staff.id,
        title, body, link,
        segment_type:    segmentType,
        segment_value:   segmentValue,
        recipient_count: ids.length,
      })
      .select()
      .single()
    if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 })

    await notifyMany(staff.clinic_id, ids, {
      type: "broadcast",
      title, body,
      link: link ?? "/home",
      metadata: { broadcast_id: rec.id },
    })

    await logAudit(supabase, {
      clinic_id:   staff.clinic_id,
      actor_id:    staff.id,
      action:      "broadcast.sent",
      target_type: "broadcast",
      target_id:   rec.id,
      metadata:    { segment_type: segmentType, segment_value: segmentValue, recipient_count: ids.length },
    })

    return NextResponse.json({ id: rec.id, count: ids.length })
  } catch (err) {
    console.error("[api/broadcasts POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
