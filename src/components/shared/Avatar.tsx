import { cn } from "@/lib/utils"

interface AvatarProps {
  name:       string
  src?:       string | null
  size?:      "xs" | "sm" | "md" | "lg" | "xl"
  status?:    "online" | "offline" | "busy" | null
  className?: string
  ring?:      boolean
}

const sizeClass: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "size-6  text-[10px]",
  sm: "size-8  text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
  xl: "size-20 text-lg",
}

const statusSize: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-3.5",
}

// Generate gradient deterministik dari nama → 2 warna brand
// Warm Sand & Sage-friendly gradients (sage / clay / slate / sand tones)
const PALETTES: Array<[string, string]> = [
  ["#466147", "#5e7a5e"],  // sage
  ["#385f73", "#51788d"],  // slate
  ["#95492b", "#bd6a45"],  // clay
  ["#C97B2C", "#e0a05a"],  // amber-clay
  ["#5b6e4f", "#7c906c"],  // olive
  ["#7a5b3e", "#a07e5a"],  // taupe
  ["#54707d", "#7794a1"],  // blue-grey
  ["#8a5a4a", "#b07f6c"],  // terracotta
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((w) => /^[A-Za-zÀ-ÿ]/.test(w))
  return (
    parts.slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?"
  )
}

export function Avatar({ name, src, size = "md", status, className, ring }: AvatarProps) {
  const initials = getInitials(name)
  const [c1, c2] = PALETTES[hashName(name) % PALETTES.length]

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-white overflow-hidden",
          sizeClass[size],
          ring && "ring-2 ring-surface ring-offset-2 ring-offset-transparent",
        )}
        style={!src ? { backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` } : undefined}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="size-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          aria-label={status}
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-surface",
            statusSize[size],
            status === "online" ? "bg-primary online-dot" :
            status === "busy"   ? "bg-warning" :
            "bg-ink-dim",
          )}
        />
      )}
    </div>
  )
}
