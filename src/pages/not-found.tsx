import {Compass} from "lucide-react"
import {Link} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {EmptyState} from "@/components/ui/empty-state"
import {PageShell} from "@/components/layout/page-shell"
export function NotFoundPage(){return <PageShell className="grid min-h-screen place-items-center"><EmptyState action={<Button asChild><Link to="/dashboard">Back to dashboard</Link></Button>} description="This page is not part of the Traveloop route map." icon={<Compass className="h-6 w-6"/>} title="Route not found"/></PageShell>}
