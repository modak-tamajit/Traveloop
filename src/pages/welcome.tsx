import {useState} from "react"
import {ArrowRight, Camera, Compass, LockKeyhole, MapPin, Plane, UserPlus} from "lucide-react"
import {useLocation, useNavigate} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Field, Input, Textarea} from "@/components/ui/input"
import {useToast} from "@/components/ui/toast"
import {useAuth} from "@/providers/auth-provider"

type LoginForm = {
  email: string
  password: string
}

type RegisterForm = LoginForm & {
  firstName: string
  lastName: string
  phone: string
  city: string
  country: string
  bio: string
}

type RouteState = {
  from?: {
    pathname?: string
  }
}

export function WelcomePage() {
  const {isAuthenticated, signIn, signUp} = useAuth()
  const {notify} = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as RouteState | null)?.from?.pathname ?? "/dashboard"
  const [submitting, setSubmitting] = useState<"login" | "register" | null>(null)
  const [loginForm, setLoginForm] = useState<LoginForm>({email: "", password: ""})
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    country: "",
    bio: "",
  })

  const openAuthenticatedApp = () => {
    if (isAuthenticated) {
      navigate("/dashboard")
      return
    }
    notify({
      title: "Sign in first",
      description: "Use your Supabase account or create a new traveler profile to open Traveloop.",
    })
  }

  const handleLogin = async () => {
    if (!loginForm.email.trim() || !loginForm.password) {
      notify({title: "Email and password required", description: "Enter your Supabase Auth credentials to continue."})
      return
    }

    try {
      setSubmitting("login")
      await signIn(loginForm)
      notify({title: "Login successful", description: "Opening your planning workspace."})
      navigate(redirectTo)
    } catch (error) {
      notify({title: "Login failed", description: errorMessage(error)})
    } finally {
      setSubmitting(null)
    }
  }

  const handleRegister = async () => {
    if (!registerForm.firstName.trim() || !registerForm.email.trim() || !registerForm.password) {
      notify({title: "Missing registration details", description: "First name, email, and password are required."})
      return
    }

    if (registerForm.password.length < 6) {
      notify({title: "Password is too short", description: "Supabase Auth requires at least 6 characters."})
      return
    }

    try {
      setSubmitting("register")
      const result = await signUp({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName || undefined,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone || undefined,
        city: registerForm.city || undefined,
        country: registerForm.country || undefined,
        bio: registerForm.bio || undefined,
      })

      if (result.needsEmailConfirmation) {
        notify({
          title: "Confirm your email",
          description: "Supabase created the account. Confirm the email, then sign in here.",
        })
        return
      }

      notify({title: "Registration complete", description: "Your traveler profile is connected to Supabase Auth."})
      navigate("/dashboard")
    } catch (error) {
      notify({title: "Registration failed", description: errorMessage(error)})
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <img
            alt="Mountain road and travel landscape"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80"
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
              <Button className="border-white/25 bg-white/12 text-white hover:bg-white/20" onClick={openAuthenticatedApp} variant="outline">
                Open App
              </Button>
            </nav>
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-200">India travel command center</p>
              <h1 className="text-5xl font-bold leading-tight sm:text-7xl">Plan every journey with clarity.</h1>
              <p className="mt-5 max-w-xl text-lg text-white/82">
                Build trips, shape day-wise itineraries, track expenses, pack neatly, journal memories, and share only
                what you approve.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="bg-white text-primary hover:bg-white/90" onClick={openAuthenticatedApp} size="lg">
                  <Plane className="h-4 w-4" />
                  Start planning
                </Button>
                <Button className="border-white/25 bg-white/12 text-white hover:bg-white/20" onClick={openAuthenticatedApp} size="lg" variant="outline">
                  {isAuthenticated ? "Go to dashboard" : "Sign in to continue"}
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
                <Field label="Email address">
                  <Input
                    autoComplete="email"
                    onChange={(event) => setLoginForm((current) => ({...current, email: event.target.value}))}
                    placeholder="traveler@example.com"
                    type="email"
                    value={loginForm.email}
                  />
                </Field>
                <Field label="Password">
                  <Input
                    autoComplete="current-password"
                    onChange={(event) => setLoginForm((current) => ({...current, password: event.target.value}))}
                    placeholder="Enter password"
                    type="password"
                    value={loginForm.password}
                  />
                </Field>
                <Button className="w-full" disabled={submitting === "login"} onClick={handleLogin}>
                  {submitting === "login" ? "Logging in..." : "Login"}
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
                  <Input
                    autoComplete="given-name"
                    onChange={(event) => setRegisterForm((current) => ({...current, firstName: event.target.value}))}
                    placeholder="Aarav"
                    value={registerForm.firstName}
                  />
                </Field>
                <Field label="Last name">
                  <Input
                    autoComplete="family-name"
                    onChange={(event) => setRegisterForm((current) => ({...current, lastName: event.target.value}))}
                    placeholder="Mehta"
                    value={registerForm.lastName}
                  />
                </Field>
                <Field label="Email address">
                  <Input
                    autoComplete="email"
                    onChange={(event) => setRegisterForm((current) => ({...current, email: event.target.value}))}
                    placeholder="name@email.com"
                    type="email"
                    value={registerForm.email}
                  />
                </Field>
                <Field label="Password">
                  <Input
                    autoComplete="new-password"
                    onChange={(event) => setRegisterForm((current) => ({...current, password: event.target.value}))}
                    placeholder="Minimum 6 characters"
                    type="password"
                    value={registerForm.password}
                  />
                </Field>
                <Field label="Phone number">
                  <Input
                    autoComplete="tel"
                    onChange={(event) => setRegisterForm((current) => ({...current, phone: event.target.value}))}
                    placeholder="+91 90000 12000"
                    value={registerForm.phone}
                  />
                </Field>
                <Field label="City">
                  <Input
                    autoComplete="address-level2"
                    onChange={(event) => setRegisterForm((current) => ({...current, city: event.target.value}))}
                    placeholder="Mumbai"
                    value={registerForm.city}
                  />
                </Field>
                <Field label="Country">
                  <Input
                    autoComplete="country-name"
                    onChange={(event) => setRegisterForm((current) => ({...current, country: event.target.value}))}
                    placeholder="India"
                    value={registerForm.country}
                  />
                </Field>
                <Field className="sm:col-span-2" label="Additional information">
                  <Textarea
                    onChange={(event) => setRegisterForm((current) => ({...current, bio: event.target.value}))}
                    placeholder="Preferred travel style, accessibility needs, or planning notes"
                    value={registerForm.bio}
                  />
                </Field>
              </div>
              <Button className="mt-5 w-full" disabled={submitting === "register"} onClick={handleRegister} variant="accent">
                <UserPlus className="h-4 w-4" />
                {submitting === "register" ? "Creating account..." : "Register user"}
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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Please try again."
}
