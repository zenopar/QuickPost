"use client"
import * as React from "react"
import { Input } from "@/shared/components/ui/Input"
import { Select } from "@/shared/components/ui/Select"
import { Button } from "@/shared/components/ui/Button"
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/shared/components/ui/Dialog"
import { useRequestContext } from "../context/RequestContext"
import { useStorageContext } from "../context/StorageContext"

interface SaveRequestDialogProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>
}

export function SaveRequestDialog({ dialogRef }: SaveRequestDialogProps) {
  const { request } = useRequestContext()
  const { collections, saveToCollection } = useStorageContext()
  
  const [saveName, setSaveName] = React.useState(request.name || "New Request")
  const [selectedCollectionId, setSelectedCollectionId] = React.useState("")

  // Keep state synced when dialog opens (which we can't easily detect with native dialogs 
  // without a custom hook, so we rely on parent to trigger or we just use effects)
  React.useEffect(() => {
    setSaveName(request.name || request.url || "New Request")
  }, [request.name, request.url])

  React.useEffect(() => {
    if (collections.length > 0 && !selectedCollectionId) {
      setSelectedCollectionId(collections[0].id)
    }
  }, [collections, selectedCollectionId])

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetId = selectedCollectionId || collections[0]?.id
    if (targetId && saveName.trim()) {
      saveToCollection(targetId, { ...request, name: saveName.trim() })
      dialogRef.current?.close()
    }
  }

  return (
    <Dialog ref={dialogRef}>
      <form onSubmit={handleSaveSubmit} className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Save Request</DialogTitle>
        </DialogHeader>
        
        <DialogContent>
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Request Name</label>
            <Input 
              value={saveName} 
              onChange={e => setSaveName(e.target.value)} 
              placeholder="e.g. Get User Profile"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-1.5 block">Save to Collection</label>
            <Select
              value={selectedCollectionId}
              onChange={setSelectedCollectionId}
              options={collections.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>
        </DialogContent>
        
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => dialogRef.current?.close()}>Cancel</Button>
          <Button type="submit" disabled={!selectedCollectionId || !saveName.trim()}>Save to Collection</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
