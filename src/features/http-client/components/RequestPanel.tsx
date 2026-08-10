"use client"
import * as React from "react"
import { Input } from "@/shared/components/ui/Input"
import { Select } from "@/shared/components/ui/Select"
import { Button } from "@/shared/components/ui/Button"
import { Send, Loader2, BookmarkPlus } from "lucide-react"
import { useRequestContext } from "../context/RequestContext"
import { useStorageContext } from "../context/StorageContext"
import { HttpMethod } from "../types"
import { SaveRequestDialog } from "./SaveRequestDialog"

export function RequestPanel() {
  const { request, setRequest, execute, isLoading } = useRequestContext()
  const { collections, addCollection } = useStorageContext()
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  const handleOpenSaveDialog = () => {
    if (collections.length === 0) {
      addCollection("My Workspace")
    }
    dialogRef.current?.showModal()
  }

  return (
    <>
      <div className="p-4 border-b border-neutral-800 flex gap-2 items-center bg-neutral-900/50">
        <div className="w-32">
          <Select
            value={request.method}
            onChange={(val) => setRequest(prev => ({ ...prev, method: val as HttpMethod }))}
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
              { value: "PUT", label: "PUT" },
              { value: "PATCH", label: "PATCH" },
              { value: "DELETE", label: "DELETE" }
            ]}
          />
        </div>
        
        <div className="flex-1">
          <Input
            type="text"
            placeholder="https://api.example.com/v1/users"
            value={request.url}
            onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
            className="w-full font-mono text-sm"
          />
        </div>

        <Button variant="outline" onClick={handleOpenSaveDialog} className="gap-2 shrink-0">
          <BookmarkPlus size={16} />
          Save
        </Button>

        <Button onClick={execute} disabled={isLoading} className="gap-2 w-28 shrink-0">
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {isLoading ? "Sending" : "Send"}
        </Button>
      </div>

      <SaveRequestDialog dialogRef={dialogRef} />
    </>
  )
}
