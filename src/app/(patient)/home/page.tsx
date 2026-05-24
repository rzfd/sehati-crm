"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createClient } from "@/lib/supabase/client"
import { format, parseISO, differenceInDays } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Avatar } from "@/components/shared/Avatar"
import { formatDoctorName } from "@/lib/format"

interface UpcomingBooking {
  id:            string
  booking_date:  string
  booking_time:  string
  status:        string
  doctor:        { name: string; specialty: string; title: string; avatar_url?: string | null } | null
}

interface PopularDoctor {
  id:        string
  name:      string
  title:     string
  specialty: string
  avatar_url: string | null
}

const HEALTH_TIPS = [
  { icon: "💧", title: "Cukup minum air", body: "8 gelas per hari menjaga ginjal & metabolisme." },
  { icon: "🛌", title: "Tidur cukup",     body: "Idealnya 7-9 jam untuk sistem imun yang sehat." },
  { icon: "🏃", title: "Aktif bergerak",  body: "Minimal 30 menit jalan kaki tiap hari." },
  { icon: "🥗", title: "Makan seimbang",  body: "Setengah piring sayur + buah pada tiap makan." },
  { icon: "🧘", title: "Kelola stres",    body: "Meditasi 10 menit/hari turunkan kortisol." },
]

export default function PatientHomePage() {
  const router = useRouter()
  const { loading: userLoading, patient } = useCurrentUser()
  const [upcoming, setUpcoming] = useState<UpcomingBooking | null>(null)
  const [doctors, setDoctors]   = useState<PopularDoctor[]>([])
  const [bookingLoading, setBookingLoading] = useState(true)
  const [tip] = useState(() => HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)])

  useEffect(() => {
    if (!userLoading && patient?.is_new) router.replace("/onboarding")
  }, [userLoading, patient, router])

  useEffect(() => {
    if (!patient) return
    let cancelled = false
    const supabase = createClient()

    async function load() {
      const today = new Date().toISOString().split("T")[0]
      const [bRes, dRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, booking_date, booking_time, status, doctor:doctors(name, specialty, title, avatar_url)")
          .eq("patient_id", patient!.id)
          .gte("booking_date", today)
          .in("status", ["pending", "confirmed"])
          .order("booking_date", { ascending: true })
          .order("booking_time", { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("doctors")
          .select("id, name, title, specialty, avatar_url")
          .eq("clinic_id", patient!.clinic_id)
          .eq("is_active", true)
          .limit(6),
      ])
      if (cancelled) return
      /* eslint-disable react-hooks/set-state-in-effect */
      setUpcoming((bRes.data as unknown as UpcomingBooking) ?? null)
      setDoctors(((dRes.data ?? []) as unknown as PopularDoctor[]))
      setBookingLoading(false)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    load()
    return () => { cancelled = true }
  }, [patient])

  if (userLoading) {
    return <div className="p-6 text-body-md text-ink-muted">Memuat…</div>
  }

  const greeting = getGreeting()
  const firstName = patient?.name?.split(" ")[0] ?? "Pasien"
  const daysToBooking = upcoming ? differenceInDays(parseISO(upcoming.booking_date), new Date()) : null

  return (
    <div className="relative px-mobile-margin pt-6 pb-6">
      {/* Greeting header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="eyebrow">{greeting}</p>
          <h1 className="text-headline-lg text-ink mt-1">Halo, {firstName} 👋</h1>
        </div>
        <Link
          href="/profile"
          aria-label="Notifikasi"
          className="size-10 rounded-full bg-surface border border-border shadow-card flex items-center justify-center text-ink-muted"
        >
          <span className="material-symbols-rounded text-[20px]">notifications</span>
        </Link>
      </div>

      {/* AI assistant hero card */}
      <div className="rounded-2xl bg-primary-soft border border-primary-dim p-4 mb-6">
        <div className="flex gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0">
            <span className="material-symbols-rounded filled text-[24px]">auto_awesome</span>
          </div>
          <div className="flex-1">
            <p className="eyebrow text-primary">Asisten AI Sehati</p>
            <p className="text-body-md text-ink-muted mt-1.5 leading-relaxed">
              Butuh bantuan hari ini? Saya bisa membantu menjadwalkan kontrol atau menjawab pertanyaan medis ringan Anda.
            </p>
          </div>
        </div>
        <Link href="/chat" className="btn-primary w-full mt-4 py-3">
          Buka Asisten AI
          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {/* Next appointment */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-headline-sm text-ink">Janji Berikutnya</h2>
        <Link href="/history" className="text-body-sm font-semibold text-primary hover:underline">Lihat Semua</Link>
      </div>

      <div className="card p-4 mb-6">
        {bookingLoading ? (
          <p className="text-body-md text-ink-dim">Memuat…</p>
        ) : upcoming ? (
          <div>
            <div className="flex items-center gap-3">
              <Avatar name={upcoming.doctor?.name ?? "D"} src={upcoming.doctor?.avatar_url ?? null} size="lg" status="online" />
              <div className="flex-1 min-w-0">
                <p className="text-headline-sm text-ink truncate">
                  {upcoming.doctor?.title ?? "dr."} {upcoming.doctor?.name}
                </p>
                <p className="text-body-sm text-ink-muted">{upcoming.doctor?.specialty}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-alt px-3 py-1.5 text-body-sm text-ink">
                <span className="material-symbols-rounded text-[16px] text-secondary">calendar_today</span>
                {daysToBooking === 0 ? "Hari ini" : daysToBooking === 1 ? "Besok" : format(parseISO(upcoming.booking_date), "EEEE, d MMM", { locale: idLocale })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-alt px-3 py-1.5 text-body-sm text-ink">
                <span className="material-symbols-rounded text-[16px] text-secondary">schedule</span>
                {upcoming.booking_time.slice(0, 5)} WIB
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-border-soft flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-body-sm text-ink-muted">
                <span className="material-symbols-rounded text-[16px] text-ink-dim">location_on</span>
                Klinik Sehati
              </span>
              <span className={upcoming.status === "confirmed" ? "pill-sukses" : "pill-warning"}>
                {upcoming.status === "confirmed" ? "Terkonfirmasi" : "Menunggu"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-body-md text-ink-muted">Belum ada janji terjadwal.</p>
            <Link href="/booking" className="btn-sage text-sm">+ Buat janji</Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <ActionCard href="/chat" icon="chat_bubble" label="Chat" desc="Konsultasi dokter" accent="info" />
        <ActionCard href="/booking" icon="calendar_month" label="Booking" desc="Atur jadwal temu" accent="clay" />
        <ActionCard href="/history" icon="receipt_long" label="Riwayat" desc="Janji & status" accent="sage" />
        <ActionCard href="/profile" icon="person" label="Profil" desc="Data & privasi" accent="slate" />
      </div>

      {/* Doctors */}
      {doctors.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-headline-sm text-ink">Dokter Kami</h2>
            <Link href="/booking" className="text-body-sm font-semibold text-primary hover:underline">Lihat Semua</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto chat-scroll -mx-mobile-margin px-mobile-margin pb-1">
            {doctors.map((d) => (
              <Link
                key={d.id}
                href="/booking"
                className="card p-3 min-w-[140px] flex flex-col items-center text-center"
              >
                <Avatar name={d.name} src={d.avatar_url} size="lg" />
                <p className="text-card-title text-ink mt-2 truncate w-full">{formatDoctorName(d)}</p>
                <p className="text-body-sm text-ink-muted truncate w-full">{d.specialty}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Daily tip */}
      <div className="card p-4 mb-4 bg-surface-alt border-border">
        <p className="eyebrow text-primary mb-2">Tips Hari Ini</p>
        <div className="flex gap-3 items-start">
          <div className="text-3xl flex-shrink-0">{tip.icon}</div>
          <div>
            <p className="text-card-title text-ink">{tip.title}</p>
            <p className="text-body-sm text-ink-muted mt-0.5">{tip.body}</p>
          </div>
        </div>
      </div>

      {/* Emergency banner */}
      <div className="rounded-xl border border-danger/20 bg-danger-soft p-3 flex items-start gap-3">
        <div className="size-8 rounded-full bg-danger flex items-center justify-center text-white font-bold flex-shrink-0">!</div>
        <div className="text-body-sm">
          <p className="font-semibold text-danger">Keadaan darurat?</p>
          <p className="text-danger/80 mt-0.5">Segera ke IGD terdekat atau hubungi 119. AI di sini tidak untuk emergensi.</p>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ href, icon, label, desc, accent }: {
  href: string; icon: string; label: string; desc: string; accent: "sage" | "info" | "clay" | "slate"
}) {
  const bgMap = {
    sage:  "bg-primary-soft text-primary",
    info:  "bg-info-soft text-tertiary",
    clay:  "bg-accent-soft text-secondary",
    slate: "bg-surface-alt text-ink-muted",
  }
  return (
    <Link href={href} className="card-hover p-4 flex flex-col gap-2">
      <div className={`size-10 rounded-full flex items-center justify-center ${bgMap[accent]}`}>
        <span className="material-symbols-rounded text-[20px]">{icon}</span>
      </div>
      <p className="text-card-title text-ink">{label}</p>
      <p className="text-body-sm text-ink-muted leading-tight">{desc}</p>
    </Link>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}
