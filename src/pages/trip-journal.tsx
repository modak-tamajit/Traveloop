import {PenLine,Plus} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card,CardContent} from "@/components/ui/card"
import {PageHeader,PageShell} from "@/components/layout/page-shell"
export function TripJournalPage(){return <PageShell><PageHeader title="Trip Journal" eyebrow="Notes and mood" actions={<Button variant="accent"><Plus className="h-4 w-4"/>New entry</Button>}/><Card><CardContent className="pt-5"><PenLine className="h-6 w-6 text-gold"/><h2 className="mt-3 font-bold">First impression</h2><p className="mt-1 text-sm text-foreground/60">Journal entry shell supports trip, day, itinerary item, mood, and public flag contracts.</p></CardContent></Card></PageShell>}
