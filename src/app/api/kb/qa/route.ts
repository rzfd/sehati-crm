import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { embedText } from "@/lib/voyage"
import { logAudit } from "@/lib/audit"

// POST /api/kb/qa — create a Q&A pair with auto-embedding
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })

    const { data: staff } = await supabase
      .from("staff_members")
      .select("id, clinic_id, role")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!staff || !["admin", "manager"].includes(staff.role)) {
      return NextResponse.json({ error: "Hanya admin/manager yang boleh kelola KB." }, { status: 403 })
    }

    const { question, answer, tags = [], status = "draft" } = await req.json()
    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: "Pertanyaan dan jawaban wajib diisi." }, { status: 400 })
    }

    const content   = `Q: ${question}\nA: ${answer}`
    const embedding = await embedText(content)

    const { data, error } = await supabase
      .from("kb_qa_pairs")
      .insert({
        clinic_id:  staff.clinic_id,
        question:   question.trim(),
        answer:     answer.trim(),
        tags,
        status,
        embedding,
        created_by: staff.id,
      })
      .select()
      .single()

    if (error) throw error

    await logAudit(supabase, {
      clinic_id:   staff.clinic_id,
      actor_id:    staff.id,
      action:      "qa.create",
      target_type: "kb_qa_pair",
      target_id:   data.id,
      metadata:    { status, tags },
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[api/kb/qa POST]", err)
    const msg = err instanceof Error ? err.message : "Gagal menyimpan."
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
