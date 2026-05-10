import {createContext, useCallback, useContext, useMemo, useState} from "react"
import type {ReactNode} from "react"
import {CheckCircle2, X} from "lucide-react"
import {Button} from "@/components/ui/button"

type Toast = {
  id: number
  title: string
  description?: string
}

type ToastContextValue = {
  notify: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({children}: {children: ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now()
      setToasts((current) => [...current.slice(-2), {...toast, id}])
      window.setTimeout(() => remove(id), 3600)
    },
    [remove],
  )

  const value = useMemo(() => ({notify}), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-24 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 lg:bottom-4">
        {toasts.map((toast) => (
          <div
            className="page-enter rounded-xl border border-border bg-card p-4 shadow-lift"
            key={toast.id}
            role="status"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-foreground/60">{toast.description}</p> : null}
              </div>
              <Button aria-label="Dismiss notification" onClick={() => remove(toast.id)} size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used inside ToastProvider")
  return context
}
