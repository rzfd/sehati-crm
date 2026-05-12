"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createClient } from "@/lib/supabase/client"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface UpcomingBooking {
  id:            string
  booking_date:  string
  booking_time:  string
  status:        string
  doctor:        { name: string; specialty: string; title: string } | null
}

export default function PatientHomePage() {
  const router = useRouter()
  const { loading: userLoading, patient } = useCurrentUser()
  const [upcoming, setUpcoming] = useState<UpcomingBooking | null>(null)
  const [bookingLoading, setBookingLoading] = useState(true)

  // Pasien baru → onboarding
  useEffect(() => {
    if (!userLoading && patient?.is_new) router.replace("/onboarding")
  }, [userLoading, patient, router])

  useEffect(() => {
    if (!patient) return
    let cancelled = false
    const supabase = createClient()

    async function load() {
      const today = new Date().toISOString().split("T")[0]
      const { data } = await supabase
        .from("bookings")
        .select("id, booking_date, booking_time, status, doctor:doctors(name, specialty, title)")
        .eq("patient_id", patient!.id)
        .gte("booking_date", today)
        .in("status", ["pending", "confirmed"])
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true })
        .limit(1)
        .maybeSingle()
      if (cancelled) return
      setUpcoming((data as unknown as UpcomingBooking) ?? null)
      setBookingLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [patient])

  if (userLoading) {
    return <div className="p-6 text-sm text-gray-500">Memuat…</div>
  }

  const greeting = getGreeting()
  const firstName = patient?.name?.split(" ")[0] ?? "Pasien"

  return (
    <div className="p-4 pt-6 space-y-4">
      <div>
        <p className="text-sm text-gray-500">{greeting},</p>
        <h1 className="text-xl font-medium text-gray-700">{firstName} 👋</h1>
      </div>

      <div className="card p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Janji berikutnya</p>
        {bookingLoading ? (
          <p className="text-sm text-gray-400">Memuat…</p>
        ) : upcoming ? (
          <div>
            <p className="text-base font-medium text-gray-700">
              {upcoming.doctor?.title ?? "dr."} {upcoming.doctor?.name}
            </p>
            <p className="text-xs text-gray-500 mb-2">{upcoming.doctor?.specialty}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{format(parseISO(upcoming.booking_date), "EEEE, d MMM yyyy", { locale: idLocale })}</span>
              <span className="text-gray-300">•</span>
              <span>{upcoming.booking_time.slice(0, 5)}</span>
            </div>
            <span className={`pill mt-3 ${upcoming.status === "confirmed" ? "pill-teal" : "pill-amber"}`}>
              {upcoming.status === "confirmed" ? "Terkonfirmasi" : "Menunggu konfirmasi"}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Belum ada janji.{" "}
            <Link href="/booking" className="text-teal-600 underline">Buat sekarang</Link>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/chat" className="card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
          <div className="size-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">💬</div>
          <p className="text-sm font-medium text-gray-700">Tanya AI</p>
          <p className="text-[11px] text-gray-500">Pertanyaan klinik dijawab cepat</p>
        </Link>
        <Link href="/booking" className="card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
          <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">📅</div>
          <p className="text-sm font-medium text-gray-700">Booking</p>
          <p className="text-[11px] text-gray-500">Atur jadwal dokter</p>
        </Link>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}
