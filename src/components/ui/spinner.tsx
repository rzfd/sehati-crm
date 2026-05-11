import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClass = { sm: "size-4", md: "size-6", lg: "size-8" }

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <span
      className={cn(
        sizeClass[size],
        "border-2 border-gray-200 border-t-teal-400 rounded-full animate-spin inline-block",
        className
      )}
    />
  )
}
