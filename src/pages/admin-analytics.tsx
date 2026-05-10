import {Activity, BarChart3, Globe2, MapPinned, Users} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {EmptyState, ErrorState} from "@/components/ui/empty-state"
import {SegmentedTabs, TabButton} from "@/components/ui/tabs"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {MetricCard} from "@/components/travel/metric-card"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {emptyAdminAnalytics, getAdminAnalytics} from "@/services/traveloop-api"

export function AdminAnalyticsPage() {
  const {data: analyticsResult} = useSupabaseQuery(
    "admin-analytics",
    {data: emptyAdminAnalytics(), source: "supabase" as const, error: null},
    getAdminAnalytics,
  )
  const analytics = analyticsResult.data
  const totals = analytics.totals
  const trendData = analytics.daily_trip_creations.slice(0, 5)

  return (
    <PageShell>
      <PageHeader
        description="Aggregate-only insight for trips, public shares, popular places, and activity trends."
        eyebrow="Admin panel"
        title="Admin Analytics"
      />

      <SearchToolbar placeholder="Search analytics" />
      {analyticsResult.error ? (
        <div className="mt-4">
          <ErrorState description={analyticsResult.error} title="Live analytics are not available" />
        </div>
      ) : null}
      <SegmentedTabs className="mt-4">
        <TabButton active>Manage users</TabButton>
        <TabButton>Popular cities</TabButton>
        <TabButton>Popular activities</TabButton>
        <TabButton>User trends</TabButton>
      </SegmentedTabs>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <MetricCard detail="Registered profiles" icon={Users} label="Users" value={totals.users.toLocaleString("en-IN")} />
        <MetricCard detail="Owner-approved" icon={Globe2} label="Public shares" value={totals.public_shares} />
        <MetricCard detail="Seed and custom" icon={Activity} label="Activities" value={totals.activities} />
        <MetricCard detail="Searchable catalog" icon={MapPinned} label="Cities" value={totals.cities} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="pt-5">
            <div className="grid gap-6 lg:grid-cols-2">
              <section>
                <h2 className="font-bold">Trip creation trend</h2>
                {trendData.length ? (
                  <div className="mt-6 flex h-56 items-end gap-3 border-b border-l border-border px-4">
                    {trendData.map((item) => (
                      <div className="flex flex-1 flex-col items-center gap-2" key={item.date}>
                        <div className="w-full rounded-t-lg bg-accent" style={{height: `${Math.max(item.count, 8) * 2}px`}} />
                        <span className="text-xs font-semibold text-foreground/55">{item.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5">
                    <EmptyState description="Create real trips to populate aggregate admin trends." title="No trend data yet" />
                  </div>
                )}
              </section>
              <section>
                <h2 className="font-bold">Share mix</h2>
                <div className="mt-6 grid place-items-center">
                  <div className="relative h-52 w-52 rounded-full bg-[conic-gradient(hsl(var(--primary))_0_68%,hsl(var(--gold))_68%_84%,hsl(var(--accent))_84%_100%)]">
                    <div className="absolute inset-10 grid place-items-center rounded-full bg-card text-center">
                      <p className="text-3xl font-bold">68%</p>
                      <p className="text-xs text-foreground/60">itinerary</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <BarChart3 className="h-6 w-6 text-accent" />
            <h2 className="mt-3 font-bold">Operational summary</h2>
            <div className="mt-4 space-y-4 text-sm text-foreground/65">
              <p>Popular cities highlight current user travel demand across active and planned trips.</p>
              <p>Activity trends help tune seed data, category filters, and recommendation ordering.</p>
              <p>Share analytics stay aggregate-only and avoid private profile or expense exposure.</p>
            </div>
            <Button className="mt-5 w-full" variant="outline">
              Export report
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
