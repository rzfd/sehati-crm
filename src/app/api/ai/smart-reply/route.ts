import { NextResponse } from "next/server"
import { generateSmartReplies } from "@/lib/ai/smart-reply"
import { retrieveFromKB, formatKBContext } from "@/lib/kb"

export async function POST(req: Request) {
  try {
    const { message, clinicId } = await req.json()
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 })
    }

    let kbContext: string | undefined
    if (clinicId) {
      const kbMatches = await retrieveFromKB(message, clinicId)
      kbContext = formatKBContext(kbMatches)
    }

    const result = await generateSmartReplies(message, kbContext)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/ai/smart-reply]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
