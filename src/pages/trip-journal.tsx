import {Edit3, PenLine, Plus, Trash2} from "lucide-react"
import {useParams} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {EmptyState} from "@/components/ui/empty-state"
import {SegmentedTabs, TabButton} from "@/components/ui/tabs"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {TripTabs} from "@/pages/trip-detail"
import {emptyTripBundle, getTripBundle} from "@/services/traveloop-api"

export function TripJournalPage() {
  const {id} = useParams()
  const {data} = useSupabaseQuery(`trip-journal:${id ?? "missing"}`, emptyTripBundle, () => getTripBundle(id))
  const {journalEntries, trip} = data

  return (
    <PageShell>
      {data.notFound ? (
        <EmptyState description="This trip is missing or you do not have access to it." title="Trip not found" />
      ) : (
        <>
      <PageHeader
        actions={
          <Button variant="accent">
            <Plus className="h-4 w-4" />
            New entry
          </Button>
        }
        description={`${trip.title} · trip notes and daily reflections`}
        eyebrow="Notes and mood"
        title="Trip Journal"
      />
      <TripTabs id={trip.id} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="pt-5">
            <SearchToolbar placeholder="Search notes" />
            <SegmentedTabs className="mt-4">
              <TabButton active>All</TabButton>
              <TabButton>By day</TabButton>
              <TabButton>By stop</TabButton>
            </SegmentedTabs>
            <div className="mt-6 rounded-xl bg-muted p-4">
              <PenLine className="h-6 w-6 text-gold" />
              <h2 className="mt-3 font-bold">Journal rhythm</h2>
              <p className="mt-1 text-sm text-foreground/60">Capture details while they are still fresh.</p>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          {journalEntries.length ? journalEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{entry.title}</h2>
                    <p className="mt-1 text-sm text-foreground/70">{entry.body}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-accent">
                      {entry.date} · {entry.mood}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button aria-label="Edit note" size="icon" variant="ghost">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button aria-label="Delete note" size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <EmptyState description="Create notes after you add real journal entries for this trip." title="No journal entries yet" />
          )}
        </section>
      </div>
      </>
      )}
    </PageShell>
  )
}
