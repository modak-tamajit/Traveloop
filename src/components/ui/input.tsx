import type {InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes} from "react"
import {Search} from "lucide-react"
import {cn} from "@/lib/utils"

const fieldClass =
  "travel-focus h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground/45 transition"

export function Input({className, ...props}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />
}

export function Textarea({className, ...props}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "travel-focus min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/45 transition",
        className,
      )}
      {...props}
    />
  )
}

export function Select({className, ...props}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, className)} {...props} />
}

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-foreground/55">{hint}</span> : null}
    </label>
  )
}

export function SearchBar({
  className,
  placeholder = "Search",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
      <Input className="pl-9" placeholder={placeholder} {...props} />
    </div>
  )
}
