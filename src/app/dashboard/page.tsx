"use client"

import { useEffect, useState } from "react"
import { KPICard } from "@/components/dashboard/KPICard"
import { VolumeChart } from "@/components/dashboard/VolumeChart"
import { AIPerformanceSection } from "@/components/dashboard/AIPerformanceSection"
import { AnomalyBanner } from "@/components/dashboard/AnomalyBanner"

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

  if (loading) return <div className="p-6 text-sm text-gray-500">Memuat dashboard…</div>
  if (error)   return <div className="p-6 text-sm text-red-500">{error}</div>
  if (!data)   return null

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-700">Dashboard</h1>
          <p className="text-xs text-gray-500">Ringkasan 7 hari terakhir</p>
        </div>
      </div>

      <AnomalyBanner anomalies={data.anomalies} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total chat" value={data.kpi.total_conversations} accent="teal"
          sparkline={data.volume.map((v) => v.total)}
        />
        <KPICard
          label="AI handled" value={`${data.kpi.ai_handled_pct.toFixed(0)}%`} accent="purple"
          hint="Auto-reply rate"
          sparkline={data.volume.map((v) => v.ai)}
        />
        <KPICard
          label="Urgent" value={data.kpi.urgent_count} accent="red"
          hint="Level 3-4"
        />
        <KPICard
          label="Open" value={data.kpi.open_count} accent="amber"
          hint="Belum resolved"
          sparkline={data.volume.map((v) => v.staff)}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <VolumeChart data={data.volume} />
        </div>
        <AIPerformanceSection data={data.ai_performance} />
      </div>
    </div>
  )
}
