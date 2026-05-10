import {CalendarPlus, IndianRupee, Plus} from "lucide-react"
import {useParams} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {SearchBar} from "@/components/ui/input"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {ActivityCard} from "@/components/travel/activity-card"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {SectionHeader} from "@/components/travel/section-header"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {TripTabs} from "@/pages/trip-detail"
import {demoTripBundle, getTripBundle} from "@/services/traveloop-api"

export function TripItineraryPage() {
  const {id} = useParams()
  const {data} = useSupabaseQuery(`trip-itinerary:${id ?? "demo"}`, demoTripBundle, () => getTripBundle(id))
  const {activities, itinerarySections, trip} = data

  return (
    <PageShell>
      <PageHeader
        actions={
          <Button variant="accent">
            <CalendarPlus className="h-4 w-4" />
            Add day
          </Button>
        }
        description={`${trip.destination} · ${itinerarySections.length} itinerary sections`}
        eyebrow="Day-wise builder"
        title="Itinerary"
      />
      <TripTabs id={trip.id} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-5">
              <SearchBar placeholder="Search cities" />
              <SearchBar placeholder="Search activities" />
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-bold">Budget target</p>
                <p className="mt-1 text-foreground/60">₹{(trip.budget ?? 0).toLocaleString("en-IN")}</p>
              </div>
            </CardContent>
          </Card>
          <SectionHeader title="Activity search" />
          <div className="grid gap-3">
            {activities.slice(0, 2).map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </div>
        </aside>

        <section className="space-y-5">
          <SearchToolbar placeholder="Search itinerary sections" />
          {itinerarySections.map((section) => (
            <Card key={section.id}>
              <CardContent className="pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-accent">{section.day}</p>
                    <h2 className="mt-1 text-xl font-bold">{section.title}</h2>
                    <p className="mt-2 text-sm text-foreground/60">{section.notes}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:min-w-64">
                    <div className="rounded-lg border border-border p-3 text-sm">
                      <p className="text-foreground/55">Date range</p>
                      <p className="font-bold">{section.dateRange}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-sm">
                      <p className="text-foreground/55">Budget</p>
                      <p className="flex items-center font-bold">
                        <IndianRupee className="h-4 w-4" />
                        {section.budget.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {section.activities.map((activity, index) => (
                    <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_160px]" key={activity.id}>
                      <div>
                        <p className="font-bold">
                          {index + 1}. {activity.name}
                        </p>
                        <p className="text-sm text-foreground/60">
                          {activity.category} · {activity.duration}
                        </p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm font-bold">
                        <span>Expense</span>
                        <span>₹{activity.cost.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4" />
            Add another section
          </Button>
        </section>
      </div>
    </PageShell>
  )
}
