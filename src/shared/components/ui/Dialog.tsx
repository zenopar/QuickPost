import * as React from "react"
import { cn } from "@/shared/utils/cn"

export interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {}

const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <dialog
        ref={ref}
        className={cn(
          "m-auto backdrop:bg-black/60 bg-neutral-950 border border-neutral-800 p-0 rounded-lg shadow-2xl text-neutral-100 max-w-md w-full",
          className
        )}
        {...props}
      >
        {children}
      </dialog>
    )
  }
)
Dialog.displayName = "Dialog"

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 border-b border-neutral-800", className)}
      {...props}
    />
  )
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 space-y-4", className)} {...props} />
  )
)
DialogContent.displayName = "DialogContent"

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 border-t border-neutral-800 flex justify-end gap-2 bg-neutral-900/50", className)}
      {...props}
    />
  )
)
DialogFooter.displayName = "DialogFooter"

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter }
