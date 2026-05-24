import { cn } from "@/lib/utils"

interface KPICardProps {
  label:    string
  value:    string | number
  delta?:   { value: string; isPositive: boolean } | { value: string; neutral: true }
  hint?:    string
  icon?:    string   // material symbol name
  accent?:  "teal" | "blue" | "amber" | "purple" | "red"
}

const ACCENT_BG: Record<NonNullable<KPICardProps["accent"]>, string> = {
  teal:   "bg-primary-soft text-primary",
  blue:   "bg-info-soft    text-tertiary",
  amber:  "bg-warning-soft text-warning",
  purple: "bg-accent-soft  text-secondary",
  red:    "bg-danger-soft  text-danger",
}

const DEFAULT_ICON: Record<NonNullable<KPICardProps["accent"]>, string> = {
  teal:   "forum",
  blue:   "smart_toy",
  amber:  "pending_actions",
  purple: "insights",
  red:    "priority_high",
}

export function KPICard({ label, value, delta, hint, icon, accent = "teal" }: KPICardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={cn("size-9 rounded-lg flex items-center justify-center", ACCENT_BG[accent])}>
          <span className="material-symbols-rounded text-[20px]">{icon ?? DEFAULT_ICON[accent]}</span>
        </span>
        {delta && (
          <span className={cn(
            "pill",
            "neutral" in delta ? "bg-surface-dim text-ink-muted"
              : delta.isPositive ? "bg-primary-soft text-primary" : "bg-danger-soft text-danger",
          )}>
            {!("neutral" in delta) && (delta.isPositive ? "↑" : "↓")} {delta.value}
          </span>
        )}
      </div>
      <p className="eyebrow">{label}</p>
      <p className="text-headline-lg text-ink leading-tight mt-1">{value}</p>
      {hint && <p className="text-body-sm text-ink-dim mt-0.5">{hint}</p>}
    </div>
  )
}
