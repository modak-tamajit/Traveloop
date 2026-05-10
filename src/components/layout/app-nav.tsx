import {BarChart3, Compass, Home, LogOut, Menu, Moon, Plus, Search, Settings, Sun, Users, User, X} from "lucide-react"
import type {LucideIcon} from "lucide-react"
import {useState} from "react"
import {NavLink} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {useAuth} from "@/providers/auth-provider"
import {useTheme} from "@/providers/theme-provider"
import {cn} from "@/lib/utils"

const navItems = [
  {label: "Home", href: "/dashboard", icon: Home},
  {label: "Trips", href: "/trips", icon: Compass},
  {label: "Search", href: "/search", icon: Search},
  {label: "Add", href: "/add-trip", icon: Plus},
  {label: "Community", href: "/community", icon: Users},
  {label: "Analytics", href: "/admin/analytics", icon: BarChart3, adminOnly: true},
  {label: "Settings", href: "/settings", icon: Settings},
  {label: "Profile", href: "/profile", icon: User},
]

export function AppNav() {
  const {profile, isAdmin, signOut} = useAuth()
  const {theme, toggleTheme} = useTheme()
  const [open, setOpen] = useState(false)
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/86 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <NavLink className="flex items-center gap-3 font-bold" to="/dashboard">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Compass className="h-5 w-5" />
            </span>
            <span className="tracking-tight">Traveloop</span>
          </NavLink>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {visibleItems.map((item) => (
              <NavItemLink href={item.href} icon={item.icon} key={item.href} label={item.label} />
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button aria-label="Toggle theme" onClick={toggleTheme} size="icon" variant="ghost">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button aria-label="Open menu" className="lg:hidden" onClick={() => setOpen(true)} size="icon" variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
            <Button className="hidden sm:inline-flex" onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4" />
              {profile?.fullName.split(" ")[0]}
            </Button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {visibleItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                className={({isActive}) =>
                  cn(
                    "flex h-14 flex-col items-center justify-center rounded-lg text-[11px] font-semibold text-foreground/60",
                    isActive && "bg-muted text-primary",
                  )
                }
                key={item.href}
                to={item.href}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-50 bg-foreground/35 backdrop-blur-sm lg:hidden">
          <aside className="page-enter ml-auto flex h-full w-full max-w-sm flex-col border-l border-border bg-card p-4 shadow-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 font-bold">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Compass className="h-5 w-5" />
                </span>
                Traveloop
              </div>
              <Button aria-label="Close menu" onClick={() => setOpen(false)} size="icon" variant="ghost">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6 space-y-2">
              {visibleItems.map((item) => (
                <NavItemLink
                  href={item.href}
                  icon={item.icon}
                  key={item.href}
                  label={item.label}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
            <Button className="mt-auto" onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </aside>
        </div>
      ) : null}
    </>
  )
}

function NavItemLink({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string
  label: string
  icon: LucideIcon
  onClick?: () => void
}) {
  return (
    <NavLink
      className={({isActive}) =>
        cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground/70 transition hover:bg-muted hover:text-foreground",
          isActive && "bg-muted text-primary",
        )
      }
      onClick={onClick}
      to={href}
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  )
}
