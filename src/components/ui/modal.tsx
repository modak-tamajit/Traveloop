import type {ReactNode} from "react"
import {X} from "lucide-react"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4 backdrop-blur-sm">
      <section
        aria-modal="true"
        className="page-enter w-full max-w-lg rounded-xl border border-border bg-card shadow-lift"
        role="dialog"
      >
        <header className="flex items-center justify-between gap-4 border-b border-border p-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button aria-label="Close modal" onClick={onClose} size="icon" variant="ghost">
            <X className="h-5 w-5" />
          </Button>
        </header>
        <div className={cn("p-4", footer && "pb-3")}>{children}</div>
        {footer ? <footer className="flex justify-end gap-2 border-t border-border p-4">{footer}</footer> : null}
      </section>
    </div>
  )
}
