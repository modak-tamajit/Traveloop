import {IndianRupee, MapPin, Plus, Star} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {demoCatalog, getCatalogData} from "@/services/traveloop-api"

export function SearchPage() {
  const {data} = useSupabaseQuery("catalog-search", demoCatalog, getCatalogData)
  const results = [
    ...data.activities.map((activity) => ({
      id: activity.id,
      title: activity.name,
      label: activity.category,
      detail: `${activity.duration} · ${activity.rating} rating`,
      meta: `₹${activity.cost.toLocaleString("en-IN")}`,
      image: activity.imageUrl,
      kind: "Activity",
    })),
    ...data.cities.map((city) => ({
      id: city.id,
      title: city.name,
      label: city.country,
      detail: `${city.region} · ${city.score}`,
      meta: "City",
      image: city.imageUrl,
      kind: "City",
    })),
  ]

  return (
    <PageShell>
      <PageHeader
        description="Find cities and activities, then add the selected option into a trip itinerary."
        eyebrow="City and activity search"
        title="Search"
      />
      <SearchToolbar placeholder="Paragliding, city, hotel, activity" />

      <section className="mt-5 rounded-xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-3 text-xl font-bold">Results</h2>
        <div className="space-y-3">
          {results.map((result) => (
            <Card className="overflow-hidden" key={`${result.kind}-${result.id}`}>
              <CardContent className="grid gap-4 pt-5 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                <img alt={result.title} className="h-24 w-full rounded-lg object-cover sm:w-24" src={result.image} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={result.kind === "City" ? "info" : "default"}>{result.kind}</Badge>
                    <Badge variant="muted">{result.label}</Badge>
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{result.title}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-foreground/65">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {result.detail}
                    </span>
                    <span className="flex items-center gap-1">
                      {result.kind === "Activity" ? <IndianRupee className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      {result.meta}
                    </span>
                  </p>
                </div>
                <Button variant="outline">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
