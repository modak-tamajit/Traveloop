import type {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"

export function Skeleton({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} {...props} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  )
}
