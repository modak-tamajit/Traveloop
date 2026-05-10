import type {ReactNode} from "react"

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-accent">{eyebrow}</p> : null}
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm text-foreground/60">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
