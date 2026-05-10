import {User} from "lucide-react"
import {Card,CardContent} from "@/components/ui/card"
import {PageHeader,PageShell} from "@/components/layout/page-shell"
import {useAuth} from "@/providers/auth-provider"
export function ProfilePage(){const {profile}=useAuth();return <PageShell><PageHeader title="Profile" eyebrow="Account"/><Card><CardContent className="pt-5"><User className="h-7 w-7 text-accent"/><h2 className="mt-3 font-bold">{profile?.fullName}</h2><p className="text-sm text-foreground/60">{profile?.email}</p><p className="mt-3 text-sm font-semibold text-primary">Role: {profile?.role}</p></CardContent></Card></PageShell>}
