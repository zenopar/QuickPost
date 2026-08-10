import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-neutral-800 text-neutral-100 border-neutral-700",
        success: "bg-green-900/30 text-green-400 border-green-900/50",
        warning: "bg-yellow-900/30 text-yellow-400 border-yellow-900/50",
        error: "bg-red-900/30 text-red-400 border-red-900/50",
        info: "bg-blue-900/30 text-blue-400 border-blue-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
