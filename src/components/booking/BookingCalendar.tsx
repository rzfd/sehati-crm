"use client"

import { useEffect, useState } from "react"
import { format, addDays, startOfWeek, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Booking {
  id:            string
  booking_date:  string
  booking_time:  string
  status:        string
  doctor_id:     string
  doctor:        { name: string; specialty: string } | null
  patient:       { name: string } | null
}

const DOCTOR_COLORS = [
  "bg-teal-400",
  "bg-blue-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-pink-500",
] as const

const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i)  // 07.00 - 18.00

interface Props {
  clinicId: string
}

export function BookingCalendar({ clinicId }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    let cancelled = false
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setLoading(true)
    const supabase = createClient()
    const startStr = format(weekStart, "yyyy-MM-dd")
    const endStr   = format(addDays(weekStart, 7), "yyyy-MM-dd")
    ;(async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, booking_date, booking_time, status, doctor_id, doctor:doctors(name, specialty), patient:patients(name)")
        .eq("clinic_id", clinicId)
        .gte("booking_date", startStr)
        .lt("booking_date", endStr)
        .order("booking_time", { ascending: true })
      if (cancelled) return
      setBookings(((data ?? []) as unknown as Booking[]))
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [weekStart, clinicId])

  // Build doctor color map (stable across week)
  const doctorIds = Array.from(new Set(bookings.map((b) => b.doctor_id)))
  const colorOf = (id: string) => DOCTOR_COLORS[doctorIds.indexOf(id) % DOCTOR_COLORS.length]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/[0.08] flex items-center justify-between bg-white">
        <div>
          <h1 className="text-lg font-medium text-gray-700">Kalender</h1>
          <p className="text-xs text-gray-500">
            {format(weekStart, "d MMM", { locale: idLocale })} – {format(addDays(weekStart, 6), "d MMM yyyy", { locale: idLocale })}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="btn-secondary text-xs">← Minggu lalu</button>
          <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="btn-secondary text-xs">Hari ini</button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="btn-secondary text-xs">Minggu depan →</button>
        </div>
      </div>

      {/* Doctor legend */}
      {doctorIds.length > 0 && (
        <div className="px-6 py-2 flex flex-wrap gap-2 bg-white border-b border-black/[0.04]">
          {doctorIds.map((id) => {
            const b = bookings.find((x) => x.doctor_id === id)
            return (
              <div key={id} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className={cn("size-2.5 rounded-full", colorOf(id))} />
                {b?.doctor?.name}
              </div>
            )
          })}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-white scrollbar-thin">
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Memuat…</p>
        ) : (
          <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[800px]">
            <div className="border-b border-black/[0.06] bg-gray-50" />
            {days.map((d) => (
              <div key={d.toISOString()} className="border-b border-l border-black/[0.06] bg-gray-50 text-center py-2">
                <div className="text-[10px] uppercase text-gray-400">{format(d, "EEE", { locale: idLocale })}</div>
                <div className="text-sm font-medium text-gray-700">{format(d, "d", { locale: idLocale })}</div>
              </div>
            ))}

            {HOURS.map((hour) => (
              <Row key={hour} hour={hour}>
                {days.map((d) => {
                  const dateStr = format(d, "yyyy-MM-dd")
                  const slotsOfHour = bookings.filter((b) =>
                    b.booking_date === dateStr && Number(b.booking_time.slice(0, 2)) === hour
                  )
                  return (
                    <div key={d.toISOString() + hour} className="border-b border-l border-black/[0.04] p-1 min-h-[60px] space-y-0.5">
                      {slotsOfHour.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setSelected(b)}
                          className={cn(
                            "block w-full text-left text-[10px] leading-tight rounded px-1.5 py-1 text-white truncate",
                            colorOf(b.doctor_id),
                          )}
                          title={`${b.doctor?.name} • ${b.patient?.name}`}
                        >
                          {b.booking_time.slice(0, 5)} {b.patient?.name?.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </Row>
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-5 m-0 sm:m-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-medium text-gray-700">{selected.doctor?.name}</p>
            <p className="text-xs text-gray-500">{selected.doctor?.specialty}</p>
            <div className="text-sm text-gray-700">
              {format(parseISO(selected.booking_date), "EEEE, d MMM yyyy", { locale: idLocale })} • {selected.booking_time.slice(0, 5)}
            </div>
            <div className="text-sm">Pasien: <span className="font-medium">{selected.patient?.name}</span></div>
            <span className={cn("pill", statusPill(selected.status))}>{statusLabel(selected.status)}</span>
            <div className="pt-2">
              <button onClick={() => setSelected(null)} className="btn-secondary w-full justify-center">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ hour, children }: { hour: number; children: React.ReactNode }) {
  return (
    <>
      <div className="border-b border-black/[0.04] text-[10px] text-gray-400 text-center py-2">{String(hour).padStart(2, "0")}:00</div>
      {children}
    </>
  )
}

function statusLabel(s: string) {
  return { pending: "Menunggu", confirmed: "Terkonfirmasi", completed: "Selesai", no_show: "Tidak hadir", cancelled: "Dibatalkan" }[s] ?? s
}
function statusPill(s: string) {
  if (s === "confirmed") return "pill-teal"
  if (s === "pending")   return "pill-amber"
  if (s === "no_show" || s === "cancelled") return "pill-red"
  return "pill-gray"
}
