import {CalendarCheck2, Compass, Globe2, Plus, Search, Users, WalletCards} from "lucide-react"
import {Link} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {EmptyState, ErrorState} from "@/components/ui/empty-state"
import {CardSkeleton} from "@/components/ui/skeleton"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {MetricCard} from "@/components/travel/metric-card"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {SectionHeader} from "@/components/travel/section-header"
import {TripCard} from "@/components/travel/trip-card"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {emptyDashboard, getDashboardData} from "@/services/traveloop-api"

export function DashboardPage() {
  const {data, error, isLoading} = useSupabaseQuery("dashboard", emptyDashboard, getDashboardData)
  const {cities, trips} = data
  const publicTrips = trips.filter((trip) => trip.isPublic).length
  const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget ?? 0), 0)
  const budgetedTrips = trips.filter((trip) => (trip.budget ?? 0) > 0).length

  return (
    <PageShell>
      <PageHeader
        actions={
          <Button asChild variant="accent">
            <Link to="/add-trip">
              <Plus className="h-4 w-4" />
              Plan a trip
            </Link>
          </Button>
        }
        description="Your active planning space for routes, budgets, public itineraries, packing, and journal notes."
        eyebrow="Main landing"
        title="Dashboard"
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="relative min-h-72">
          <img
            alt="Train passing through a scenic mountain route"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/38 to-transparent" />
          <div className="relative max-w-2xl p-6 text-white sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-200">Top Indian regional selections</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Shape your next India itinerary.</h2>
            <p className="mt-4 text-white/78">
              Search destinations, compare activities, and jump back into the itineraries already taking shape.
            </p>
          </div>
        </div>
        <div className="border-t border-border p-4">
          <SearchToolbar placeholder="Search trips, cities, activities" />
        </div>
      </section>

      {error ? <ErrorState description={error} title="Could not load live dashboard data" /> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {label: "Trip listing", href: "/trips", icon: Compass},
          {label: "City search", href: "/search", icon: Search},
          {label: "Community", href: "/community", icon: Users},
          {label: "Admin panel", href: "/admin/analytics", icon: Globe2},
        ].map((item) => {
          const Icon = item.icon
          return (
            <Button asChild key={item.href} variant="outline">
              <Link to={item.href}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard detail="Across all planning stages" icon={CalendarCheck2} label="Planned routes" value={trips.length} />
        <MetricCard detail={`₹${totalBudget.toLocaleString("en-IN")} planned`} icon={WalletCards} label="Budgets tracked" value={budgetedTrips} />
        <MetricCard detail="Owner-approved links" icon={Globe2} label="Public itineraries" value={publicTrips} />
      </div>

      <section className="mt-8">
        <SectionHeader title="Regional picks" />
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : cities.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((city) => (
              <Card className="overflow-hidden" key={city.id}>
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img alt={`${city.name}, ${city.country}`} className="h-full w-full object-cover" src={city.imageUrl} />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-bold">{city.name}</h3>
                  <p className="text-sm text-foreground/60">
                    {city.region}, {city.country}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-accent">{city.score}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            description="Run the India catalog migration in Supabase to populate city and activity recommendations."
            title="No regional catalog data yet"
          />
        )}
      </section>

      <section className="mt-8">
        <SectionHeader title="Your trips" />
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : trips.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <EmptyState
            action={
              <Button asChild variant="accent">
                <Link to="/add-trip">
                  <Plus className="h-4 w-4" />
                  Create first trip
                </Link>
              </Button>
            }
            description="Your workspace is empty because no real Supabase trips exist for this account yet."
            title="Start with your first real trip"
          />
        )}
      </section>
    </PageShell>
  )
}
