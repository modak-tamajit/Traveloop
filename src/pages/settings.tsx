import {Moon} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card,CardContent} from "@/components/ui/card"
import {PageHeader,PageShell} from "@/components/layout/page-shell"
import {useTheme} from "@/providers/theme-provider"
export function SettingsPage(){const {theme,toggleTheme}=useTheme();return <PageShell><PageHeader title="Settings" eyebrow="Preferences"/><Card><CardContent className="flex items-center justify-between gap-3 pt-5"><div><h2 className="font-bold">Theme</h2><p className="text-sm text-foreground/60">Current mode: {theme}</p></div><Button onClick={toggleTheme}><Moon className="h-4 w-4"/>Toggle</Button></CardContent></Card></PageShell>}
