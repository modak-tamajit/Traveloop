import {Compass} from "lucide-react"
import {useParams} from "react-router-dom"
import {PageHeader,PageShell} from "@/components/layout/page-shell"
import {Card,CardContent} from "@/components/ui/card"
export function PublicSharePage(){const {shareId}=useParams();return <PageShell><PageHeader title="Shared Itinerary" eyebrow="Public safarnama"/><Card><CardContent className="pt-5"><Compass className="h-8 w-8 text-accent"/><h2 className="mt-3 font-bold">Share {shareId}</h2><p className="mt-1 text-sm text-foreground/60">Public route shell is separate from private app navigation and should receive only approved itinerary data.</p></CardContent></Card></PageShell>}
