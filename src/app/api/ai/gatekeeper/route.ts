import { NextResponse } from "next/server"
import { runGatekeeper } from "@/lib/ai/gatekeeper"

export async function POST(req: Request) {
  try {
    const { message, conversationId, clinicId, patientId } = await req.json()
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 })
    }

    const result = await runGatekeeper({
      message,
      conversationId: conversationId ?? "",
      clinicId:       clinicId ?? "",
      patientId:      patientId ?? "",
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/ai/gatekeeper]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
