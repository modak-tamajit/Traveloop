import {ArrowRight, Camera, Compass, LockKeyhole, MapPin, Plane, UserPlus} from "lucide-react"
import {useNavigate} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Field, Input, Textarea} from "@/components/ui/input"
import {useToast} from "@/components/ui/toast"
import {useAuth} from "@/providers/auth-provider"

export function WelcomePage() {
  const {isAuthenticated, signIn} = useAuth()
  const {notify} = useToast()
  const navigate = useNavigate()
  const enterApp = (message: string) => {
    signIn()
    notify({title: message, description: "Opening the main landing page."})
    navigate("/dashboard")
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <img
            alt="Mountain road and travel landscape"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/10" />
          <div className="relative flex min-h-[620px] flex-col justify-between p-6 text-white sm:p-8">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xl font-bold">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <Compass className="h-6 w-6" />
                </span>
                Traveloop
              </div>
              <Button className="border-white/25 bg-white/12 text-white hover:bg-white/20" onClick={() => enterApp("Welcome back")} variant="outline">
                Open App
              </Button>
            </nav>
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-200">Travel command center</p>
              <h1 className="text-5xl font-bold leading-tight sm:text-7xl">Plan every journey with clarity.</h1>
              <p className="mt-5 max-w-xl text-lg text-white/82">
                Build trips, shape day-wise itineraries, track expenses, pack neatly, journal memories, and share only
                what you approve.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="bg-white text-primary hover:bg-white/90" onClick={() => enterApp("Planning session ready")} size="lg">
                  <Plane className="h-4 w-4" />
                  Start planning
                </Button>
                <Button className="border-white/25 bg-white/12 text-white hover:bg-white/20" onClick={() => enterApp("Demo session ready")} size="lg" variant="outline">
                  {isAuthenticated ? "Demo active" : "Use demo auth"}
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Itinerary", "Day-wise planning"],
                ["Ledger", "Private expenses"],
                ["Sharing", "Owner-approved links"],
              ].map(([label, value]) => (
                <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur" key={label}>
                  <b>{label}</b>
                  <p className="mt-1 text-sm text-white/75">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-muted text-primary">
                <LockKeyhole className="h-8 w-8" />
              </div>
              <div className="mt-5 space-y-4">
                <Field label="Email or username">
                  <Input placeholder="traveler@safarnama.app" />
                </Field>
                <Field label="Password">
                  <Input placeholder="Enter password" type="password" />
                </Field>
                <Button className="w-full" onClick={() => enterApp("Login successful")}>
                  Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-accent">Registration</p>
                  <h2 className="text-2xl font-bold">Create traveler profile</h2>
                </div>
                <div className="grid h-16 w-16 place-items-center rounded-full border border-border bg-muted">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <Input placeholder="Aarav" />
                </Field>
                <Field label="Last name">
                  <Input placeholder="Mehta" />
                </Field>
                <Field label="Email address">
                  <Input placeholder="name@email.com" type="email" />
                </Field>
                <Field label="Phone number">
                  <Input placeholder="+91 90000 12000" />
                </Field>
                <Field label="City">
                  <Input placeholder="Mumbai" />
                </Field>
                <Field label="Country">
                  <Input placeholder="India" />
                </Field>
                <Field className="sm:col-span-2" label="Additional information">
                  <Textarea placeholder="Preferred travel style, accessibility needs, or planning notes" />
                </Field>
              </div>
              <Button className="mt-5 w-full" onClick={() => enterApp("Registration complete")} variant="accent">
                <UserPlus className="h-4 w-4" />
                Register user
              </Button>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border bg-muted/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-accent" />
              Next suggested region: Kochi, Kerala
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
