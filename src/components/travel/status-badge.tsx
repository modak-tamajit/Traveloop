import {Badge} from "@/components/ui/badge"
import type {TripStatus} from "@/types"

const statusVariant: Record<TripStatus, "default" | "success" | "warning" | "muted" | "info"> = {
  draft: "muted",
  planned: "info",
  active: "success",
  completed: "default",
  archived: "warning",
}

export function StatusBadge({status}: {status: TripStatus}) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>
}
