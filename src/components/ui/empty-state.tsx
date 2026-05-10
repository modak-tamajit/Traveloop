import type {ReactNode} from "react"
import {Compass} from "lucide-react"
import {Card, CardContent} from "@/components/ui/card"
import {cn} from "@/lib/utils"

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center py-10 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-primary">
          {icon ?? <Compass className="h-6 w-6" />}
        </div>
        <h2 className="mt-4 text-lg font-bold">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-foreground/60">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </CardContent>
    </Card>
  )
}

export function ErrorState({title, description}: {title: string; description: string}) {
  return (
    <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
      <p className="font-bold">{title}</p>
      <p className="mt-1">{description}</p>
    </div>
  )
}
