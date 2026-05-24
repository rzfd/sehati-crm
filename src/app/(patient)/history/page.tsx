"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { formatDoctorName } from "@/lib/format"
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

// Timeline dot color per status (sesuai design system)
const STATUS_DOT: Record<BookingRow["status"], string> = {
  pending:   "bg-warning",
  confirmed: "bg-primary",
  completed: "bg-tertiary",
  no_show:   "bg-danger",
  cancelled: "bg-ink-dim",
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
    <div className="px-mobile-margin pt-6 pb-6">
      <h1 className="text-headline-lg text-ink mb-5">Riwayat</h1>

      {loading ? (
        <p className="text-body-md text-ink-dim">Memuat…</p>
      ) : bookings.length === 0 ? (
        <div className="card p-8 text-center space-y-3 flex flex-col items-center">
          <EmptyBookingIllustration className="w-44 h-auto" />
          <div>
            <p className="text-headline-sm text-ink">Belum ada janji</p>
            <p className="text-body-md text-ink-muted mt-1">Buat janji pertama Anda untuk mulai konsultasi.</p>
          </div>
          <Link href="/booking" className="btn-sage inline-flex">+ Buat janji</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <p className="eyebrow mb-3">Mendatang</p>
              <ol className="relative">
                {upcoming.map((b) => <BookingItem key={b.id} booking={b} onCancel={cancelBooking} />)}
              </ol>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p className="eyebrow mb-3">Riwayat</p>
              <ol className="relative">
                {past.map((b) => <BookingItem key={b.id} booking={b} onCancel={cancelBooking} />)}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function BookingItem({ booking, onCancel }: { booking: BookingRow; onCancel: (id: string) => void }) {
  const canCancel = booking.status === "pending" || booking.status === "confirmed"
  const dt = parseISO(booking.booking_date)
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {/* Date rail */}
      <div className="flex flex-col items-center w-10 shrink-0">
        <span className="eyebrow text-ink-dim">{format(dt, "MMM", { locale: idLocale }).toUpperCase()}</span>
        <span className="text-xl font-bold text-ink leading-tight">{format(dt, "d")}</span>
        <span className={cn("mt-1.5 size-2.5 rounded-full ring-4 ring-background", STATUS_DOT[booking.status])} />
        <span className="flex-1 w-px bg-border mt-1" />
      </div>
      {/* Card */}
      <div className="card p-3 flex-1 mb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-card-title text-ink truncate">
              {formatDoctorName({ title: booking.doctor?.title ?? "dr.", name: booking.doctor?.name ?? "" })}
            </p>
            <p className="text-body-sm text-ink-muted flex items-center gap-1">
              <span className="material-symbols-rounded text-[14px] text-tertiary">stethoscope</span>
              {booking.doctor?.specialty}
            </p>
          </div>
          <span className={cn("flex-shrink-0", pillFor(booking.status))}>
            {STATUS_LABEL[booking.status]}
          </span>
        </div>
        <p className="text-body-sm text-ink-muted mt-1.5">
          {booking.booking_time.slice(0, 5)} WIB
        </p>
        {booking.notes && (
          <p className="text-body-sm text-ink-muted mt-2 rounded-lg bg-accent-soft px-3 py-1.5">{booking.notes}</p>
        )}
        {canCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="mt-2 text-caption text-danger hover:underline"
          >
            Batalkan
          </button>
        )}
      </div>
    </li>
  )
}

function pillFor(s: BookingRow["status"]) {
  if (s === "confirmed") return "pill-sukses"
  if (s === "pending")   return "pill-warning"
  if (s === "no_show" || s === "cancelled") return "pill-danger"
  return "pill-info"
}
