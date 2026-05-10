import {supabase} from "@/lib/supabase"
import {
  activities as mockActivities,
  cities as mockCities,
  expenseLines as mockExpenseLines,
  itinerarySections as mockItinerarySections,
  journalEntries as mockJournalEntries,
  packingGroups as mockPackingGroups,
  trips as mockTrips,
} from "@/data/mock"
import type {
  ActivitySearchResult,
  AdminAnalyticsPayload,
  CityRow,
  CitySearchResult,
  ExpenseRow,
  ItineraryDayRow,
  ItineraryItemRow,
  JournalEntryRow,
  JsonObject,
  PackingItemRow,
  PublicItineraryPayload,
  TripRow,
} from "@/services/supabase/contracts"
import {supabaseRpcNames} from "@/services/supabase/contracts"
import type {Activity, CityOption, ExpenseLine, ItinerarySection, JournalEntry, PackingGroup, Trip} from "@/types"

export type DataSource = "supabase" | "demo"

export type DataResult<T> = {
  data: T
  source: DataSource
  error: string | null
}

export type DashboardData = {
  trips: Trip[]
  cities: CityOption[]
  source: DataSource
}

export type CatalogData = {
  cities: CityOption[]
  activities: Activity[]
  source: DataSource
}

export type TripBundle = {
  trip: Trip
  trips: Trip[]
  activities: Activity[]
  itinerarySections: ItinerarySection[]
  packingGroups: PackingGroup[]
  journalEntries: JournalEntry[]
  expenseLines: ExpenseLine[]
  source: DataSource
}

export type PublicShareView = {
  trip: Trip
  itinerarySections: ItinerarySection[]
  shareId: string
  expensesHidden: boolean
  source: DataSource
}

const defaultCityImage = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
const defaultActivityImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"

export const demoDashboard: DashboardData = {trips: mockTrips, cities: mockCities, source: "demo"}
export const demoCatalog: CatalogData = {cities: mockCities, activities: mockActivities, source: "demo"}

export const demoTripBundle: TripBundle = {
  trip: mockTrips[0],
  trips: mockTrips,
  activities: mockActivities,
  itinerarySections: mockItinerarySections,
  packingGroups: mockPackingGroups,
  journalEntries: mockJournalEntries,
  expenseLines: mockExpenseLines,
  source: "demo",
}

export const demoAdminAnalytics: AdminAnalyticsPayload = {
  totals: {
    users: 1284,
    trips: mockTrips.length,
    public_shares: mockTrips.filter((trip) => trip.isPublic).length,
    public_share_views: 86,
    expenses_amount: mockTrips.reduce((sum, trip) => sum + (trip.spent ?? 0), 0),
    cities: mockCities.length,
    activities: mockActivities.length,
    itinerary_items: mockItinerarySections.reduce((sum, section) => sum + section.activities.length, 0),
    packing_items: mockPackingGroups.reduce((sum, group) => sum + group.items.length, 0),
    journal_entries: mockJournalEntries.length,
    trip_activity_events: 0,
  },
  trips_by_status: {planned: 1, active: 1, draft: 1},
  expenses_by_category: {
    food: {count: 1, amount: 1000},
    transport: {count: 1, amount: 12000},
    accommodation: {count: 1, amount: 9000},
  },
  top_cities: mockCities.slice(0, 3).map((city, index) => ({
    city_id: city.id,
    name: city.name,
    country: city.country,
    trip_count: 12 - index * 3,
  })),
  daily_trip_creations: [
    {date: "Mon", count: 42},
    {date: "Tue", count: 58},
    {date: "Wed", count: 48},
    {date: "Thu", count: 74},
    {date: "Fri", count: 63},
  ],
  daily_public_share_views: [
    {date: "Mon", count: 12},
    {date: "Tue", count: 18},
    {date: "Wed", count: 16},
    {date: "Thu", count: 24},
    {date: "Fri", count: 20},
  ],
}

export async function getDashboardData(): Promise<DashboardData> {
  const [tripsResult, citiesResult] = await Promise.all([listTrips(), listCities()])
  return {
    trips: tripsResult.data,
    cities: citiesResult.data,
    source: tripsResult.source === "supabase" || citiesResult.source === "supabase" ? "supabase" : "demo",
  }
}

export async function getCatalogData(): Promise<CatalogData> {
  const [citiesResult, activitiesResult] = await Promise.all([listCities(), listActivities()])
  return {
    cities: citiesResult.data,
    activities: activitiesResult.data,
    source: citiesResult.source === "supabase" || activitiesResult.source === "supabase" ? "supabase" : "demo",
  }
}

export async function getTripBundle(tripId?: string): Promise<TripBundle> {
  const tripsResult = await listTrips()
  const trips = tripsResult.data
  const trip = trips.find((item) => item.id === tripId) ?? trips[0] ?? mockTrips[0]

  if (!supabase || tripsResult.source === "demo") {
    return {...demoTripBundle, trip, trips}
  }

  const [activitiesResult, itineraryResult, packingResult, journalResult, expenseResult] = await Promise.all([
    listActivities(),
    listItinerarySections(trip.id),
    listPackingGroups(trip.id),
    listJournalEntries(trip.id),
    listExpenseLines(trip.id),
  ])

  return {
    trip,
    trips,
    activities: activitiesResult.data.length ? activitiesResult.data : mockActivities,
    itinerarySections: itineraryResult.data.length ? itineraryResult.data : mockItinerarySections,
    packingGroups: packingResult.data.length ? packingResult.data : mockPackingGroups,
    journalEntries: journalResult.data.length ? journalResult.data : mockJournalEntries,
    expenseLines: expenseResult.data.length ? expenseResult.data : mockExpenseLines,
    source: "supabase",
  }
}

export async function loadPublicShare(shareId?: string): Promise<PublicShareView> {
  if (!supabase || !shareId) {
    return demoPublicShare(shareId)
  }

  const {data, error} = await supabase.rpc(supabaseRpcNames.loadPublicItinerary, {p_share_id: shareId})
  const payload = data as PublicItineraryPayload | null

  if (error || !payload?.trip) {
    return demoPublicShare(shareId)
  }

  return {
    trip: {
      id: payload.trip.share_id,
      userId: "public",
      title: payload.trip.title,
      destination: payload.trip.destination,
      startDate: payload.trip.start_date ?? "",
      endDate: payload.trip.end_date ?? "",
      status: mapTripStatus(payload.trip.status),
      coverImageUrl: payload.primary_city?.image_url ?? defaultCityImage,
      isPublic: true,
      highlights: payload.itinerary_days.slice(0, 3).map((day) => day.title ?? `Day ${day.day_number}`),
    },
    itinerarySections: payload.itinerary_days.map((day) => ({
      id: day.id,
      day: `Day ${day.day_number}`,
      title: day.title ?? `Day ${day.day_number}`,
      dateRange: day.date ?? "",
      budget: day.items.reduce((sum, item) => sum + (item.estimated_cost ?? 0), 0),
      notes: day.notes ?? "",
      activities: day.items.map((item) => ({
        id: item.id,
        cityId: item.city_id ?? "",
        name: item.title,
        category: item.activity?.category ?? "Activity",
        duration: minutesToDuration(item.activity?.duration_minutes ?? null),
        cost: item.estimated_cost ?? 0,
        rating: item.activity?.rating ?? 4.6,
        imageUrl: defaultActivityImage,
        tags: item.activity?.tags ?? [],
      })),
    })),
    shareId,
    expensesHidden: !payload.visibility.expenses,
    source: "supabase",
  }
}

export async function getAdminAnalytics(): Promise<DataResult<AdminAnalyticsPayload>> {
  if (!supabase) {
    return {data: demoAdminAnalytics, source: "demo", error: "Supabase env is not configured"}
  }

  const {data, error} = await supabase.rpc(supabaseRpcNames.getAdminAnalytics, {
    p_from_date: null,
    p_to_date: null,
  })

  if (error || !data) {
    return {data: demoAdminAnalytics, source: "demo", error: error?.message ?? "No analytics returned"}
  }

  return {data: data as AdminAnalyticsPayload, source: "supabase", error: null}
}

export async function listTrips(): Promise<DataResult<Trip[]>> {
  if (!supabase) {
    return {data: mockTrips, source: "demo", error: "Supabase env is not configured"}
  }

  const {data, error} = await supabase
    .from("trips")
    .select(
      "id,user_id,trip_number,origin,destination,travel_mode,date,time,title,start_date,end_date,primary_city_id,notes,travelers,total_expenses,status,is_public,share_id,share_enabled_at,share_expires_at,public_show_overview,public_show_itinerary,public_show_expenses,public_show_packing,public_show_journal,metadata,lock_version,created_at,updated_at",
    )
    .order("start_date", {ascending: true, nullsFirst: false})

  const rows = data as TripRow[] | null
  if (error || !rows?.length) {
    return {data: mockTrips, source: "demo", error: error?.message ?? "No authenticated trips returned"}
  }

  return {data: rows.map(mapTripRow), source: "supabase", error: null}
}

export async function listCities(): Promise<DataResult<CityOption[]>> {
  if (!supabase) {
    return {data: mockCities, source: "demo", error: "Supabase env is not configured"}
  }

  const {data, error} = await supabase
    .from("cities")
    .select("id,name,region,country,country_code,lat,lng,timezone,image_url,search_text,metadata,lock_version,created_at,updated_at")
    .order("name")
    .limit(12)

  const rows = data as CityRow[] | null
  if (error || !rows?.length) {
    return {data: mockCities, source: "demo", error: error?.message ?? "No cities returned"}
  }

  return {data: rows.map(mapCityRow), source: "supabase", error: null}
}

export async function listActivities(): Promise<DataResult<Activity[]>> {
  if (!supabase) {
    return {data: mockActivities, source: "demo", error: "Supabase env is not configured"}
  }

  const {data, error} = await supabase.rpc(supabaseRpcNames.searchActivities, {
    p_city_id: null,
    p_query: null,
    p_category: null,
    p_limit: 12,
  })

  const rows = data as ActivitySearchResult[] | null
  if (error || !rows?.length) {
    return {data: mockActivities, source: "demo", error: error?.message ?? "No activities returned"}
  }

  return {data: rows.map(mapActivitySearchResult), source: "supabase", error: null}
}

async function listItinerarySections(tripId: string): Promise<DataResult<ItinerarySection[]>> {
  if (!supabase) {
    return {data: mockItinerarySections, source: "demo", error: "Supabase env is not configured"}
  }

  const [{data: dayData, error: dayError}, {data: itemData, error: itemError}] = await Promise.all([
    supabase.from("itinerary_days").select("*").eq("trip_id", tripId).order("sort_order"),
    supabase.from("itinerary_items").select("*").eq("trip_id", tripId).order("sort_order"),
  ])

  const days = dayData as ItineraryDayRow[] | null
  const items = itemData as ItineraryItemRow[] | null

  if (dayError || itemError || !days?.length) {
    return {data: mockItinerarySections, source: "demo", error: dayError?.message ?? itemError?.message ?? "No itinerary returned"}
  }

  return {
    data: days.map((day) => {
      const dayItems = (items ?? []).filter((item) => item.day_id === day.id)
      return {
        id: day.id,
        day: `Day ${day.day_number}`,
        title: day.title ?? `Day ${day.day_number}`,
        dateRange: day.date ?? "",
        budget: dayItems.reduce((sum, item) => sum + (item.estimated_cost ?? 0), 0),
        notes: day.notes ?? "",
        activities: dayItems.map(mapItineraryItemToActivity),
      }
    }),
    source: "supabase",
    error: null,
  }
}

async function listPackingGroups(tripId: string): Promise<DataResult<PackingGroup[]>> {
  if (!supabase) {
    return {data: mockPackingGroups, source: "demo", error: "Supabase env is not configured"}
  }

  const {data, error} = await supabase.from("packing_items").select("*").eq("trip_id", tripId).order("sort_order")
  const rows = data as PackingItemRow[] | null
  if (error || !rows?.length) {
    return {data: mockPackingGroups, source: "demo", error: error?.message ?? "No packing items returned"}
  }

  const grouped = new Map<string, PackingGroup["items"]>()
  rows.forEach((row) => {
    grouped.set(row.category, [...(grouped.get(row.category) ?? []), {name: row.name, packed: row.is_packed}])
  })

  return {data: [...grouped.entries()].map(([category, items]) => ({category, items})), source: "supabase", error: null}
}

async function listJournalEntries(tripId: string): Promise<DataResult<JournalEntry[]>> {
  if (!supabase) {
    return {data: mockJournalEntries, source: "demo", error: "Supabase env is not configured"}
  }

  const {data, error} = await supabase.from("journal_entries").select("*").eq("trip_id", tripId).order("entry_date")
  const rows = data as JournalEntryRow[] | null
  if (error || !rows?.length) {
    return {data: mockJournalEntries, source: "demo", error: error?.message ?? "No journal entries returned"}
  }

  return {
    data: rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body ?? "",
      date: row.entry_date,
      mood: row.mood ?? "noted",
    })),
    source: "supabase",
    error: null,
  }
}

async function listExpenseLines(tripId: string): Promise<DataResult<ExpenseLine[]>> {
  if (!supabase) {
    return {data: mockExpenseLines, source: "demo", error: "Supabase env is not configured"}
  }

  const {data, error} = await supabase.from("expenses").select("*").eq("trip_id", tripId).order("date")
  const rows = data as ExpenseRow[] | null
  if (error || !rows?.length) {
    return {data: mockExpenseLines, source: "demo", error: error?.message ?? "No expenses returned"}
  }

  return {
    data: rows.map((row) => ({
      id: row.id,
      category: row.category,
      description: row.description,
      quantity: "1",
      unitCost: row.amount,
      amount: row.amount,
    })),
    source: "supabase",
    error: null,
  }
}

export function demoPublicShare(shareId?: string): PublicShareView {
  const trip = mockTrips.find((item) => item.isPublic) ?? mockTrips[0]
  return {
    trip,
    itinerarySections: mockItinerarySections,
    shareId: shareId ?? "demo",
    expensesHidden: true,
    source: "demo",
  }
}

function mapTripRow(row: TripRow): Trip {
  const coverImageUrl = metadataText(row.metadata, "coverImageUrl") ?? metadataText(row.metadata, "cover_image_url") ?? defaultCityImage
  const budget = metadataNumber(row.metadata, "budget")
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    destination: row.destination,
    startDate: row.start_date ?? row.date ?? "",
    endDate: row.end_date ?? row.date ?? "",
    status: mapTripStatus(row.status),
    primaryCityId: row.primary_city_id ?? undefined,
    coverImageUrl,
    isPublic: row.is_public,
    budget,
    spent: row.total_expenses,
    progress: metadataNumber(row.metadata, "progress") ?? 35,
    travelers: row.travelers.length || 1,
    highlights: row.notes ? [row.notes] : undefined,
  }
}

function mapCityRow(row: CityRow | CitySearchResult): CityOption {
  return {
    id: row.id,
    name: row.name,
    region: row.region ?? "Region",
    country: row.country,
    imageUrl: row.image_url ?? defaultCityImage,
    score: row.timezone ?? row.country_code ?? "Travel pick",
  }
}

function mapActivitySearchResult(row: ActivitySearchResult): Activity {
  return {
    id: row.id,
    cityId: row.city_id ?? "",
    name: row.name,
    category: row.category,
    duration: minutesToDuration(row.duration_minutes),
    cost: row.estimated_cost ?? 0,
    rating: row.rating ?? 4.5,
    imageUrl: metadataText(row.location, "image_url") ?? defaultActivityImage,
    tags: row.tags,
  }
}

function mapItineraryItemToActivity(row: ItineraryItemRow): Activity {
  return {
    id: row.id,
    cityId: row.city_id ?? "",
    name: row.title,
    category: row.booking_status,
    duration: row.start_time && row.end_time ? `${row.start_time} - ${row.end_time}` : "Flexible",
    cost: row.estimated_cost ?? 0,
    rating: 4.5,
    imageUrl: defaultActivityImage,
    tags: row.notes ? [row.notes] : [],
  }
}

function mapTripStatus(status: TripRow["status"]): Trip["status"] {
  if (status === "planning") return "planned"
  if (status === "in_progress") return "active"
  if (status === "completed" || status === "draft" || status === "planned" || status === "active" || status === "archived") {
    return status
  }
  return "planned"
}

function minutesToDuration(minutes: number | null): string {
  if (!minutes) return "Flexible"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining ? `${hours} hr ${remaining} min` : `${hours} hr`
}

function metadataText(metadata: JsonObject | undefined, key: string): string | undefined {
  const value = metadata?.[key]
  return typeof value === "string" ? value : undefined
}

function metadataNumber(metadata: JsonObject | undefined, key: string): number | undefined {
  const value = metadata?.[key]
  return typeof value === "number" ? value : undefined
}
