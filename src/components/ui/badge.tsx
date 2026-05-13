import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default:
      "border-transparent bg-neutral-50 text-neutral-900 hover:bg-neutral-200",
    secondary:
      "border-transparent bg-neutral-800 text-neutral-50 hover:bg-neutral-700",
    destructive:
      "border-transparent bg-red-900 text-neutral-50 hover:bg-red-800",
    outline: "text-neutral-50",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-neutral-800 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
