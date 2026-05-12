"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createClient } from "@/lib/supabase/client"
import { format, parseISO, differenceInDays } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Avatar } from "@/components/shared/Avatar"

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
    return <div className="p-6 text-sm text-gray-500">Memuat…</div>
  }

  const greeting = getGreeting()
  const firstName = patient?.name?.split(" ")[0] ?? "Pasien"
  const daysToBooking = upcoming ? differenceInDays(parseISO(upcoming.booking_date), new Date()) : null

  return (
    <div className="pb-4">
      {/* Hero header */}
      <div className="bg-hero-teal px-4 pt-6 pb-8 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{greeting},</p>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{firstName} 👋</h1>
            <p className="text-xs text-gray-500 mt-1">Semoga hari Anda menyenangkan.</p>
          </div>
          <Link
            href="/profile"
            aria-label="Profil"
            className="rounded-full"
          >
            <Avatar name={patient?.name ?? "P"} size="md" ring />
          </Link>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <MiniStat label="Janji aktif" value={upcoming ? "1" : "0"} accent="teal" />
          <MiniStat label="Dokter" value={String(doctors.length)} accent="blue" />
          <MiniStat label="AI siap" value="24/7" accent="purple" />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Next appointment */}
        <div className="card p-4 lift-on-hover">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Janji berikutnya</p>
            {daysToBooking !== null && daysToBooking <= 1 && (
              <span className="pill pill-amber">
                {daysToBooking === 0 ? "Hari ini" : "Besok"}
              </span>
            )}
          </div>
          {bookingLoading ? (
            <p className="text-sm text-gray-400">Memuat…</p>
          ) : upcoming ? (
            <div>
              <div className="flex items-center gap-3">
                <Avatar name={upcoming.doctor?.name ?? "D"} src={upcoming.doctor?.avatar_url ?? null} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {upcoming.doctor?.title ?? "dr."} {upcoming.doctor?.name}
                  </p>
                  <p className="text-xs text-gray-500">{upcoming.doctor?.specialty}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 text-teal-500">
                    <rect x="3" y="4.5" width="14" height="12" rx="2"/><path d="M3 8h14M7 3v3M13 3v3" strokeLinecap="round"/>
                  </svg>
                  {format(parseISO(upcoming.booking_date), "EEEE, d MMM", { locale: idLocale })}
                </span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 text-teal-500">
                    <circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2" strokeLinecap="round"/>
                  </svg>
                  {upcoming.booking_time.slice(0, 5)}
                </span>
              </div>
              <div className="mt-3 flex gap-2 items-center">
                <span className={`pill ${upcoming.status === "confirmed" ? "pill-teal" : "pill-amber"}`}>
                  {upcoming.status === "confirmed" ? "✓ Terkonfirmasi" : "Menunggu konfirmasi"}
                </span>
                <Link href="/history" className="text-xs text-teal-600 dark:text-teal-400 hover:underline ml-auto">
                  Detail →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Belum ada janji.</p>
              <Link href="/booking" className="btn-primary text-xs">+ Buat janji</Link>
            </div>
          )}
        </div>

        {/* Quick actions grid */}
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-2 px-1">Layanan cepat</p>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard href="/chat" icon="💬" label="Tanya AI" desc="Dijawab 24/7 dengan KB klinik" accent="teal" />
            <ActionCard href="/booking" icon="📅" label="Booking" desc="Atur jadwal dokter" accent="blue" />
            <ActionCard href="/history" icon="📋" label="Riwayat" desc="Janji & status booking" accent="purple" />
            <ActionCard href="/profile" icon="👤" label="Profil" desc="Edit data & privasi" accent="amber" />
          </div>
        </div>

        {/* Doctors carousel */}
        {doctors.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Dokter kami</p>
              <Link href="/booking" className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline">
                Lihat semua →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-thin -mx-1 px-1 pb-2">
              {doctors.map((d) => (
                <Link
                  key={d.id}
                  href="/booking"
                  className="card p-3 min-w-[140px] flex flex-col items-center text-center lift-on-hover"
                >
                  <Avatar name={d.name} src={d.avatar_url} size="lg" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mt-2 truncate w-full">{d.title} {d.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full">{d.specialty}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Daily tip */}
        <div className="card p-4 bg-hero-teal border-teal-400/30 dark:border-teal-500/20">
          <p className="text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-wide font-medium mb-2">Tips hari ini</p>
          <div className="flex gap-3 items-start">
            <div className="text-3xl flex-shrink-0">{tip.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{tip.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{tip.body}</p>
            </div>
          </div>
        </div>

        {/* Emergency banner */}
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/10 p-3 flex items-start gap-3">
          <div className="size-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            !
          </div>
          <div className="text-xs">
            <p className="font-semibold text-red-700 dark:text-red-300">Keadaan darurat?</p>
            <p className="text-red-600/80 dark:text-red-400/80 mt-0.5">Segera ke IGD terdekat atau hubungi 119. AI di sini tidak untuk emergensi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent: "teal" | "blue" | "purple" }) {
  const map = {
    teal:   "bg-white/80 dark:bg-neutral-900/80 text-teal-700   dark:text-teal-300   border-teal-400/20",
    blue:   "bg-white/80 dark:bg-neutral-900/80 text-blue-700   dark:text-blue-300   border-blue-500/20",
    purple: "bg-white/80 dark:bg-neutral-900/80 text-purple-700 dark:text-purple-300 border-purple-500/20",
  }
  return (
    <div className={`rounded-lg px-3 py-2 backdrop-blur border ${map[accent]}`}>
      <p className="text-[10px] uppercase opacity-75 font-medium">{label}</p>
      <p className="text-base font-bold">{value}</p>
    </div>
  )
}

function ActionCard({ href, icon, label, desc, accent }: {
  href: string; icon: string; label: string; desc: string; accent: "teal" | "blue" | "purple" | "amber"
}) {
  const bgMap = {
    teal:   "bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400",
    blue:   "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-500/15 text-purple-500 dark:text-purple-400",
    amber:  "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  }
  return (
    <Link href={href} className="card lift-on-hover p-4 flex flex-col gap-2">
      <div className={`size-10 rounded-full flex items-center justify-center text-lg ${bgMap[accent]}`}>{icon}</div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{label}</p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{desc}</p>
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
