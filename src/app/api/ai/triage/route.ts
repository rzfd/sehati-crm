import { NextResponse } from "next/server"
import { runTriage } from "@/lib/ai/triage"

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json()
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 })
    }
    const result = await runTriage({ message, conversationId })
    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/ai/triage]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
