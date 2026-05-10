import {NavLink} from "react-router-dom"
import type {ButtonHTMLAttributes, ReactNode} from "react"
import {cn} from "@/lib/utils"

export function SegmentedTabs({children, className}: {children: ReactNode; className?: string}) {
  return (
    <div
      className={cn(
        "flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/60 p-1",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TabButton({
  active,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {active?: boolean}) {
  return (
    <button
      className={cn(
        "travel-focus whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-foreground/65 transition hover:bg-card hover:text-foreground",
        active && "bg-card text-primary shadow-sm",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export function TabLink({
  to,
  children,
  end,
}: {
  to: string
  children: ReactNode
  end?: boolean
}) {
  return (
    <NavLink
      end={end}
      to={to}
      className={({isActive}) =>
        cn(
          "travel-focus whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-foreground/65 transition hover:bg-card hover:text-foreground",
          isActive && "bg-card text-primary shadow-sm",
        )
      }
    >
      {children}
    </NavLink>
  )
}
