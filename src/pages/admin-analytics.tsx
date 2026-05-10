import {Activity, BarChart3, Globe2, MapPinned, Users} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {SegmentedTabs, TabButton} from "@/components/ui/tabs"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {MetricCard} from "@/components/travel/metric-card"
import {SearchToolbar} from "@/components/travel/search-toolbar"

const barData = [
  {label: "Mon", value: 42},
  {label: "Tue", value: 58},
  {label: "Wed", value: 48},
  {label: "Thu", value: 74},
  {label: "Fri", value: 63},
]

export function AdminAnalyticsPage() {
  return (
    <PageShell>
      <PageHeader
        description="Aggregate-only insight for trips, public shares, popular places, and activity trends."
        eyebrow="Admin panel"
        title="Admin Analytics"
      />

      <SearchToolbar placeholder="Search analytics" />
      <SegmentedTabs className="mt-4">
        <TabButton active>Manage users</TabButton>
        <TabButton>Popular cities</TabButton>
        <TabButton>Popular activities</TabButton>
        <TabButton>User trends</TabButton>
      </SegmentedTabs>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <MetricCard detail="Registered profiles" icon={Users} label="Users" value="1,284" />
        <MetricCard detail="Owner-approved" icon={Globe2} label="Public shares" value="86" />
        <MetricCard detail="Seed and custom" icon={Activity} label="Activities" value="180" />
        <MetricCard detail="Top searched" icon={MapPinned} label="Cities" value="42" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="pt-5">
            <div className="grid gap-6 lg:grid-cols-2">
              <section>
                <h2 className="font-bold">Trip creation trend</h2>
                <div className="mt-6 flex h-56 items-end gap-3 border-b border-l border-border px-4">
                  {barData.map((item) => (
                    <div className="flex flex-1 flex-col items-center gap-2" key={item.label}>
                      <div className="w-full rounded-t-lg bg-accent" style={{height: `${item.value * 2}px`}} />
                      <span className="text-xs font-semibold text-foreground/55">{item.label}</span>
                    </div>
                  ))}
                </div>
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
