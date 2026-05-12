import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { routeMessage } from "@/lib/routing/decision-tree"

// POST /api/ai/routing
// Body: { message, clinic_id, primary_doctor_id? }
// Returns: RoutingDecision
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { message, clinic_id, primary_doctor_id } = body
    if (!message || !clinic_id) {
      return NextResponse.json({ error: "message dan clinic_id wajib." }, { status: 400 })
    }

    const decision = await routeMessage({
      message,
      clinicId:        clinic_id,
      primaryDoctorId: primary_doctor_id ?? null,
      supabase,
    })

    return NextResponse.json(decision)
  } catch (err) {
    console.error("[api/ai/routing]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
