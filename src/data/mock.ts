import type {Activity, CityOption, ExpenseLine, ItinerarySection, JournalEntry, PackingGroup, Trip} from "@/types"

export const trips: Trip[] = [
  {
    id: "c1fcd2fb-3d66-4f1f-98cf-6a75d85f6b51",
    userId: "demo-user",
    title: "Monsoon Trails",
    destination: "Kerala, India",
    startDate: "2026-06-18",
    endDate: "2026-06-25",
    status: "planned",
    primaryCityId: "kochi",
    coverImageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    isPublic: true,
    budget: 82000,
    spent: 37200,
    progress: 62,
    travelers: 4,
    highlights: ["Backwaters", "Fort Kochi", "Tea gardens"],
  },
  {
    id: "afd8a850-8b8a-4f9a-944e-9ef32e671a70",
    userId: "demo-user",
    title: "Desert Gold",
    destination: "Jaipur, India",
    startDate: "2026-09-04",
    endDate: "2026-09-10",
    status: "draft",
    primaryCityId: "jaipur",
    coverImageUrl: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80",
    isPublic: false,
    budget: 56000,
    spent: 12000,
    progress: 34,
    travelers: 2,
    highlights: ["Amber Fort", "Hawa Mahal", "Bazaar walk"],
  },
  {
    id: "9200e169-b6f3-46f7-ae24-e65f4381fa9a",
    userId: "demo-user",
    title: "Roman Pause",
    destination: "Rome, Italy",
    startDate: "2026-11-12",
    endDate: "2026-11-18",
    status: "active",
    primaryCityId: "rome",
    coverImageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    isPublic: true,
    budget: 190000,
    spent: 126000,
    progress: 78,
    travelers: 3,
    highlights: ["Trastevere", "Colosseum", "Market dinners"],
  },
]

export const cities: CityOption[] = [
  {
    id: "kochi",
    name: "Kochi",
    region: "Kerala",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=600&q=80",
    score: "Art coast",
  },
  {
    id: "jaipur",
    name: "Jaipur",
    region: "Rajasthan",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=600&q=80",
    score: "Royal trail",
  },
  {
    id: "goa",
    name: "Goa",
    region: "Goa",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
    score: "Beach rhythm",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "Maharashtra",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=600&q=80",
    score: "City pulse",
  },
]

export const activities: Activity[] = [
  {
    id: "fort-kochi",
    cityId: "kochi",
    name: "Fort Kochi Art Walk",
    category: "Culture",
    duration: "2 hr",
    cost: 0,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1590123732197-0a9b0ec491f7?auto=format&fit=crop&w=600&q=80",
    tags: ["walk", "cafes", "murals"],
  },
  {
    id: "pichola",
    cityId: "udaipur",
    name: "Lake Pichola Boat Ride",
    category: "Outdoors",
    duration: "1 hr",
    cost: 700,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80",
    tags: ["lake", "sunset", "boat"],
  },
  {
    id: "amber",
    cityId: "jaipur",
    name: "Amber Fort Morning",
    category: "History",
    duration: "2.5 hr",
    cost: 100,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80",
    tags: ["fort", "palace", "views"],
  },
  {
    id: "food-tour",
    cityId: "rome",
    name: "Trastevere Supper Walk",
    category: "Food",
    duration: "3 hr",
    cost: 4200,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=600&q=80",
    tags: ["pasta", "market", "night"],
  },
]

export const itinerarySections: ItinerarySection[] = [
  {
    id: "day-1",
    day: "Day 1",
    title: "Arrival and old quarter walk",
    dateRange: "Jun 18",
    budget: 8800,
    notes: "Land, settle in, and keep the first day light.",
    activities: [activities[0], activities[3]],
  },
  {
    id: "day-2",
    day: "Day 2",
    title: "Waterfront and food trail",
    dateRange: "Jun 19",
    budget: 12200,
    notes: "Morning waterfront, afternoon rest, dinner route.",
    activities: [activities[1], activities[2]],
  },
  {
    id: "day-3",
    day: "Day 3",
    title: "Museum, markets, and public share review",
    dateRange: "Jun 20",
    budget: 9600,
    notes: "Owner-approved fields are ready for the public itinerary.",
    activities: [activities[2], activities[0]],
  },
]

export const packingGroups: PackingGroup[] = [
  {
    category: "Documents",
    items: [
      {name: "Passport", packed: true},
      {name: "Flight tickets", packed: true},
      {name: "Travel insurance", packed: true},
      {name: "Hotel booking confirmation", packed: false},
    ],
  },
  {
    category: "Clothing",
    items: [
      {name: "Casual shirts", packed: true},
      {name: "Trousers / jeans", packed: false},
      {name: "Comfortable walking shoes", packed: false},
      {name: "Light jacket", packed: false},
    ],
  },
  {
    category: "Electronics",
    items: [
      {name: "Phone charger", packed: true},
      {name: "Universal power adapter", packed: false},
      {name: "Earphones", packed: false},
    ],
  },
]

export const journalEntries: JournalEntry[] = [
  {
    id: "note-1",
    title: "Hotel check-in details - Rome stop",
    body: "Check in after 2pm, room 302, breakfast included from 7-10am.",
    date: "Day 3 - June 14 2025",
    mood: "settled",
  },
  {
    id: "note-2",
    title: "Market lane dinner",
    body: "Keep the dinner slot flexible and book only if the group wants a slower evening.",
    date: "Day 4 - June 15 2025",
    mood: "curious",
  },
  {
    id: "note-3",
    title: "Museum pass reminder",
    body: "Carry student ID copies and confirm QR passes before leaving the hotel.",
    date: "Day 5 - June 16 2025",
    mood: "prepared",
  },
]

export const expenseLines: ExpenseLine[] = [
  {id: "exp-1", category: "Hotel", description: "Hotel booking Paris", quantity: "3 nights", unitCost: 3000, amount: 9000},
  {id: "exp-2", category: "Travel", description: "Flight bookings DEL to PAR", quantity: "1", unitCost: 12000, amount: 12000},
  {id: "exp-3", category: "Food", description: "Dinner reservations", quantity: "2 meals", unitCost: 500, amount: 1000},
]
