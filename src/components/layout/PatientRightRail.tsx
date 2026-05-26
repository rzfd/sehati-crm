"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format, parseISO, differenceInDays } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createClient } from "@/lib/supabase/client"
import { Avatar } from "@/components/shared/Avatar"

interface NextBooking {
  id:           string
  booking_date: string
  booking_time: string
  status:       string
  doctor:       { name: string; specialty: string; title: string; avatar_url?: string | null } | null
}

// Right rail persisten untuk pasien: janji berikutnya (self-fetch + realtime),
// shortcut Asisten AI, dan kartu darurat. Tampil ≥ lg.
export function PatientRightRail() {
  const { patient } = useCurrentUser()
  const [next, setNext]       = useState<NextBooking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patient) return
    let cancelled = false
    const supabase = createClient()

    async function load() {
      const today = new Date().toISOString().split("T")[0]
      const { data } = await supabase
        .from("bookings")
        .select("id, booking_date, booking_time, status, doctor:doctors(name, specialty, title, avatar_url)")
        .eq("patient_id", patient!.id)
        .gte("booking_date", today)
        .in("status", ["pending", "confirmed"])
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true })
        .limit(1)
        .maybeSingle()
      if (cancelled) return
      setNext((data as unknown as NextBooking) ?? null)
      setLoading(false)
    }
    load()

    // Realtime: rail ikut update saat staff konfirmasi / pasien batalkan.
    const channel = supabase
      .channel(`rail:bookings:${patient.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `patient_id=eq.${patient.id}` },
        () => load(),
      )
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [patient])

  const daysTo = next ? differenceInDays(parseISO(next.booking_date), new Date()) : null

  return (
    <aside className="hidden lg:flex w-[300px] shrink-0 flex-col gap-4 border-l border-border bg-surface-alt/40 overflow-y-auto p-4">
      {/* Janji berikutnya */}
      <div>
        <p className="eyebrow mb-2">Janji Berikutnya</p>
        <div className="card p-4">
          {loading ? (
            <p className="text-body-md text-ink-dim">Memuat…</p>
          ) : next ? (
            <div>
              <div className="flex items-center gap-3">
                <Avatar name={next.doctor?.name ?? "D"} src={next.doctor?.avatar_url ?? null} size="md" status="online" />
                <div className="min-w-0 flex-1">
                  <p className="text-card-title text-ink truncate">{next.doctor?.title ?? "dr."} {next.doctor?.name}</p>
                  <p className="text-body-sm text-ink-muted truncate">{next.doctor?.specialty}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-body-sm text-ink">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[16px] text-secondary">calendar_today</span>
                  {daysTo === 0 ? "Hari ini" : daysTo === 1 ? "Besok" : format(parseISO(next.booking_date), "EEEE, d MMM", { locale: idLocale })}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[16px] text-secondary">schedule</span>
                  {next.booking_time.slice(0, 5)} WIB
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-border-soft">
                <span className={next.status === "confirmed" ? "pill-sukses" : "pill-warning"}>
                  {next.status === "confirmed" ? "Terkonfirmasi" : "Menunggu"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-body-md text-ink-muted mb-2">Belum ada janji.</p>
              <Link href="/booking" className="btn-sage text-sm inline-flex">+ Buat janji</Link>
            </div>
          )}
        </div>
      </div>

      {/* Asisten AI shortcut */}
      <div className="rounded-2xl bg-primary-soft border border-primary-dim p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="material-symbols-rounded filled text-[20px] text-primary">auto_awesome</span>
          <p className="eyebrow text-primary">Asisten AI</p>
        </div>
        <p className="text-body-sm text-ink-muted leading-relaxed">
          Tanya jam buka, biaya, BPJS, atau jadwalkan kontrol — 24/7.
        </p>
        <Link href="/chat" className="btn-primary w-full mt-3 py-2.5">Buka Asisten AI</Link>
      </div>

      {/* Darurat */}
      <div className="mt-auto rounded-xl border border-danger/20 bg-danger-soft p-3 flex items-start gap-3">
        <div className="size-8 rounded-full bg-danger flex items-center justify-center text-white font-bold flex-shrink-0">!</div>
        <div className="text-body-sm">
          <p className="font-semibold text-danger">Keadaan darurat?</p>
          <p className="text-danger/80 mt-0.5">Ke IGD terdekat atau hubungi 119.</p>
        </div>
      </div>
    </aside>
  )
}
