import {Camera, Mail, MapPin, Phone, User} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Field, Input, Textarea} from "@/components/ui/input"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {TripCard} from "@/components/travel/trip-card"
import {useAuth} from "@/providers/auth-provider"
import {trips} from "@/data/mock"

export function ProfilePage() {
  const {profile} = useAuth()

  return (
    <PageShell>
      <PageHeader description="Profile details, contact fields, and saved trip history." eyebrow="Account" title="Profile" />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardContent className="pt-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  alt={profile?.fullName}
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-muted"
                  src={profile?.avatarUrl}
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
                {profile?.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {profile?.city}, {profile?.country}
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
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name">
                  <Input defaultValue={profile?.fullName} />
                </Field>
                <Field label="Email address">
                  <Input defaultValue={profile?.email} />
                </Field>
                <Field label="City">
                  <Input defaultValue={profile?.city} />
                </Field>
                <Field label="Country">
                  <Input defaultValue={profile?.country} />
                </Field>
                <Field className="md:col-span-2" label="Additional information">
                  <Textarea defaultValue={profile?.bio} />
                </Field>
              </div>
              <Button className="mt-5">Save profile</Button>
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
