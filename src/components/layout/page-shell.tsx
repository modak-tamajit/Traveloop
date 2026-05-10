import type {ReactNode} from "react"
import {cn} from "@/lib/utils"

export function PageShell({children, className}: {children: ReactNode; className?: string}) {
  return (
    <main className={cn("page-enter mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10", className)}>
      {children}
    </main>
  )
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: string
  eyebrow?: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-bold uppercase tracking-wide text-accent">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-foreground/60">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
