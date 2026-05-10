import type {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"

type BadgeVariant = "default" | "success" | "warning" | "muted" | "danger" | "info"

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary ring-primary/15",
  success: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  warning: "bg-gold/18 text-amber-800 ring-gold/30 dark:text-amber-200",
  muted: "bg-muted text-foreground/70 ring-border",
  danger: "bg-red-500/12 text-red-700 ring-red-500/20 dark:text-red-300",
  info: "bg-sky-500/12 text-sky-700 ring-sky-500/20 dark:text-sky-300",
}

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {variant?: BadgeVariant}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
