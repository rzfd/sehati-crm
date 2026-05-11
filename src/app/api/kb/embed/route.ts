import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { embedText } from "@/lib/voyage"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { question, answer, clinicId } = await req.json()
    if (!question || !answer || !clinicId) {
      return NextResponse.json({ error: "question, answer, and clinicId required" }, { status: 400 })
    }

    const content = `Q: ${question}\nA: ${answer}`
    const embedding = await embedText(content)

    const { data, error } = await supabase
      .from("kb_qa_pairs")
      .insert({
        clinic_id:  clinicId,
        question,
        answer,
        embedding,
        status:     "published",
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[api/kb/embed]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
