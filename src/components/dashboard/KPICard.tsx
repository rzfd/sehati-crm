import { cn } from "@/lib/utils"

interface KPICardProps {
  label:    string
  value:    string | number
  delta?:   { value: string; isPositive: boolean }
  hint?:    string
  accent?:  "teal" | "blue" | "amber" | "purple" | "red"
}

const ACCENT_BG: Record<NonNullable<KPICardProps["accent"]>, string> = {
  teal:   "bg-teal-50   text-teal-600",
  blue:   "bg-blue-50   text-blue-600",
  amber:  "bg-amber-50  text-amber-600",
  purple: "bg-purple-50 text-purple-500",
  red:    "bg-red-50    text-red-500",
}

export function KPICard({ label, value, delta, hint, accent = "teal" }: KPICardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <span className={cn("size-7 rounded-lg flex items-center justify-center text-xs", ACCENT_BG[accent])}>•</span>
      </div>
      <p className="text-2xl font-medium text-gray-700 leading-tight">{value}</p>
      {(delta || hint) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {delta && (
            <span className={cn(delta.isPositive ? "text-teal-600" : "text-red-500", "font-medium")}>
              {delta.isPositive ? "↑" : "↓"} {delta.value}
            </span>
          )}
          {hint && <span className="text-gray-400">{hint}</span>}
        </div>
      )}
    </div>
  )
}
