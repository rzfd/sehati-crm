import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { embedBatch } from "@/lib/voyage"
import { extractQAFromText } from "@/lib/ai/doc-to-qa"
import { logAudit } from "@/lib/audit"

export const runtime = "nodejs"
export const maxDuration = 60

interface RouteParams { params: Promise<{ id: string }> }

// POST /api/kb/documents/[id]/extract-qa — generate draft Q&A dari isi dokumen (admin/manager).
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members").select("id, clinic_id, role").eq("user_id", user.id).maybeSingle()
    if (!staff || !["admin", "manager"].includes(staff.role)) {
      return NextResponse.json({ error: "Hanya admin/manager." }, { status: 403 })
    }

    const { data: doc } = await supabase
      .from("kb_documents").select("id, clinic_id").eq("id", id).maybeSingle()
    if (!doc || doc.clinic_id !== staff.clinic_id) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 })
    }

    const { data: chunks } = await supabase
      .from("kb_document_chunks").select("content").eq("document_id", id).order("chunk_index", { ascending: true }).limit(30)
    const text = (chunks ?? []).map((c) => c.content).join("\n\n").slice(0, 8000)
    if (!text.trim()) return NextResponse.json({ error: "Dokumen kosong / belum diproses." }, { status: 400 })

    const pairs = await extractQAFromText(text)
    if (pairs.length === 0) return NextResponse.json({ error: "AI tidak menemukan Q&A dari dokumen ini." }, { status: 502 })

    // Embed semua pair dalam SATU batch (hormati rate limit Voyage 3 RPM).
    const vecs = await embedBatch(pairs.map((p) => `Q: ${p.question}\nA: ${p.answer}`), "document")
    const rows = pairs.map((p, i) => ({
      clinic_id:  staff.clinic_id,
      question:   p.question,
      answer:     p.answer,
      tags:       ["auto", "dari-dokumen"],
      status:     "draft" as const,
      embedding:  vecs[i],
      created_by: staff.id,
    }))
    const { data: inserted, error } = await supabase.from("kb_qa_pairs").insert(rows).select("id")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const created = inserted?.length ?? 0

    await logAudit(supabase, {
      clinic_id:   staff.clinic_id,
      actor_id:    staff.id,
      action:      "qa.auto_extract",
      target_type: "kb_document",
      target_id:   id,
      metadata:    { created },
    })

    return NextResponse.json({ created })
  } catch (err) {
    console.error("[api/kb/documents/[id]/extract-qa]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
