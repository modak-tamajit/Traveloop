import {useState} from "react"
import type {FormEvent} from "react"
import {CalendarPlus, MapPinned, Save, Trash2} from "lucide-react"
import {useNavigate, useParams} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Field, Input, Select, Textarea} from "@/components/ui/input"
import {useToast} from "@/components/ui/toast"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {ActivityCard} from "@/components/travel/activity-card"
import {SectionHeader} from "@/components/travel/section-header"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {
  createTrip,
  deleteTrip,
  demoCatalog,
  demoTripBundle,
  getCatalogData,
  getTripBundle,
  updateTrip,
} from "@/services/traveloop-api"
import type {TripStatus} from "@/types"

export function AddTripPage() {
  return <TripForm action="Create trip" eyebrow="Create journey" title="Add Trip" />
}

export function TripForm({title, eyebrow, action}: {title: string; eyebrow: string; action: string}) {
  const {id: tripId} = useParams()
  const isEditing = Boolean(tripId)
  const {notify} = useToast()
  const navigate = useNavigate()
  const {data: catalog} = useSupabaseQuery("trip-form-catalog", demoCatalog, getCatalogData)
  const {data: editBundle} = useSupabaseQuery(`trip-form:${tripId ?? "new"}`, demoTripBundle, () =>
    tripId ? getTripBundle(tripId) : Promise.resolve(demoTripBundle),
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const editTrip = isEditing && editBundle.trip.id === tripId ? editBundle.trip : null

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const titleValue = formText(formData, "title")
    const destinationValue = formText(formData, "destination")
    const startDateValue = formText(formData, "startDate")
    const endDateValue = formText(formData, "endDate")

    if (!titleValue || !destinationValue || !startDateValue) {
      notify({title: "Trip details required", description: "Add a title, destination, and start date before saving."})
      return
    }

    if (endDateValue && endDateValue < startDateValue) {
      notify({title: "Date range needs checking", description: "End date cannot be earlier than the start date."})
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        title: titleValue,
        destination: destinationValue,
        startDate: startDateValue,
        endDate: endDateValue || startDateValue,
        status: formText(formData, "status") as TripStatus,
        primaryCityId: formText(formData, "primaryCityId") || undefined,
        notes: formText(formData, "notes") || undefined,
        travelers: Number.parseInt(formText(formData, "travelers"), 10) || 1,
      }
      const result = isEditing && tripId ? await updateTrip({id: tripId, ...payload}) : await createTrip(payload)

      if (result.error) throw new Error(result.error)

      notify({
        title: isEditing ? "Trip updated" : "Trip created",
        description: isEditing ? "Your route changes are saved." : "Opening the itinerary builder.",
      })
      navigate(isEditing ? `/trip/${result.data.id}` : `/trip/${result.data.id}/itinerary`)
    } catch (error) {
      notify({title: "Trip save failed", description: error instanceof Error ? error.message : "Please try again."})
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!tripId || !window.confirm("Delete this trip and its child records?")) return

    try {
      setIsDeleting(true)
      const result = await deleteTrip(tripId)
      if (result.error) throw new Error(result.error)
      notify({title: "Trip deleted", description: "The trip and its linked records were removed."})
      navigate("/trips")
    } catch (error) {
      notify({title: "Delete failed", description: error instanceof Error ? error.message : "Please try again."})
    } finally {
      setIsDeleting(false)
    }
  }

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
            <form key={editTrip?.id ?? "new-trip"} onSubmit={handleSave}>
              <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPinned className="h-5 w-5" />
              </span>
                <div>
                  <h2 className="text-xl font-bold">{isEditing ? "Edit trip plan" : "Plan a new trip"}</h2>
                  <p className="text-sm text-foreground/60">Dates, place, people, and public visibility.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Trip title">
                  <Input defaultValue={editTrip?.title ?? ""} name="title" placeholder="Monsoon Trails" />
                </Field>
                <Field label="Destination">
                  <Input defaultValue={editTrip?.destination ?? ""} name="destination" placeholder="Kerala, India" />
                </Field>
                <Field label="Start date">
                  <Input defaultValue={editTrip?.startDate ?? ""} name="startDate" type="date" />
                </Field>
                <Field label="End date">
                  <Input defaultValue={editTrip?.endDate ?? ""} name="endDate" type="date" />
                </Field>
                <Field label="Trip status">
                  <Select defaultValue={editTrip?.status ?? "planned"} name="status">
                    <option value="draft">Draft</option>
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </Select>
                </Field>
                <Field label="Travelers">
                  <Input defaultValue={editTrip?.travelers ?? 1} min={1} name="travelers" type="number" />
                </Field>
                <Field label="Primary city">
                  <Select defaultValue={editTrip?.primaryCityId ?? ""} name="primaryCityId">
                    <option value="">No linked city yet</option>
                    {catalog.cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}, {city.country}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field className="md:col-span-2" label="Visibility notes">
                  <Textarea
                    defaultValue={editTrip?.highlights?.join("\n") ?? ""}
                    name="notes"
                    placeholder="Public itinerary toggles, traveler context, and planning notes"
                  />
                </Field>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button disabled={isSaving} type="submit" variant="accent">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : action}
                </Button>
                {isEditing ? (
                  <Button disabled={isDeleting} onClick={handleDelete} type="button" variant="danger">
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete trip"}
                  </Button>
                ) : null}
              </div>
            </form>
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
            {catalog.activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

function formText(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim()
}
