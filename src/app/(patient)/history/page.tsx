"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { EmptyBookingIllustration } from "@/components/shared/Illustrations"

interface BookingRow {
  id:            string
  booking_date:  string
  booking_time:  string
  status:        "pending" | "confirmed" | "completed" | "no_show" | "cancelled"
  notes:         string | null
  doctor:        { id: string; name: string; specialty: string; title: string } | null
}

const STATUS_LABEL: Record<BookingRow["status"], string> = {
  pending:   "Menunggu",
  confirmed: "Terkonfirmasi",
  completed: "Selesai",
  no_show:   "Tidak hadir",
  cancelled: "Dibatalkan",
}

// Border-left color per status (sesuai design system)
const STATUS_BORDER: Record<BookingRow["status"], string> = {
  pending:   "border-amber-500",
  confirmed: "border-teal-400",
  completed: "border-gray-400",
  no_show:   "border-red-500",
  cancelled: "border-gray-300",
}

export default function PatientHistoryPage() {
  const { patient } = useCurrentUser()
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    if (!patient) return
    const supabase = createClient()
    const { data } = await supabase
      .from("bookings")
      .select("id, booking_date, booking_time, status, notes, doctor:doctors(id, name, specialty, title)")
      .eq("patient_id", patient.id)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false })
    setBookings(((data ?? []) as unknown as BookingRow[]))
    setLoading(false)
  }, [patient])

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { load() }, [load])

  // Realtime: re-fetch saat ada booking insert/update untuk pasien ini
  useEffect(() => {
    if (!patient) return
    const supabase = createClient()
    const channel = supabase
      .channel(`bookings:patient:${patient.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `patient_id=eq.${patient.id}` },
        () => load(),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [patient, load])

  async function cancelBooking(id: string) {
    if (!confirm("Yakin batalkan booking ini?")) return
    const res = await fetch(`/api/booking/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      toast.error(d.error ?? "Gagal membatalkan.")
      return
    }
    toast.success("Booking dibatalkan")
    load()
  }

  const today = new Date().toISOString().split("T")[0]
  const upcoming = bookings.filter(
    (b) => b.booking_date >= today && (b.status === "pending" || b.status === "confirmed"),
  )
  const past = bookings.filter((b) => !upcoming.includes(b))

  return (
    <div className="p-4 pt-6 space-y-5">
      <h1 className="text-lg font-medium text-gray-700">Riwayat</h1>

      {loading ? (
        <p className="text-sm text-gray-400">Memuat…</p>
      ) : bookings.length === 0 ? (
        <div className="card p-8 text-center space-y-3 flex flex-col items-center">
          <EmptyBookingIllustration className="w-44 h-auto" />
          <div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-100">Belum ada janji</p>
            <p className="text-xs text-gray-500 mt-1">Buat janji pertama Anda untuk mulai konsultasi.</p>
          </div>
          <Link href="/booking" className="btn-primary inline-flex">+ Buat janji</Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Mendatang</p>
              <ul className="space-y-2">
                {upcoming.map((b) => <BookingItem key={b.id} booking={b} onCancel={cancelBooking} />)}
              </ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Riwayat</p>
              <ul className="space-y-2">
                {past.map((b) => <BookingItem key={b.id} booking={b} onCancel={cancelBooking} />)}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function BookingItem({ booking, onCancel }: { booking: BookingRow; onCancel: (id: string) => void }) {
  const canCancel = booking.status === "pending" || booking.status === "confirmed"
  return (
    <li className={cn("card border-l-4 p-3", STATUS_BORDER[booking.status])}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">
            {booking.doctor?.title ?? "dr."} {booking.doctor?.name}
          </p>
          <p className="text-xs text-gray-500">{booking.doctor?.specialty}</p>
          <p className="text-xs text-gray-600 mt-1">
            {format(parseISO(booking.booking_date), "EEEE, d MMM yyyy", { locale: idLocale })}
            <span className="mx-1.5 text-gray-300">•</span>
            {booking.booking_time.slice(0, 5)}
          </p>
          {booking.notes && (
            <p className="text-[11px] text-gray-400 mt-1.5 italic">&ldquo;{booking.notes}&rdquo;</p>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="mt-2 text-[11px] text-red-500 hover:text-red-700"
            >
              Batalkan
            </button>
          )}
        </div>
        <span className={cn("pill flex-shrink-0", pillFor(booking.status))}>
          {STATUS_LABEL[booking.status]}
        </span>
      </div>
    </li>
  )
}

function pillFor(s: BookingRow["status"]) {
  if (s === "confirmed") return "pill-teal"
  if (s === "pending")   return "pill-amber"
  if (s === "no_show" || s === "cancelled") return "pill-red"
  return "pill-gray"
}
