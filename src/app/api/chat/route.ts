import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { runChatPipeline } from "@/lib/ai/pipeline"
import { SENDER_TYPE } from "@/lib/constants"
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit"

// /api/chat — patient mengirim pesan + jalankan AI pipeline.
//
// Authentikasi pakai user cookie (verifikasi siapa yang send).
// Write operations (AI bot message, update conversation kategori/urgency) pakai
// SERVICE ROLE karena RLS hanya izinkan staff insert ai_bot & update conversations.
// Membatasi service-role hanya ke conversation milik user yang sedang login —
// dicek setelah load conversation.
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 })

    // Rate limit: 20 req/menit per user (refill ~0.33/s = 20/min)
    const rl = checkRateLimit(rateLimitKey(req, user.id, "chat"), { capacity: 20, refillRate: 0.33 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Coba lagi ${rl.retryAfter}s.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      )
    }

    const { conversationId, message } = await req.json()
    if (!conversationId || !message) {
      return NextResponse.json({ error: "conversationId dan message wajib." }, { status: 400 })
    }

    // Service client untuk operasi cross-RLS (AI insert + conversation update)
    const service = createServiceClient()

    // Verifikasi: conversation memang milik user ini (cegah service-role disalahgunakan)
    const { data: patient } = await service
      .from("patients").select("id, clinic_id").eq("user_id", user.id).maybeSingle()
    if (!patient) {
      return NextResponse.json({ error: "Bukan akun pasien." }, { status: 403 })
    }

    const { data: conversation, error: convErr } = await service
      .from("conversations")
      .select("clinic_id, patient_id")
      .eq("id", conversationId)
      .maybeSingle()
    if (convErr || !conversation) {
      return NextResponse.json({ error: "Conversation tidak ditemukan." }, { status: 404 })
    }
    if (conversation.patient_id !== patient.id) {
      return NextResponse.json({ error: "Conversation ini bukan milikmu." }, { status: 403 })
    }

    // Jalankan pipeline (pakai service client supaya RLS tidak menghalangi
    // pencarian KB lintas tabel atau lookup dokter)
    const pipeline = await runChatPipeline({
      message,
      clinicId:       conversation.clinic_id,
      conversationId,
      patientId:      conversation.patient_id,
    }, { supabase: service })

    const patientMetadata = JSON.parse(JSON.stringify({
      gatekeeper:         pipeline.gatekeeper,
      triage:             pipeline.triage ?? null,
      decided_at:         pipeline.decidedAt,
      reason:             pipeline.reason,
      booking_suggestion: pipeline.bookingSuggestion ?? null,
    }))

    // Patient message — service role agar tidak terhalang RLS rumit di edge case
    const { data: patientMsg, error: patientMsgErr } = await service
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_type:     SENDER_TYPE.PATIENT,
        sender_id:       user.id,
        content:         message,
        metadata:        patientMetadata,
      })
      .select()
      .single()

    if (patientMsgErr) {
      console.error("[api/chat] patient message insert:", patientMsgErr)
      return NextResponse.json({ error: `Gagal simpan pesan: ${patientMsgErr.message}` }, { status: 500 })
    }

    let aiMessage = null

    if (pipeline.action === "auto_reply" && pipeline.reply) {
      const { data, error: aiErr } = await service
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_type:     SENDER_TYPE.AI_BOT,
          sender_id:       null,
          content:         pipeline.reply,
          metadata: JSON.parse(JSON.stringify({
            confidence: pipeline.confidence,
            kb_sources: pipeline.kbMatches.map((m) => ({ id: m.id, similarity: m.similarity })),
            decided_at: pipeline.decidedAt,
          })),
        })
        .select()
        .single()
      if (aiErr) console.error("[api/chat] AI message insert:", aiErr)
      aiMessage = data

      await service
        .from("conversations")
        .update({
          category:        pipeline.gatekeeper.category,
          ai_handled:      true,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
    } else if (pipeline.action === "escalate") {
      const update: Record<string, unknown> = {
        status:          "open",
        category:        pipeline.gatekeeper.category,
        urgency_level:   pipeline.triage?.urgency_level ?? 1,
        last_message_at: new Date().toISOString(),
      }
      if (pipeline.recommendedDoctorId) update.routed_to_doctor = pipeline.recommendedDoctorId
      await service.from("conversations").update(update).eq("id", conversationId)
    } else if (pipeline.action === "booking_request") {
      const update: Record<string, unknown> = {
        category:        "booking",
        last_message_at: new Date().toISOString(),
      }
      if (pipeline.recommendedDoctorId) update.routed_to_doctor = pipeline.recommendedDoctorId
      await service.from("conversations").update(update).eq("id", conversationId)
    }

    return NextResponse.json({
      patientMessage: patientMsg,
      aiMessage,
      pipeline: {
        action:     pipeline.action,
        gatekeeper: pipeline.gatekeeper,
        triage:     pipeline.triage,
        decidedAt:  pipeline.decidedAt,
        reason:     pipeline.reason,
      },
    })
  } catch (err) {
    console.error("[api/chat]", err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Internal server error",
    }, { status: 500 })
  }
}
