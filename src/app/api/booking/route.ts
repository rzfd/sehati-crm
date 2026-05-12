import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const clinicId  = url.searchParams.get("clinicId")
    const patientId = url.searchParams.get("patientId")
    const upcoming  = url.searchParams.get("upcoming") === "1"

    let query = supabase
      .from("bookings")
      .select("*, doctor:doctors(id, name, specialty, title), patient:patients(id, name)")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true })

    if (clinicId)  query = query.eq("clinic_id", clinicId)
    if (patientId) query = query.eq("patient_id", patientId)
    if (upcoming) {
      const today = new Date().toISOString().split("T")[0]
      query = query.gte("booking_date", today).in("status", ["pending", "confirmed"])
    }

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
    const { doctor_id, booking_date, booking_time, notes, conversation_id } = body
    if (!doctor_id || !booking_date || !booking_time) {
      return NextResponse.json({ error: "doctor_id, booking_date, booking_time wajib." }, { status: 400 })
    }

    // Resolve current patient + clinic
    const { data: patient, error: patientErr } = await supabase
      .from("patients")
      .select("id, clinic_id")
      .eq("user_id", user.id)
      .maybeSingle()
    if (patientErr || !patient) {
      return NextResponse.json({ error: "Profil pasien tidak ditemukan." }, { status: 400 })
    }

    // Cek slot konflik (doctor + date + time)
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("doctor_id", doctor_id)
      .eq("booking_date", booking_date)
      .eq("booking_time", booking_time)
      .in("status", ["pending", "confirmed"])
      .limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Slot sudah terisi. Pilih waktu lain." }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        clinic_id:       patient.clinic_id,
        patient_id:      patient.id,
        doctor_id,
        booking_date,
        booking_time,
        notes:           notes || null,
        conversation_id: conversation_id || null,
        status:          "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[api/booking POST]", error)
      return NextResponse.json({ error: "Gagal membuat booking." }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[api/booking POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
