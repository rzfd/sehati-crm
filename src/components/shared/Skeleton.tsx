import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton-shimmer rounded", className)} />
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("card p-4 space-y-3", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function SkeletonListItem() {
  return (
    <div className="px-3 py-3 border-b border-black/[0.04] dark:border-white/[0.04] space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
    </div>
  )
}
