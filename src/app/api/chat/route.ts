import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { runGatekeeper } from "@/lib/ai/gatekeeper"
import { generateSmartReplies } from "@/lib/ai/smart-reply"
import { retrieveFromKB, formatKBContext } from "@/lib/kb"
import { SENDER_TYPE } from "@/lib/constants"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId, message } = await req.json()
    if (!conversationId || !message) {
      return NextResponse.json({ error: "conversationId and message required" }, { status: 400 })
    }

    // Get conversation to find clinic_id
    const { data: conversation } = await supabase
      .from("conversations")
      .select("clinic_id, patient_id")
      .eq("id", conversationId)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Save patient message
    const { data: patientMsg } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_type:     SENDER_TYPE.PATIENT,
        sender_id:       user.id,
        content:         message,
      })
      .select()
      .single()

    // Run AI gatekeeper + KB retrieval in parallel
    const [kbMatches, gatekeeper] = await Promise.all([
      retrieveFromKB(message, conversation.clinic_id),
      runGatekeeper({
        message,
        conversationId,
        clinicId:  conversation.clinic_id,
        patientId: conversation.patient_id,
      }),
    ])

    let aiMessage = null

    if (gatekeeper.action === "auto_reply") {
      const kbContext = formatKBContext(kbMatches)
      const replies = await generateSmartReplies(message, kbContext || undefined)
      const replyContent = replies.warm

      const { data } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_type:     SENDER_TYPE.AI_BOT,
          sender_id:       null,
          content:         replyContent,
          metadata: JSON.parse(JSON.stringify({ gatekeeper, kb_sources: kbMatches.map((m) => m.id) })),
        })
        .select()
        .single()
      aiMessage = data
    } else if (gatekeeper.action === "escalate") {
      await supabase
        .from("conversations")
        .update({ status: "open" })
        .eq("id", conversationId)
    }

    return NextResponse.json({ patientMessage: patientMsg, aiMessage, gatekeeper })
  } catch (err) {
    console.error("[api/chat]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
