import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "purple" | "sage" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  danger:    "btn-danger",
  purple:    "btn-purple",
  sage:      "btn-sage",
  ghost:     "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface-alt transition-colors",
}

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "",
  lg: "px-5 py-2.5 text-base",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(variantClass[variant], sizeClass[size], className)}
        {...props}
      >
        {loading && (
          <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
