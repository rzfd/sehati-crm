"use client"

import { useEffect, useState } from "react"
import { format, addDays, startOfWeek, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "@/lib/toast"
import { RescheduleModal } from "@/components/booking/RescheduleModal"

interface Booking {
  id:            string
  booking_date:  string
  booking_time:  string
  status:        string
  doctor_id:     string
  doctor:        { name: string; specialty: string } | null
  patient:       { name: string } | null
}

// Paired colors: dot (solid, for legend) + block (soft tint, for grid).
const DOCTOR_COLORS = [
  { dot: "bg-primary",   block: "bg-primary-soft text-primary border-l-2 border-primary" },
  { dot: "bg-tertiary",  block: "bg-info-soft text-tertiary border-l-2 border-tertiary" },
  { dot: "bg-warning",   block: "bg-warning-soft text-warning border-l-2 border-warning" },
  { dot: "bg-secondary", block: "bg-accent-soft text-secondary border-l-2 border-secondary" },
  { dot: "bg-danger",    block: "bg-danger-soft text-danger border-l-2 border-danger" },
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
  const [updating, setUpdating] = useState(false)
  const [reschedule, setReschedule] = useState<Booking | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  async function updateStatus(newStatus: "confirmed" | "cancelled" | "completed" | "no_show") {
    if (!selected) return
    const labels: Record<typeof newStatus, string> = {
      confirmed: "konfirmasi", cancelled: "batalkan", completed: "tandai selesai", no_show: "tandai tidak hadir",
    }
    if (newStatus === "cancelled") {
      const ok = await toast.confirm({
        title: "Batalkan booking?",
        description: `Booking ${selected.patient?.name ?? "pasien"} akan dibatalkan.`,
      })
      if (!ok) return
    }
    setUpdating(true)
    try {
      const res = await fetch(`/api/booking/${selected.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        toast.error("Gagal update", d.error ?? `Tidak bisa ${labels[newStatus]}.`)
        return
      }
      const updated = await res.json()
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, status: updated.status } : b)))
      setSelected({ ...selected, status: updated.status })
      toast.success(`Booking ${statusLabel(newStatus).toLowerCase()}.`)
    } finally {
      setUpdating(false)
    }
  }

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
  }, [weekStart, clinicId, refreshTick])

  // Build doctor color map (stable across week)
  const doctorIds = Array.from(new Set(bookings.map((b) => b.doctor_id)))
  const colorOf = (id: string) => DOCTOR_COLORS[doctorIds.indexOf(id) % DOCTOR_COLORS.length]
  const todayStr = format(new Date(), "yyyy-MM-dd")

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 h-topbar-height border-b border-border flex items-center justify-between bg-background gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-headline-sm text-ink">Kalender</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Minggu lalu" className="size-8 rounded-lg border border-border hover:bg-surface-alt flex items-center justify-center text-ink-muted">
              <span className="material-symbols-rounded text-[18px]">chevron_left</span>
            </button>
            <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 h-8 rounded-lg border border-border hover:bg-surface-alt text-body-sm font-medium text-ink">Hari ini</button>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Minggu depan" className="size-8 rounded-lg border border-border hover:bg-surface-alt flex items-center justify-center text-ink-muted">
              <span className="material-symbols-rounded text-[18px]">chevron_right</span>
            </button>
          </div>
          <p className="text-body-sm text-ink-muted truncate">
            {format(weekStart, "d MMM", { locale: idLocale })} – {format(addDays(weekStart, 6), "d MMM yyyy", { locale: idLocale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-surface-alt p-1">
            {["Hari", "Minggu", "Bulan"].map((v) => (
              <span key={v} className={cn("px-3 py-1 rounded-full text-body-sm font-medium", v === "Minggu" ? "bg-surface text-ink shadow-card" : "text-ink-muted")}>{v}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor legend */}
      {doctorIds.length > 0 && (
        <div className="px-6 py-2.5 flex flex-wrap gap-3 bg-background border-b border-border">
          {doctorIds.map((id) => {
            const b = bookings.find((x) => x.doctor_id === id)
            return (
              <div key={id} className="flex items-center gap-1.5 text-body-sm text-ink">
                <div className={cn("size-2.5 rounded-full", colorOf(id).dot)} />
                {b?.doctor?.name}
              </div>
            )
          })}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-background scrollbar-thin">
        {loading ? (
          <p className="p-6 text-body-md text-ink-dim">Memuat…</p>
        ) : (
          <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[860px]">
            <div className="border-b border-border bg-surface sticky top-0 z-10" />
            {days.map((d) => {
              const isToday = format(d, "yyyy-MM-dd") === todayStr
              return (
                <div key={d.toISOString()} className={cn("border-b border-l border-border text-center py-2 sticky top-0 z-10", isToday ? "bg-primary-soft" : "bg-surface")}>
                  <div className="eyebrow text-ink-dim">{format(d, "EEE", { locale: idLocale })}</div>
                  <div className={cn("text-headline-sm leading-tight mt-0.5", isToday ? "text-primary" : "text-ink")}>{format(d, "d", { locale: idLocale })}</div>
                </div>
              )
            })}

            {HOURS.map((hour) => (
              <Row key={hour} hour={hour}>
                {days.map((d) => {
                  const dateStr = format(d, "yyyy-MM-dd")
                  const slotsOfHour = bookings.filter((b) =>
                    b.booking_date === dateStr && Number(b.booking_time.slice(0, 2)) === hour
                  )
                  return (
                    <div key={d.toISOString() + hour} className="border-b border-l border-border p-1 min-h-[60px] space-y-0.5">
                      {slotsOfHour.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setSelected(b)}
                          className={cn(
                            "block w-full text-left text-body-sm leading-tight rounded-md px-1.5 py-1 truncate",
                            colorOf(b.doctor_id).block,
                          )}
                          title={`${b.doctor?.name} • ${b.patient?.name}`}
                        >
                          <span className="font-mono text-code-mono">{b.booking_time.slice(0, 5)}</span> {b.patient?.name?.split(" ")[0]}
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
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 modal-backdrop z-50 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-surface w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-5 m-0 sm:m-4 space-y-2 shadow-modal slide-up sm:animate-none" onClick={(e) => e.stopPropagation()}>
            <p className="text-headline-sm text-ink">{selected.doctor?.name}</p>
            <p className="text-body-sm text-ink-muted">{selected.doctor?.specialty}</p>
            <div className="text-body-md text-ink flex items-center gap-1.5">
              <span className="material-symbols-rounded text-[16px] text-secondary">event</span>
              {format(parseISO(selected.booking_date), "EEEE, d MMM yyyy", { locale: idLocale })} • {selected.booking_time.slice(0, 5)}
            </div>
            <div className="text-body-md text-ink">Pasien: <span className="font-semibold">{selected.patient?.name}</span></div>
            <span className={statusPill(selected.status)}>{statusLabel(selected.status)}</span>

            {/* Action buttons — tergantung status booking saat ini */}
            <div className="pt-2 space-y-2">
              {selected.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus("confirmed")}
                    disabled={updating}
                    className="btn-primary flex-1 justify-center"
                  >
                    {updating ? "..." : "Konfirmasi"}
                  </button>
                  <button
                    onClick={() => updateStatus("cancelled")}
                    disabled={updating}
                    className="btn-danger flex-1 justify-center"
                  >
                    Batalkan
                  </button>
                </div>
              )}
              {selected.status === "confirmed" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus("completed")}
                    disabled={updating}
                    className="btn-primary flex-1 justify-center"
                  >
                    {updating ? "..." : "Selesai"}
                  </button>
                  <button
                    onClick={() => updateStatus("no_show")}
                    disabled={updating}
                    className="btn-secondary flex-1 justify-center"
                  >
                    Tidak hadir
                  </button>
                  <button
                    onClick={() => updateStatus("cancelled")}
                    disabled={updating}
                    className="btn-danger flex-1 justify-center"
                  >
                    Batal
                  </button>
                </div>
              )}
              {(selected.status === "pending" || selected.status === "confirmed") && (
                <button
                  onClick={() => { setReschedule(selected); setSelected(null) }}
                  disabled={updating}
                  className="btn-secondary w-full justify-center"
                >
                  <span className="material-symbols-rounded text-[18px]">edit_calendar</span>
                  Jadwalkan ulang
                </button>
              )}
              <button onClick={() => setSelected(null)} className="btn-secondary w-full justify-center">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {reschedule && (
        <RescheduleModal
          bookingId={reschedule.id}
          doctorId={reschedule.doctor_id}
          doctorName={reschedule.doctor?.name}
          onClose={() => setReschedule(null)}
          onDone={() => setRefreshTick((t) => t + 1)}
        />
      )}
    </div>
  )
}

function Row({ hour, children }: { hour: number; children: React.ReactNode }) {
  return (
    <>
      <div className="border-b border-border text-[10px] text-ink-dim text-center py-2">{String(hour).padStart(2, "0")}:00</div>
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
