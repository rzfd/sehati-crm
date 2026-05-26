"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createClient } from "@/lib/supabase/client"
import { Avatar } from "@/components/shared/Avatar"
import { formatDoctorName } from "@/lib/format"

interface PopularDoctor {
  id:         string
  name:       string
  title:      string
  specialty:  string
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
  const [doctors, setDoctors] = useState<PopularDoctor[]>([])
  const [tip] = useState(() => HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)])

  useEffect(() => {
    if (!userLoading && patient?.is_new) router.replace("/onboarding")
  }, [userLoading, patient, router])

  useEffect(() => {
    if (!patient) return
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      const { data } = await supabase
        .from("doctors")
        .select("id, name, title, specialty, avatar_url")
        .eq("clinic_id", patient.clinic_id)
        .eq("is_active", true)
        .limit(8)
      if (cancelled) return
      setDoctors((data ?? []) as unknown as PopularDoctor[])
    })()
    return () => { cancelled = true }
  }, [patient])

  if (userLoading) {
    return <div className="p-6 lg:p-8 text-body-md text-ink-muted">Memuat…</div>
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl">
      {/* AI assistant hero — CTA utama */}
      <div className="rounded-2xl bg-primary-soft border border-primary-dim p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0">
          <span className="material-symbols-rounded filled text-[24px]">auto_awesome</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="eyebrow text-primary">Asisten AI Sehati</p>
          <p className="text-body-md text-ink-muted mt-1.5 leading-relaxed">
            Butuh bantuan hari ini? Saya bisa membantu menjadwalkan kontrol atau menjawab pertanyaan ringan seputar klinik.
          </p>
        </div>
        <Link href="/chat" className="btn-primary py-3 px-5 shrink-0">
          Buka Asisten AI
          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="text-headline-sm text-ink mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ActionCard href="/chat" icon="chat_bubble" label="Chat" desc="Konsultasi dokter" accent="info" />
          <ActionCard href="/booking" icon="calendar_month" label="Booking" desc="Atur jadwal temu" accent="clay" />
          <ActionCard href="/history" icon="receipt_long" label="Riwayat" desc="Janji & status" accent="sage" />
          <ActionCard href="/profile" icon="person" label="Profil" desc="Data & privasi" accent="slate" />
        </div>
      </section>

      {/* Dokter Kami */}
      {doctors.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-headline-sm text-ink">Dokter Kami</h2>
            <Link href="/booking" className="text-body-sm font-semibold text-primary hover:underline">Buat janji</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {doctors.map((d) => (
              <Link
                key={d.id}
                href="/booking"
                className="card-hover p-4 flex flex-col items-center text-center"
              >
                <Avatar name={d.name} src={d.avatar_url} size="lg" />
                <p className="text-card-title text-ink mt-2 truncate w-full">{formatDoctorName(d)}</p>
                <p className="text-body-sm text-ink-muted truncate w-full">{d.specialty}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Daily tip */}
      <div className="card p-4 bg-surface-alt border-border max-w-xl">
        <p className="eyebrow text-primary mb-2">Tips Hari Ini</p>
        <div className="flex gap-3 items-start">
          <div className="text-3xl flex-shrink-0">{tip.icon}</div>
          <div>
            <p className="text-card-title text-ink">{tip.title}</p>
            <p className="text-body-sm text-ink-muted mt-0.5">{tip.body}</p>
          </div>
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
