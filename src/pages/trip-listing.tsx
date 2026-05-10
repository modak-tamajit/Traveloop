import {ArrowRight, CalendarDays, MapPin} from "lucide-react"
import {Link} from "react-router-dom"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {StatusBadge} from "@/components/travel/status-badge"
import {trips} from "@/data/mock"
import type {Trip} from "@/types"

const tripGroups = [
  {label: "Ongoing", items: trips.filter((trip) => trip.status === "active")},
  {label: "Upcoming", items: trips.filter((trip) => trip.status === "planned" || trip.status === "draft")},
  {label: "Completed", items: [trips[1]]},
]

export function TripListingPage() {
  return (
    <PageShell>
      <PageHeader
        actions={
          <Button asChild variant="accent">
            <Link to="/add-trip">Plan a trip</Link>
          </Button>
        }
        description="All trips grouped by status, matching the listing workflow before opening a specific trip."
        eyebrow="My trips"
        title="Trip Listing"
      />
      <SearchToolbar placeholder="Search trips" />

      <div className="mt-6 space-y-6">
        {tripGroups.map((group) => (
          <section key={group.label}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold">{group.label}</h2>
              <Badge variant="muted">{group.items.length} trips</Badge>
            </div>
            <div className="space-y-3">
              {group.items.map((trip) => (
                <TripOverviewRow key={`${group.label}-${trip.id}`} trip={trip} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  )
}

function TripOverviewRow({trip}: {trip: Trip}) {
  return (
    <Card>
      <CardContent className="grid gap-4 pt-5 md:grid-cols-[140px_1fr_auto] md:items-center">
        <img alt={trip.destination} className="h-28 w-full rounded-lg object-cover md:w-36" src={trip.coverImageUrl} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold">{trip.title}</h3>
            <StatusBadge status={trip.status} />
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-foreground/65">
            <MapPin className="h-4 w-4" />
            {trip.destination}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-foreground/65">
            <CalendarDays className="h-4 w-4" />
            {trip.startDate} to {trip.endDate}
          </p>
        </div>
        <Button asChild>
          <Link to={`/trip/${trip.id}`}>
            View
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
