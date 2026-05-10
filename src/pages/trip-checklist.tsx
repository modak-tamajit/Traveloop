import {CheckSquare, Plus, RotateCcw, Share2} from "lucide-react"
import {useParams} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Progress} from "@/components/ui/progress"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {TripTabs} from "@/pages/trip-detail"
import {demoTripBundle, getTripBundle} from "@/services/traveloop-api"

export function TripChecklistPage() {
  const {id} = useParams()
  const {data} = useSupabaseQuery(`trip-checklist:${id ?? "demo"}`, demoTripBundle, () => getTripBundle(id))
  const {packingGroups, trip} = data
  const packed = packingGroups.flatMap((group) => group.items).filter((item) => item.packed).length
  const total = packingGroups.flatMap((group) => group.items).length

  return (
    <PageShell>
      <PageHeader
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        }
        description={`${trip.title} · ${packed}/${total} items packed`}
        eyebrow="Trip prep"
        title="Packing Checklist"
      />
      <TripTabs id={trip.id} />

      <div className="mt-5 space-y-5">
        <SearchToolbar placeholder="Search checklist" />
        <Card>
          <CardContent className="pt-5">
            <div className="mb-5">
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Progress</span>
                <span>
                  {packed}/{total} packed
                </span>
              </div>
              <Progress value={(packed / total) * 100} />
            </div>

            <div className="space-y-5">
              {packingGroups.map((group) => {
                const groupPacked = group.items.filter((item) => item.packed).length
                return (
                  <section key={group.category}>
                    <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2">
                      <h2 className="font-bold">{group.category}</h2>
                      <span className="text-sm font-semibold text-foreground/60">
                        {groupPacked}/{group.items.length}
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {group.items.map((item) => (
                        <label
                          className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:bg-muted/60"
                          key={item.name}
                        >
                          <input checked={item.packed} className="h-4 w-4 accent-orange-500" readOnly type="checkbox" />
                          <CheckSquare className="h-4 w-4 text-accent" />
                          <span className="font-semibold">{item.name}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                Add item
              </Button>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4" />
                Share checklist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
