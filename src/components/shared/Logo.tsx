import { cn } from "@/lib/utils"

interface LogoProps {
  size?:      number
  withText?:  boolean
  className?: string
  variant?:   "default" | "purple" | "white"
}

// Brand logo Sehati — heart + plus medical glyph.
export function Logo({ size = 28, withText = false, className, variant = "default" }: LogoProps) {
  const color1 = variant === "purple" ? "#534AB7" : variant === "white" ? "#FFFFFF" : "#1D9E75"
  const color2 = variant === "purple" ? "#9990F9" : variant === "white" ? "#FFFFFF" : "#5DCAA5"

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Sehati">
        <defs>
          <linearGradient id={`sehati-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill={`url(#sehati-${variant})`} />
        {/* Heart silhouette */}
        <path
          d="M16 24c-4-2.5-8-5.5-8-10.5C8 10.5 10 8.5 12.5 8.5c1.5 0 2.8 0.7 3.5 1.8 0.7-1.1 2-1.8 3.5-1.8C22 8.5 24 10.5 24 13.5 24 18.5 20 21.5 16 24z"
          fill="white"
          fillOpacity="0.18"
        />
        {/* Plus */}
        <path
          d="M16 11v8M12 15h8"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {withText && (
        <span className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Sehati
        </span>
      )}
    </span>
  )
}
