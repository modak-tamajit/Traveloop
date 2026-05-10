import {CheckSquare,Plus} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card,CardContent} from "@/components/ui/card"
import {PageHeader,PageShell} from "@/components/layout/page-shell"
export function TripChecklistPage(){return <PageShell><PageHeader title="Packing Checklist" eyebrow="Trip prep" actions={<Button><Plus className="h-4 w-4"/>Add item</Button>}/><Card><CardContent className="space-y-3 pt-5">{["Documents","Clothes","Chargers"].map(item=><label key={item} className="flex items-center gap-3 rounded-lg border border-border p-3"><input type="checkbox" className="h-4 w-4 accent-orange-500"/><CheckSquare className="h-4 w-4 text-accent"/><span className="font-semibold">{item}</span></label>)}</CardContent></Card></PageShell>}
