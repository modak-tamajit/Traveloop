import {lazy, Suspense} from "react"
import {Route, Routes} from "react-router-dom"
import {AppLayout} from "@/components/layout/app-layout"
import {ProtectedRoute} from "@/components/layout/protected-route"

const WelcomePage = lazy(() => import("@/pages/welcome").then((module) => ({default: module.WelcomePage})))
const PublicSharePage = lazy(() => import("@/pages/public-share").then((module) => ({default: module.PublicSharePage})))
const DashboardPage = lazy(() => import("@/pages/dashboard").then((module) => ({default: module.DashboardPage})))
const TripListingPage = lazy(() => import("@/pages/trip-listing").then((module) => ({default: module.TripListingPage})))
const SearchPage = lazy(() => import("@/pages/search").then((module) => ({default: module.SearchPage})))
const CommunityPage = lazy(() => import("@/pages/community").then((module) => ({default: module.CommunityPage})))
const AddTripPage = lazy(() => import("@/pages/add-trip").then((module) => ({default: module.AddTripPage})))
const EditTripPage = lazy(() => import("@/pages/edit-trip").then((module) => ({default: module.EditTripPage})))
const TripDetailPage = lazy(() => import("@/pages/trip-detail").then((module) => ({default: module.TripDetailPage})))
const TripItineraryPage = lazy(() => import("@/pages/trip-itinerary").then((module) => ({default: module.TripItineraryPage})))
const TripExpensesPage = lazy(() => import("@/pages/trip-expenses").then((module) => ({default: module.TripExpensesPage})))
const TripChecklistPage = lazy(() => import("@/pages/trip-checklist").then((module) => ({default: module.TripChecklistPage})))
const TripJournalPage = lazy(() => import("@/pages/trip-journal").then((module) => ({default: module.TripJournalPage})))
const TripSharePage = lazy(() => import("@/pages/trip-share").then((module) => ({default: module.TripSharePage})))
const SettingsPage = lazy(() => import("@/pages/settings").then((module) => ({default: module.SettingsPage})))
const ProfilePage = lazy(() => import("@/pages/profile").then((module) => ({default: module.ProfilePage})))
const AdminAnalyticsPage = lazy(() => import("@/pages/admin-analytics").then((module) => ({default: module.AdminAnalyticsPage})))
const NotFoundPage = lazy(() => import("@/pages/not-found").then((module) => ({default: module.NotFoundPage})))

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/share/:shareId" element={<PublicSharePage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<TripListingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/add-trip" element={<AddTripPage />} />
          <Route path="/edit-trip/:id" element={<EditTripPage />} />
          <Route path="/trip/:id" element={<TripDetailPage />} />
          <Route path="/trip/:id/itinerary" element={<TripItineraryPage />} />
          <Route path="/trip/:id/expenses" element={<TripExpensesPage />} />
          <Route path="/trip/:id/checklist" element={<TripChecklistPage />} />
          <Route path="/trip/:id/journal" element={<TripJournalPage />} />
          <Route path="/trip/:id/share" element={<TripSharePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute adminOnly>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminAnalyticsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Loading" />
    </main>
  )
}
