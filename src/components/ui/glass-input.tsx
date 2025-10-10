import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 backdrop-blur-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white disabled:cursor-not-allowed disabled:opacity-50 focus:border-white/40 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassInput.displayName = "GlassInput"

export { GlassInput }