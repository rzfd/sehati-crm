import { cn } from "@/lib/utils"

type AvatarVariant = "teal" | "blue" | "amber" | "red" | "purple" | "pink" | "gray"

interface AvatarProps {
  name:       string
  size?:      "sm" | "md" | "lg"
  variant?:   AvatarVariant
  className?: string
}

const sizeClass: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
}

const variantClass: Record<AvatarVariant, string> = {
  teal:   "bg-teal-50 text-teal-600",
  blue:   "bg-blue-50 text-blue-600",
  amber:  "bg-amber-50 text-amber-600",
  red:    "bg-red-50 text-red-500",
  purple: "bg-purple-50 text-purple-500",
  pink:   "bg-pink-50 text-pink-500",
  gray:   "bg-gray-100 text-gray-500",
}

export function Avatar({ name, size = "md", variant = "gray", className }: AvatarProps) {
  const initials =
    name
      .split(" ")
      .filter((w) => /^[A-Za-z]/.test(w))
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium shrink-0",
        sizeClass[size],
        variantClass[variant],
        className
      )}
    >
      {initials}
    </div>
  )
}
