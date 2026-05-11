import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { retrieveFromKB, formatKBContext } from "@/lib/kb"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { query, clinicId } = await req.json()
    if (!query || !clinicId) {
      return NextResponse.json({ error: "query and clinicId required" }, { status: 400 })
    }

    const matches = await retrieveFromKB(query, clinicId)
    const context = formatKBContext(matches)
    return NextResponse.json({ matches, context })
  } catch (err) {
    console.error("[api/kb/search]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
