import { cn } from "@/lib/utils"

interface KPICardProps {
  label:    string
  value:    string | number
  delta?:   { value: string; isPositive: boolean }
  hint?:    string
  accent?:  "teal" | "blue" | "amber" | "purple" | "red"
  sparkline?: number[]  // mini chart data 7 hari
}

const ACCENT_BG: Record<NonNullable<KPICardProps["accent"]>, string> = {
  teal:   "bg-teal-50   text-teal-600   dark:bg-teal-500/15   dark:text-teal-400",
  blue:   "bg-blue-50   text-blue-600   dark:bg-blue-500/15   dark:text-blue-400",
  amber:  "bg-amber-50  text-amber-600  dark:bg-amber-500/15  dark:text-amber-400",
  purple: "bg-purple-50 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400",
  red:    "bg-red-50    text-red-500    dark:bg-red-500/15    dark:text-red-400",
}

const STROKE_COLOR: Record<NonNullable<KPICardProps["accent"]>, string> = {
  teal:   "#1D9E75",
  blue:   "#185FA5",
  amber:  "#BA7517",
  purple: "#534AB7",
  red:    "#A32D2D",
}

export function KPICard({ label, value, delta, hint, accent = "teal", sparkline }: KPICardProps) {
  return (
    <div className="card p-4 lift-on-hover">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
        <span className={cn("size-7 rounded-lg flex items-center justify-center text-xs font-semibold", ACCENT_BG[accent])}>•</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">{value}</p>
      {(delta || hint) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {delta && (
            <span className={cn(delta.isPositive ? "text-teal-600 dark:text-teal-400" : "text-red-500 dark:text-red-400", "font-medium")}>
              {delta.isPositive ? "↑" : "↓"} {delta.value}
            </span>
          )}
          {hint && <span className="text-gray-400 dark:text-gray-500">{hint}</span>}
        </div>
      )}
      {sparkline && sparkline.length > 1 && (
        <Sparkline data={sparkline} stroke={STROKE_COLOR[accent]} />
      )}
    </div>
  )
}

function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 100
  const h = 24
  const points = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(" ")

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-2 w-full h-6 opacity-80">
      <defs>
        <linearGradient id={`sparkfill-${stroke}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#sparkfill-${stroke})`}
      />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
