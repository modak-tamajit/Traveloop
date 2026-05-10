import {Database, Download, Moon, ShieldCheck, Sun, Upload} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {SegmentedTabs, TabButton} from "@/components/ui/tabs"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {useTheme} from "@/providers/theme-provider"

export function SettingsPage() {
  const {theme, toggleTheme, setTheme} = useTheme()

  return (
    <PageShell>
      <PageHeader description="Account preferences, theme mode, import/export, and privacy defaults." eyebrow="Preferences" title="Settings" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <Moon className="h-6 w-6 text-accent" />
            <h2 className="mt-3 text-xl font-bold">Theme</h2>
            <p className="mt-1 text-sm text-foreground/60">Current mode: {theme}</p>
            <SegmentedTabs className="mt-4 max-w-sm">
              <TabButton active={theme === "light"} onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" />
                Light
              </TabButton>
              <TabButton active={theme === "dark"} onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" />
                Dark
              </TabButton>
            </SegmentedTabs>
            <Button className="mt-5" onClick={toggleTheme} variant="outline">
              Toggle mode
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="mt-3 text-xl font-bold">Sharing defaults</h2>
            <div className="mt-4 space-y-3">
              {["Overview visible", "Itinerary visible", "Expenses private", "Journal private"].map((label, index) => (
                <label className="flex items-center justify-between rounded-lg border border-border p-3" key={label}>
                  <span className="font-semibold">{label}</span>
                  <input checked={index < 2} className="h-4 w-4 accent-orange-500" readOnly type="checkbox" />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="pt-5">
            <Database className="h-6 w-6 text-gold" />
            <h2 className="mt-3 text-xl font-bold">Import and export</h2>
            <p className="mt-1 text-sm text-foreground/60">Move trip data between devices and planning workspaces.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
