import {BarChart3} from "lucide-react"
import {Card,CardContent} from "@/components/ui/card"
import {PageHeader,PageShell} from "@/components/layout/page-shell"
export function AdminAnalyticsPage(){return <PageShell><PageHeader title="Admin Analytics" eyebrow="Admin only"/><div className="grid gap-4 md:grid-cols-3">{["Trips created","Public shares","Seed activities"].map((item,index)=><Card key={item}><CardContent className="pt-5"><BarChart3 className="h-5 w-5 text-accent"/><p className="mt-3 text-sm text-foreground/60">{item}</p><p className="mt-2 text-3xl font-bold">{[24,8,180][index]}</p></CardContent></Card>)}</div></PageShell>}
