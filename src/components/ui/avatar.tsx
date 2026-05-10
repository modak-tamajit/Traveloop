import {User} from "lucide-react"
import {cn} from "@/lib/utils"

export function Avatar({src, fallback, className}: {src?: string; fallback?: string; className?: string}) {
  return (
    <span className={cn("grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-sm font-bold text-primary ring-1 ring-border", className)}>
      {src ? <img alt={fallback ?? "User"} className="h-full w-full object-cover" src={src} /> : fallback ? fallback.slice(0, 2).toUpperCase() : <User className="h-5 w-5" />}
    </span>
  )
}
