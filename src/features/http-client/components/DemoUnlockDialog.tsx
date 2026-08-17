"use client"
import * as React from "react"
import { Input } from "@/shared/components/ui/Input"
import { Button } from "@/shared/components/ui/Button"
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/shared/components/ui/Dialog"
import { useRequestContext } from "../context/RequestContext"
import { Loader2 } from "lucide-react"

interface DemoUnlockDialogProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>
}

export function DemoUnlockDialog({ dialogRef }: DemoUnlockDialogProps) {
  const { unlockDemo } = useRequestContext()
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await unlockDemo(password)
      if (result.success) {
        setPassword("")
        dialogRef.current?.close()
      } else {
        setErrorMessage(result.error || "Incorrect password.")
      }
    } catch {
      setErrorMessage("Failed to verify password.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setPassword("")
    setErrorMessage(null)
    dialogRef.current?.close()
  }

  return (
    <Dialog ref={dialogRef}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Unlock Full Access</DialogTitle>
        </DialogHeader>

        <DialogContent>
          <p className="text-xs text-neutral-400">
            Requests are restricted to <span className="font-mono text-neutral-300">https://echo.free.beeceptor.com</span>. Enter password for full access.
          </p>

          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              autoFocus
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400">{errorMessage}</p>
          )}
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!password.trim() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isSubmitting ? "Unlocking..." : "Unlock"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

