import { NextResponse } from "next/server"
import { runRouting } from "@/lib/ai/routing"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 })
    }
    const result = await runRouting(message)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/ai/routing]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
