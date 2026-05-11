import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "teal" | "blue" | "amber" | "red" | "purple" | "pink" | "gray"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClass: Record<BadgeVariant, string> = {
  teal:   "pill-teal",
  blue:   "pill-blue",
  amber:  "pill-amber",
  red:    "pill-red",
  purple: "pill-purple",
  pink:   "pill-pink",
  gray:   "pill-gray",
}

export function Badge({ className, variant = "gray", ...props }: BadgeProps) {
  return (
    <span
      className={cn("pill", variantClass[variant], className)}
      {...props}
    />
  )
}
