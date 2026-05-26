"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { KPICard } from "@/components/dashboard/KPICard"
import { VolumeChart } from "@/components/dashboard/VolumeChart"
import { AIPerformanceSection } from "@/components/dashboard/AIPerformanceSection"
import { AnomalyBanner } from "@/components/dashboard/AnomalyBanner"

type Period = "Hari ini" | "7 hari" | "30 hari"

interface Anomaly {
  type:    "volume_spike" | "urgency_spike" | "ai_drop"
  message: string
}

interface DashboardData {
  kpi: {
    total_conversations: number
    ai_handled_pct:      number
    urgent_count:        number
    open_count:          number
  }
  volume:         { day: string; ai: number; staff: number; total: number }[]
  ai_performance: {
    total_conversations: number
    ai_handled:          number
    hit_rate:            number
    avg_confidence:      number
    kb_coverage:         number
    time_saved_minutes:  number
  }
  anomalies: Anomaly[]
}

export default function StaffDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>("7 hari")
  const [insight, setInsight] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/dashboard")
      if (cancelled) return
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? "Gagal memuat.")
      } else {
        setData(await res.json())
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  // Insight AI naratif dari metrik (progressive enhancement; setState hanya di async).
  useEffect(() => {
    if (!data) return
    let cancelled = false
    fetch("/api/dashboard/insight", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        total_conversations: data.kpi.total_conversations,
        ai_handled_pct:      data.kpi.ai_handled_pct,
        urgent_count:        data.kpi.urgent_count,
        open_count:          data.kpi.open_count,
        hit_rate:            data.ai_performance.hit_rate,
        kb_coverage:         data.ai_performance.kb_coverage,
        time_saved_minutes:  data.ai_performance.time_saved_minutes,
        anomalies:           data.anomalies.map((a) => a.message),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d?.insight) setInsight(d.insight) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [data])

  if (loading) return <div className="p-6 text-body-md text-ink-muted">Memuat dashboard…</div>
  if (error)   return <div className="p-6 text-body-md text-danger">{error}</div>
  if (!data)   return null

  const totalSaved = data.ai_performance.time_saved_minutes
  const aiHandled = data.kpi.ai_handled_pct

  return (
    <div>
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 h-topbar-height bg-background/95 backdrop-blur border-b border-border">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-rounded text-[18px] text-ink-dim absolute left-3 top-1/2 -translate-y-1/2">search</span>
          <input
            className="w-full rounded-full bg-surface border border-border pl-9 pr-3 py-2 text-body-md text-ink placeholder:text-ink-dim focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Cari laporan atau aktivitas…"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-surface-alt p-1">
          {(["Hari ini", "7 hari", "30 hari"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors",
                period === p ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-headline-md text-ink">Ringkasan</h1>
          <p className="text-body-md text-ink-muted">Ringkasan performa sistem hari ini.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
          {/* Main column */}
          <div className="space-y-5 min-w-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard label="Pesan Masuk" value={data.kpi.total_conversations} accent="teal" icon="forum"
                delta={{ value: "Total", neutral: true }} />
              <KPICard label="Auto-resolved" value={`${aiHandled.toFixed(1)}%`} accent="purple" icon="smart_toy"
                delta={{ value: `${aiHandled.toFixed(0)}%`, isPositive: aiHandled >= 50 }} />
              <KPICard label="Escalated" value={data.kpi.urgent_count} accent="red" icon="priority_high"
                hint="Level 3-4" />
              <KPICard label="Belum Selesai" value={data.kpi.open_count} accent="amber" icon="pending_actions"
                hint="Open" />
            </div>

            {data.anomalies.length > 0 && <AnomalyBanner anomalies={data.anomalies} />}

            <VolumeChart data={data.volume} />

            {/* AI insight callout */}
            <div className="rounded-xl bg-primary-soft border border-primary-dim p-4 flex gap-3">
              <span className="material-symbols-rounded filled text-primary text-[22px] shrink-0">auto_awesome</span>
              <div>
                <p className="eyebrow text-primary">Insight AI</p>
                <p className="text-body-md text-ink mt-1">
                  {insight ?? (
                    <>AI menangani <strong>{aiHandled.toFixed(0)}%</strong> percakapan otomatis minggu ini, menghemat estimasi <strong>{totalSaved} menit</strong> waktu staff.</>
                  )}
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 flex items-center gap-3">
                <span className="size-10 rounded-lg bg-info-soft text-tertiary flex items-center justify-center">
                  <span className="material-symbols-rounded text-[20px]">groups</span>
                </span>
                <div>
                  <p className="eyebrow">Total Chat</p>
                  <p className="text-headline-sm text-ink">{data.kpi.total_conversations}</p>
                </div>
              </div>
              <div className="card p-4 flex items-center gap-3">
                <span className="size-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <span className="material-symbols-rounded text-[20px]">task_alt</span>
                </span>
                <div>
                  <p className="eyebrow">Waktu Dihemat</p>
                  <p className="text-headline-sm text-ink">{totalSaved} mnt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right rail — AI & KB performance */}
          <AIPerformanceSection data={data.ai_performance} />
        </div>
      </div>
    </div>
  )
}
