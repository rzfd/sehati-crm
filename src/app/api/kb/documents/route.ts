import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { embedBatch } from "@/lib/voyage"
import { parseDocument, chunkText } from "@/lib/kb-parser"
import { APP_CONFIG } from "@/lib/constants"

export const runtime    = "nodejs"
export const maxDuration = 60

// GET /api/kb/documents — list documents for current staff's clinic
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })

    const { data, error } = await supabase
      .from("kb_documents")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("[api/kb/documents GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/kb/documents — upload file, parse, chunk, embed
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
      return NextResponse.json({ error: "Hanya admin/manager yang boleh upload dokumen." }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan di request." }, { status: 400 })
    }

    if (file.size > APP_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File maksimum ${APP_CONFIG.MAX_FILE_SIZE_MB}MB.` }, { status: 400 })
    }

    const acceptedMime = APP_CONFIG.ACCEPTED_MIME as readonly string[]
    if (!acceptedMime.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, atau TXT." },
        { status: 400 }
      )
    }

    // Use service role for the document/chunks writes (bypass RLS quirks
    // since we already authorized the user above).
    const admin = createServiceClient()

    // Create document row in "processing" state
    const { data: doc, error: docErr } = await admin
      .from("kb_documents")
      .insert({
        clinic_id:       staff.clinic_id,
        title:           file.name,
        file_url:        `inline://${file.name}`, // storage upload is a separate Sprint
        file_type:       file.type,
        file_size_bytes: file.size,
        status:          "processing",
        uploaded_by:     staff.id,
      })
      .select()
      .single()

    if (docErr || !doc) {
      console.error("[documents] insert doc error:", docErr)
      return NextResponse.json({ error: "Gagal membuat record dokumen." }, { status: 500 })
    }

    try {
      // Parse
      const buffer = Buffer.from(await file.arrayBuffer())
      const rawText = await parseDocument(buffer, file.type)
      const chunks  = chunkText(rawText)

      if (chunks.length === 0) {
        await admin.from("kb_documents").update({ status: "error", chunk_count: 0 }).eq("id", doc.id)
        return NextResponse.json({ error: "Dokumen kosong atau tidak terbaca." }, { status: 422 })
      }

      // Embed in batches of 64 (Voyage limit)
      const BATCH_SIZE = 64
      const embeddings: number[][] = []
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE)
        const vecs  = await embedBatch(batch)
        embeddings.push(...vecs)
      }

      // Insert chunks
      const chunkRows = chunks.map((content, idx) => ({
        document_id: doc.id,
        clinic_id:   staff.clinic_id,
        chunk_index: idx,
        content,
        embedding:   embeddings[idx],
      }))

      const { error: chunkErr } = await admin.from("kb_document_chunks").insert(chunkRows)
      if (chunkErr) throw chunkErr

      // Mark ready
      const { data: ready } = await admin
        .from("kb_documents")
        .update({ status: "ready", chunk_count: chunks.length })
        .eq("id", doc.id)
        .select()
        .single()

      return NextResponse.json(ready, { status: 201 })
    } catch (err) {
      await admin.from("kb_documents").update({ status: "error" }).eq("id", doc.id)
      console.error("[documents] processing failed:", err)
      const msg = err instanceof Error ? err.message : "Gagal memproses dokumen."
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  } catch (err) {
    console.error("[api/kb/documents POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
