import { NextResponse } from "next/server"
import { embedText, embedBatch } from "@/lib/voyage"

// POST /api/kb/embed — utility to embed arbitrary text (used by seed scripts, etc).
// Q&A and document writes have their own endpoints that handle embedding internally.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text, texts } = body

    if (Array.isArray(texts)) {
      const vectors = await embedBatch(texts)
      return NextResponse.json({ vectors })
    }
    if (typeof text === "string") {
      const vector = await embedText(text)
      return NextResponse.json({ vector })
    }
    return NextResponse.json({ error: "Provide either 'text' or 'texts'." }, { status: 400 })
  } catch (err) {
    console.error("[api/kb/embed]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
