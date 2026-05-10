import {CheckCircle2, Copy, Eye, Globe2, Lock, Share2} from "lucide-react"
import {useParams} from "react-router-dom"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Field, Input, Textarea} from "@/components/ui/input"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {TripTabs} from "@/pages/trip-detail"
import {itinerarySections, trips} from "@/data/mock"

const visibilityOptions = [
  {label: "Overview", description: "Trip title, destination, dates, and cover image.", enabled: true},
  {label: "Itinerary", description: "Owner-approved days and activity titles.", enabled: true},
  {label: "Journal highlights", description: "Only entries marked public in the journal.", enabled: false},
  {label: "Expenses", description: "Private unless explicitly enabled for collaborators.", enabled: false},
]

export function TripSharePage() {
  const {id} = useParams()
  const trip = trips.find((item) => item.id === id) ?? trips[0]
  const shareUrl = `https://traveloop.app/share/${trip.id.slice(0, 8)}`

  return (
    <PageShell>
      <PageHeader
        actions={
          <Button>
            <Share2 className="h-4 w-4" />
            Copy link
          </Button>
        }
        description="Control what appears on the public itinerary page."
        eyebrow="Public sharing"
        title={trip.title}
      />
      <TripTabs id={trip.id} />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-accent" />
                Share settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field label="Public itinerary link">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input readOnly value={shareUrl} />
                  <Button variant="outline">
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </Field>
              <Field label="Public note">
                <Textarea defaultValue="A compact itinerary for friends and family. Private expenses and profile details stay hidden." rows={4} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                {visibilityOptions.map((option) => (
                  <label
                    className="flex cursor-pointer gap-3 rounded-lg border border-border bg-background p-4 transition hover:border-primary/40"
                    key={option.label}
                  >
                    <input className="mt-1 h-4 w-4 accent-primary" defaultChecked={option.enabled} type="checkbox" />
                    <span>
                      <span className="block font-bold">{option.label}</span>
                      <span className="mt-1 block text-sm text-foreground/60">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security guardrails</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {[
                ["Private profile fields", "Never shown"],
                ["Expenses", "Off by default"],
                ["Journal entries", "Public flag only"],
              ].map(([label, detail]) => (
                <div className="rounded-lg border border-border bg-muted/45 p-4" key={label}>
                  <Lock className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-bold">{label}</p>
                  <p className="mt-1 text-sm text-foreground/60">{detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card className="overflow-hidden">
            <img alt={trip.destination} className="h-44 w-full object-cover" src={trip.coverImageUrl} />
            <CardContent className="pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">{trip.title}</h2>
                  <p className="text-sm text-foreground/60">{trip.destination}</p>
                </div>
                <Badge variant={trip.isPublic ? "success" : "muted"}>{trip.isPublic ? "Live" : "Draft"}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {itinerarySections.map((section) => (
                  <div className="rounded-lg border border-border p-3" key={section.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold">{section.day}</p>
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    </div>
                    <p className="mt-1 text-sm text-foreground/70">{section.title}</p>
                  </div>
                ))}
              </div>
              <Button className="mt-5 w-full" variant="outline">
                <Eye className="h-4 w-4" />
                Preview public page
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  )
}
