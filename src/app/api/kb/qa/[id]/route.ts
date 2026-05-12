import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { embedText } from "@/lib/voyage"
import { logAudit } from "@/lib/audit"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 }) }

  const { data: staff } = await supabase
    .from("staff_members")
    .select("id, clinic_id, role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!staff || !["admin", "manager"].includes(staff.role)) {
    return { error: NextResponse.json({ error: "Akses ditolak." }, { status: 403 }) }
  }
  return { supabase, staff }
}

// PATCH /api/kb/qa/[id] — update Q&A; re-embed if question/answer changed
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const guard = await requireAdmin()
    if ("error" in guard) return guard.error
    const { supabase } = guard

    const body = await req.json()
    const { question, answer, tags, status } = body

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: "Pertanyaan dan jawaban wajib diisi." }, { status: 400 })
    }

    // Check current values to decide whether to re-embed
    const { data: current, error: currentErr } = await supabase
      .from("kb_qa_pairs")
      .select("question, answer")
      .eq("id", id)
      .single()

    if (currentErr || !current) {
      return NextResponse.json({ error: "Q&A tidak ditemukan." }, { status: 404 })
    }

    const contentChanged =
      current.question !== question.trim() || current.answer !== answer.trim()

    const update: {
      question:    string
      answer:      string
      tags?:       string[]
      status?:     "draft" | "published" | "archived"
      embedding?:  number[]
      updated_at:  string
    } = {
      question:   question.trim(),
      answer:     answer.trim(),
      updated_at: new Date().toISOString(),
    }
    if (Array.isArray(tags)) update.tags = tags
    if (status)              update.status = status as typeof update.status

    if (contentChanged) {
      update.embedding = await embedText(`Q: ${update.question}\nA: ${update.answer}`)
    }

    const { data, error } = await supabase
      .from("kb_qa_pairs")
      .update(update)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    await logAudit(supabase, {
      clinic_id:   guard.staff.clinic_id,
      actor_id:    guard.staff.id,
      action:      "qa.update",
      target_type: "kb_qa_pair",
      target_id:   id,
      metadata:    { content_changed: contentChanged, status: update.status },
    })
    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/kb/qa PATCH]", err)
    const msg = err instanceof Error ? err.message : "Gagal menyimpan."
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/kb/qa/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const guard = await requireAdmin()
    if ("error" in guard) return guard.error
    const { supabase } = guard

    const { error } = await supabase.from("kb_qa_pairs").delete().eq("id", id)
    if (error) throw error
    await logAudit(supabase, {
      clinic_id:   guard.staff.clinic_id,
      actor_id:    guard.staff.id,
      action:      "qa.delete",
      target_type: "kb_qa_pair",
      target_id:   id,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/kb/qa DELETE]", err)
    return NextResponse.json({ error: "Gagal menghapus." }, { status: 500 })
  }
}
