import {useState} from "react"
import type {FormEvent} from "react"
import {Camera, Mail, MapPin, Phone, User} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Field, Input, Textarea} from "@/components/ui/input"
import {useToast} from "@/components/ui/toast"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {TripCard} from "@/components/travel/trip-card"
import {useSupabaseQuery} from "@/hooks/use-supabase-query"
import {useAuth} from "@/providers/auth-provider"
import {emptyDashboard, listTrips} from "@/services/traveloop-api"

export function ProfilePage() {
  const {profile, updateProfile} = useAuth()
  const {notify} = useToast()
  const {data: trips} = useSupabaseQuery("profile-trips", emptyDashboard.trips, async () => (await listTrips()).data)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get("fullName") ?? "").trim()

    if (!fullName) {
      notify({title: "Name required", description: "Add a display name before saving your profile."})
      return
    }

    try {
      setIsSaving(true)
      await updateProfile({
        fullName,
        phone: optionalFormText(formData, "phone"),
        city: optionalFormText(formData, "city"),
        country: optionalFormText(formData, "country"),
        bio: optionalFormText(formData, "bio"),
        avatarUrl: profile?.avatarUrl,
      })
      notify({title: "Profile saved", description: "Your Supabase profile row is up to date."})
    } catch (error) {
      notify({title: "Profile save failed", description: error instanceof Error ? error.message : "Please try again."})
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageShell>
      <PageHeader description="Profile details, contact fields, and saved trip history." eyebrow="Account" title="Profile" />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardContent className="pt-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  alt={profile?.fullName ?? "Traveler profile"}
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-muted"
                  src={profile?.avatarUrl ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80"}
                />
                <Button className="absolute bottom-1 right-1 rounded-full" size="icon" variant="accent">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="mt-4 text-2xl font-bold">{profile?.fullName}</h2>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">{profile?.role}</p>
              <p className="mt-3 text-sm text-foreground/60">{profile?.bio}</p>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                {profile?.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                {profile?.phone ?? "No phone added"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {[profile?.city, profile?.country].filter(Boolean).join(", ") || "No location added"}
              </p>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-5">
          <Card>
            <CardContent className="pt-5">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold">Traveler details</h2>
              </div>
              <form key={profile?.id ?? "profile"} onSubmit={handleSave}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full name">
                    <Input defaultValue={profile?.fullName ?? ""} name="fullName" />
                  </Field>
                  <Field label="Email address">
                    <Input disabled value={profile?.email ?? ""} />
                  </Field>
                  <Field label="Phone number">
                    <Input defaultValue={profile?.phone ?? ""} name="phone" />
                  </Field>
                  <Field label="City">
                    <Input defaultValue={profile?.city ?? ""} name="city" />
                  </Field>
                  <Field label="Country">
                    <Input defaultValue={profile?.country ?? ""} name="country" />
                  </Field>
                  <Field className="md:col-span-2" label="Additional information">
                    <Textarea defaultValue={profile?.bio ?? ""} name="bio" />
                  </Field>
                </div>
                <Button className="mt-5" disabled={isSaving} type="submit">
                  {isSaving ? "Saving..." : "Save profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-4 text-xl font-bold">Preplanned trips</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {trips.slice(0, 2).map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

function optionalFormText(formData: FormData, field: string): string | undefined {
  const value = String(formData.get(field) ?? "").trim()
  return value || undefined
}
