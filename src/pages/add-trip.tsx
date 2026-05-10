import {CalendarPlus, MapPinned, Save} from "lucide-react"
import {useNavigate} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Field, Input, Select, Textarea} from "@/components/ui/input"
import {useToast} from "@/components/ui/toast"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {ActivityCard} from "@/components/travel/activity-card"
import {SectionHeader} from "@/components/travel/section-header"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {demoCatalog, getCatalogData} from "@/services/traveloop-api"

export function AddTripPage() {
  return <TripForm action="Create trip" eyebrow="Create journey" title="Add Trip" />
}

export function TripForm({title, eyebrow, action}: {title: string; eyebrow: string; action: string}) {
  const {notify} = useToast()
  const navigate = useNavigate()
  const {data} = useSupabaseQuery("trip-form-catalog", demoCatalog, getCatalogData)
  const firstTripId = "c1fcd2fb-3d66-4f1f-98cf-6a75d85f6b51"

  return (
    <PageShell>
      <PageHeader
        description="Set the core route, date window, and visibility notes before building the day-wise itinerary."
        eyebrow={eyebrow}
        title={title}
      />
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <Card>
          <CardContent className="pt-5">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPinned className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Plan a new trip</h2>
                <p className="text-sm text-foreground/60">Dates, place, people, and public visibility.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Trip title">
                <Input placeholder="Monsoon Trails" />
              </Field>
              <Field label="Destination">
                <Input placeholder="Kerala, India" />
              </Field>
              <Field label="Start date">
                <Input type="date" />
              </Field>
              <Field label="End date">
                <Input type="date" />
              </Field>
              <Field label="Trip status">
                <Select defaultValue="planned">
                  <option value="draft">Draft</option>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </Select>
              </Field>
              <Field label="Primary city">
                <Input placeholder="Search city" />
              </Field>
              <Field className="md:col-span-2" label="Visibility notes">
                <Textarea placeholder="Public itinerary toggles, traveler context, and planning notes" />
              </Field>
            </div>
            <Button
              className="mt-5 w-full sm:w-auto"
              onClick={() => {
                notify({title: "Trip draft ready", description: "Opening itinerary builder."})
                navigate(`/trip/${firstTripId}/itinerary`)
              }}
              variant="accent"
            >
              <Save className="h-4 w-4" />
              {action}
            </Button>
          </CardContent>
        </Card>

        <section>
          <SectionHeader
            action={
              <Button size="sm" variant="outline">
                <CalendarPlus className="h-4 w-4" />
                Add section
              </Button>
            }
            description="Use city and activity search to shape the first draft before the itinerary route."
            title="Suggestions for places and activities"
          />
          <SearchToolbar className="mb-4" placeholder="Search activity or place" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
