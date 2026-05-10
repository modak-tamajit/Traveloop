import {CalendarDays, Compass, MapPin, Share2} from "lucide-react"
import {useParams} from "react-router-dom"
import {Badge} from "@/components/ui/badge"
import {Card, CardContent} from "@/components/ui/card"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {itinerarySections, trips} from "@/data/mock"

export function PublicSharePage() {
  const {shareId} = useParams()
  const trip = trips.find((item) => item.isPublic) ?? trips[0]

  return (
    <PageShell>
      <PageHeader
        description="Approved itinerary details for guests and collaborators."
        eyebrow="Public itinerary"
        title={trip.title}
      />
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="relative min-h-72">
          <img alt={trip.destination} className="absolute inset-0 h-full w-full object-cover" src={trip.coverImageUrl} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="relative max-w-xl p-6 text-white sm:p-8">
            <Badge className="bg-white/15 text-white ring-white/25" variant="muted">
              Share {shareId}
            </Badge>
            <h2 className="mt-4 text-4xl font-bold">{trip.destination}</h2>
            <p className="mt-3 flex items-center gap-2 text-white/80">
              <CalendarDays className="h-4 w-4" />
              {trip.startDate} to {trip.endDate}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          {itinerarySections.map((section) => (
            <Card key={section.id}>
              <CardContent className="pt-5">
                <p className="text-sm font-bold uppercase tracking-wide text-accent">{section.day}</p>
                <h2 className="mt-1 text-xl font-bold">{section.title}</h2>
                <p className="mt-2 text-sm text-foreground/60">{section.notes}</p>
              </CardContent>
            </Card>
          ))}
        </section>
        <Card>
          <CardContent className="pt-5">
            <Compass className="h-8 w-8 text-accent" />
            <h2 className="mt-3 font-bold">Traveler view</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-foreground/60">
              <MapPin className="h-4 w-4" />
              {trip.destination}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-foreground/60">
              <Share2 className="h-4 w-4" />
              Expenses and private journal entries are hidden.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
