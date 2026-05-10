import {Link} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {PageShell} from "@/components/layout/page-shell"
export function NotFoundPage(){return <PageShell className="grid min-h-screen place-items-center text-center"><div><p className="text-sm font-bold uppercase text-accent">404</p><h1 className="mt-2 text-4xl font-bold">Route not found</h1><Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button></div></PageShell>}
