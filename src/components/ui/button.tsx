import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"
import type {ButtonHTMLAttributes} from "react"
import {cn} from "@/lib/utils"

const buttonVariants = cva(
  "travel-focus inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-primary/92 hover:shadow-lift",
        accent: "bg-accent text-accent-foreground shadow-soft hover:-translate-y-0.5 hover:bg-accent/92 hover:shadow-lift",
        gold: "bg-gold text-foreground shadow-soft hover:-translate-y-0.5 hover:bg-gold/90 hover:shadow-lift",
        ghost: "hover:bg-muted hover:text-foreground",
        outline: "border border-border bg-card/80 hover:border-primary/30 hover:bg-muted",
        subtle: "bg-muted text-foreground hover:bg-muted/75",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({className, variant, size, asChild = false, ...props}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({variant, size, className}))} {...props} />
}
