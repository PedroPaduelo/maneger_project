import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "relative overflow-hidden bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 text-white hover:from-blue-500/30 hover:to-purple-500/30 hover:border-white/30 hover:shadow-lg hover:shadow-white/20 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:z-[-1]",
        destructive: "relative overflow-hidden bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/20 text-white hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/20 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:z-[-1]",
        outline: "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm",
        secondary: "bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:border-white/20 backdrop-blur-sm",
        ghost: "text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm",
        link: "text-white/70 underline-offset-4 hover:underline hover:text-white",
        glass: "relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-white hover:from-white/20 hover:to-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:to-white/10 before:z-[-1] after:absolute after:inset-0 after:rounded-xl after:shadow-lg after:shadow-black/20 after:z-[-1]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-lg px-8",
        icon: "h-10 w-10",
        xl: "h-14 rounded-xl px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton, glassButtonVariants }