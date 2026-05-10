import type {LucideIcon} from "lucide-react"
import {Card, CardContent} from "@/components/ui/card"

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string | number
  detail?: string
  icon: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-foreground/60">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        {detail ? <p className="mt-3 text-xs font-semibold text-foreground/55">{detail}</p> : null}
      </CardContent>
    </Card>
  )
}
