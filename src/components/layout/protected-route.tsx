import {Navigate, useLocation} from "react-router-dom"
import type {ReactNode} from "react"
import {Compass} from "lucide-react"
import {useAuth} from "@/providers/auth-provider"

export function ProtectedRoute({children, adminOnly = false}: {children: ReactNode; adminOnly?: boolean}) {
  const {isAuthenticated, isAdmin, isLoading} = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-soft">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Compass className="h-5 w-5 animate-pulse" />
          </span>
          <div>
            <p className="font-bold">Restoring your session</p>
            <p className="text-sm text-foreground/60">Checking Supabase Auth before opening Traveloop.</p>
          </div>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) return <Navigate replace state={{from: location}} to="/" />
  if (adminOnly && !isAdmin) return <Navigate replace to="/dashboard" />
  return children
}
