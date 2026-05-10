export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue | undefined;
}

export type ProfileRole = 'user' | 'admin';
export type TripStatus = 'planning' | 'in_progress' | 'completed';
export type ExpenseCategory = 'transport' | 'food' | 'accommodation' | 'entertainment' | 'other';
export type BookingStatus = 'idea' | 'planned' | 'booked' | 'cancelled' | 'completed';

export interface ProfileRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
}

export interface CityRow {
  id: string;
  name: string;
  region: string | null;
  country: string;
  country_code: string | null;
  lat: number | null;
  lng: number | null;
  timezone: string | null;
  image_url: string | null;
  search_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripRow {
  id: string;
  user_id: string;
  trip_number: string;
  origin: string;
  destination: string;
  travel_mode: string;
  date: string | null;
  time: string | null;
  title: string;
  start_date: string | null;
  end_date: string | null;
  primary_city_id: string | null;
  notes: string | null;
  travelers: string[];
  total_expenses: number;
  status: TripStatus;
  is_public: boolean;
  share_id: string | null;
  share_enabled_at: string | null;
  share_expires_at: string | null;
  public_show_overview: boolean;
  public_show_itinerary: boolean;
  public_show_expenses: boolean;
  public_show_packing: boolean;
  public_show_journal: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLocation extends JsonObject {
  address?: string;
  lat?: number;
  lng?: number;
  place_id?: string;
}

export interface ActivityRow {
  id: string;
  city_id: string | null;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number | null;
  estimated_cost: number | null;
  currency: string;
  rating: number | null;
  location: ActivityLocation;
  tags: string[];
  source: string;
  created_by: string | null;
  is_seed: boolean;
  search_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDayRow {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  city_id: string | null;
  title: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ItineraryItemRow {
  id: string;
  trip_id: string;
  day_id: string;
  activity_id: string | null;
  city_id: string | null;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: ActivityLocation;
  estimated_cost: number | null;
  currency: string;
  booking_status: BookingStatus;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRow {
  id: string;
  trip_id: string;
  user_id: string;
  itinerary_item_id: string | null;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  time: string;
  created_at: string;
  updated_at: string;
}

export interface PackingItemRow {
  id: string;
  trip_id: string;
  name: string;
  category: string;
  quantity: number;
  is_packed: boolean;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryRow {
  id: string;
  trip_id: string;
  day_id: string | null;
  itinerary_item_id: string | null;
  title: string;
  body: string | null;
  entry_date: string;
  mood: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const supabaseRpcNames = {
  generateTripNumber: 'generate_trip_number',
  searchCities: 'search_cities',
  searchActivities: 'search_activities',
  loadPublicItinerary: 'load_public_itinerary',
  getAdminAnalytics: 'get_admin_analytics',
} as const;

export type SupabaseRpcName = (typeof supabaseRpcNames)[keyof typeof supabaseRpcNames];

export interface GenerateTripNumberParams {
  user_uuid: string;
}

export interface SearchCitiesParams {
  p_query: string;
  p_limit?: number;
}

export type CitySearchResult = Pick<
  CityRow,
  'id' | 'name' | 'region' | 'country' | 'country_code' | 'lat' | 'lng' | 'timezone' | 'image_url'
>;

export interface SearchActivitiesParams {
  p_city_id?: string | null;
  p_query?: string | null;
  p_category?: string | null;
  p_limit?: number;
}

export interface ActivitySearchResult {
  id: string;
  city_id: string | null;
  city_name: string | null;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number | null;
  estimated_cost: number | null;
  currency: string;
  rating: number | null;
  location: ActivityLocation;
  tags: string[];
  source: string;
  is_seed: boolean;
}

export interface PublicCity {
  id: string;
  name: string;
  region: string | null;
  country: string;
  country_code: string | null;
  lat?: number | null;
  lng?: number | null;
  timezone: string | null;
  image_url: string | null;
}

export interface PublicActivity {
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number | null;
  rating: number | null;
  tags: string[];
  source: string;
}

export interface PublicItineraryItem {
  id: string;
  activity_id: string | null;
  city_id: string | null;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: ActivityLocation;
  estimated_cost: number | null;
  currency: string;
  booking_status: BookingStatus;
  notes: string | null;
  sort_order: number;
  activity: PublicActivity | null;
}

export interface PublicItineraryDay {
  id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  notes: string | null;
  sort_order: number;
  city: PublicCity | null;
  items: PublicItineraryItem[];
}

export interface PublicPackingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  is_packed: boolean;
  notes: string | null;
  sort_order: number;
}

export interface PublicJournalEntry {
  id: string;
  day_id: string | null;
  itinerary_item_id: string | null;
  title: string;
  body: string | null;
  entry_date: string;
  mood: string | null;
}

export interface PublicExpense {
  id: string;
  itinerary_item_id: string | null;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  time: string;
}

export interface PublicTripSummary {
  share_id: string;
  title: string;
  origin: string | null;
  destination: string;
  travel_mode: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicVisibility {
  overview: boolean;
  itinerary: boolean;
  expenses: boolean;
  packing: boolean;
  journal: boolean;
}

export interface PublicItineraryPayload {
  trip: PublicTripSummary;
  primary_city: PublicCity | null;
  itinerary_days: PublicItineraryDay[];
  packing_items: PublicPackingItem[];
  journal_entries: PublicJournalEntry[];
  expenses: PublicExpense[];
  visibility: PublicVisibility;
}

export interface LoadPublicItineraryParams {
  p_share_id: string;
}

export interface AdminAnalyticsParams {
  p_from_date?: string | null;
  p_to_date?: string | null;
}

export interface AdminAnalyticsTotals {
  users: number;
  trips: number;
  public_shares: number;
  expenses_amount: number;
  cities: number;
  activities: number;
  itinerary_items: number;
  packing_items: number;
  journal_entries: number;
}

export interface AdminExpenseCategoryStats {
  count: number;
  amount: number;
}

export interface AdminTopCity {
  city_id: string;
  name: string;
  country: string;
  trip_count: number;
}

export interface AdminDailyTripCreation {
  date: string;
  count: number;
}

export interface AdminAnalyticsPayload {
  totals: AdminAnalyticsTotals;
  trips_by_status: Partial<Record<TripStatus, number>>;
  expenses_by_category: Partial<Record<ExpenseCategory, AdminExpenseCategoryStats>>;
  top_cities: AdminTopCity[];
  daily_trip_creations: AdminDailyTripCreation[];
}
