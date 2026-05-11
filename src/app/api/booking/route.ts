import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const clinicId = url.searchParams.get("clinicId")
    const patientId = url.searchParams.get("patientId")

    let query = supabase
      .from("bookings")
      .select("*, doctors(full_name, specialty), patients(full_name)")
      .order("booking_date", { ascending: true })

    if (clinicId) query = query.eq("clinic_id", clinicId)
    if (patientId) query = query.eq("patient_id", patientId)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/booking GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { data, error } = await supabase
      .from("bookings")
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[api/booking POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
