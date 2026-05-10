import {CalendarDays, MapPin, Users} from "lucide-react"
import {Link} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {InteractiveCard} from "@/components/ui/card"
import {Progress} from "@/components/ui/progress"
import {StatusBadge} from "@/components/travel/status-badge"
import type {Trip} from "@/types"

export function TripCard({trip}: {trip: Trip}) {
  return (
    <InteractiveCard className="overflow-hidden">
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        <img alt={trip.destination} className="h-full w-full object-cover" src={trip.coverImageUrl} />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">{trip.title}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground/65">
              <MapPin className="h-4 w-4" />
              {trip.destination}
            </p>
          </div>
          <StatusBadge status={trip.status} />
        </div>
        <div className="mt-4 grid gap-2 text-sm text-foreground/65 sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {trip.startDate} to {trip.endDate}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {trip.travelers ?? 1} travelers
          </span>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs font-semibold text-foreground/55">
            <span>Plan progress</span>
            <span>{trip.progress ?? 0}%</span>
          </div>
          <Progress value={trip.progress ?? 0} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link to={`/trip/${trip.id}`}>Overview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/edit-trip/${trip.id}`}>Edit</Link>
          </Button>
        </div>
      </div>
    </InteractiveCard>
  )
}
