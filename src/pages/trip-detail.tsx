import {BookOpen, CheckSquare, Coins, Globe2, Route, Share2, Users} from "lucide-react"
import {useParams} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {SegmentedTabs, TabLink} from "@/components/ui/tabs"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {MetricCard} from "@/components/travel/metric-card"
import {SectionHeader} from "@/components/travel/section-header"
import {StatusBadge} from "@/components/travel/status-badge"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {demoTripBundle, getTripBundle} from "@/services/traveloop-api"

export const tripTabs = [
  ["Overview", ""],
  ["Itinerary", "itinerary"],
  ["Expenses", "expenses"],
  ["Packing", "checklist"],
  ["Journal", "journal"],
  ["Share", "share"],
] as const

export function TripDetailPage() {
  const {id} = useParams()
  const {data} = useSupabaseQuery(`trip-detail:${id ?? "demo"}`, demoTripBundle, () => getTripBundle(id))
  const {trip} = data

  return (
    <PageShell>
      <PageHeader
        actions={<StatusBadge status={trip.status} />}
        description={`${trip.destination} · ${trip.startDate} to ${trip.endDate}`}
        eyebrow="Trip overview"
        title={trip.title}
      />
      <TripTabs id={trip.id} />

      <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="relative min-h-72">
          <img alt={trip.destination} className="absolute inset-0 h-full w-full object-cover" src={trip.coverImageUrl} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/35 to-transparent" />
          <div className="relative max-w-xl p-6 text-white sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-200">Current route</p>
            <h2 className="mt-3 text-4xl font-bold">{trip.destination}</h2>
            <p className="mt-3 text-white/78">{trip.highlights?.join(" · ")}</p>
            <Button className="mt-6 bg-white text-primary hover:bg-white/90" variant="outline">
              <Share2 className="h-4 w-4" />
              Share itinerary
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Route} label="Itinerary" value="3 days" detail="12 planned stops" />
        <MetricCard icon={Coins} label="Budget" value={`₹${(trip.budget ?? 0).toLocaleString("en-IN")}`} detail="Private by default" />
        <MetricCard icon={CheckSquare} label="Packing" value="8/12" detail="Items packed" />
        <MetricCard icon={Users} label="Travelers" value={trip.travelers ?? 1} detail="Group size" />
      </div>

      <section className="mt-8">
        <SectionHeader title="Trip detail tabs" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {label: "Itinerary", icon: Route, value: "Day-wise builder with activity search"},
            {label: "Expenses", icon: Coins, value: "Invoice and budget view"},
            {label: "Journal", icon: BookOpen, value: "Notes, moods, and public flags"},
          ].map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.label}>
                <CardContent className="pt-5">
                  <Icon className="h-6 w-6 text-accent" />
                  <h2 className="mt-3 font-bold">{item.label}</h2>
                  <p className="mt-1 text-sm text-foreground/60">{item.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <Card className="mt-5">
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Public itinerary controls</h2>
            <p className="text-sm text-foreground/60">Overview and itinerary are enabled. Expenses and journal stay private.</p>
          </div>
          <Globe2 className="h-6 w-6 text-gold" />
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function TripTabs({id}: {id: string}) {
  return (
    <SegmentedTabs>
      {tripTabs.map(([label, path]) => (
        <TabLink end={!path} key={label} to={path ? `/trip/${id}/${path}` : `/trip/${id}`}>
          {label}
        </TabLink>
      ))}
    </SegmentedTabs>
  )
}
