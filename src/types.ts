import type {ComponentType} from "react"

export type UserRole = "user" | "admin"
export type TripStatus = "draft" | "planned" | "active" | "completed" | "archived"

export type UserProfile = {
  id: string
  email: string
  fullName: string
  role: UserRole
  city?: string
  country?: string
  phone?: string
  avatarUrl?: string
  bio?: string
}

export type Trip = {
  id: string
  userId: string
  title: string
  destination: string
  startDate: string
  endDate: string
  status: TripStatus
  primaryCityId?: string
  coverImageUrl?: string
  isPublic: boolean
  budget?: number
  spent?: number
  progress?: number
  travelers?: number
  highlights?: string[]
}

export type CityOption = {
  id: string
  name: string
  region: string
  country: string
  imageUrl: string
  score: string
}

export type Activity = {
  id: string
  cityId: string
  name: string
  category: string
  duration: string
  cost: number
  rating: number
  imageUrl: string
  tags: string[]
}

export type ItinerarySection = {
  id: string
  day: string
  title: string
  dateRange: string
  budget: number
  notes: string
  activities: Activity[]
}

export type PackingGroup = {
  category: string
  items: {name: string; packed: boolean}[]
}

export type JournalEntry = {
  id: string
  title: string
  body: string
  date: string
  mood: string
}

export type ExpenseLine = {
  id: string
  category: string
  description: string
  quantity: string
  unitCost: number
  amount: number
}

export type NavItem = {
  label: string
  href: string
  icon: ComponentType<{className?: string}>
  protected?: boolean
  adminOnly?: boolean
}
