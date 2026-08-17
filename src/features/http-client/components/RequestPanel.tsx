"use client"
import * as React from "react"
import { Input } from "@/shared/components/ui/Input"
import { Select } from "@/shared/components/ui/Select"
import { Button } from "@/shared/components/ui/Button"
import { Send, Loader2, BookmarkPlus, Lock, Unlock } from "lucide-react"
import { useRequestContext } from "../context/RequestContext"
import { useStorageContext } from "../context/StorageContext"
import { HttpMethod } from "../types"
import { SaveRequestDialog } from "./SaveRequestDialog"
import { DemoUnlockDialog } from "./DemoUnlockDialog"

export function RequestPanel() {
  const {
    request,
    setRequest,
    execute,
    isLoading,
    isDemo,
    isUnlocked,
    openUnlockDialog,
    lockDemo,
    unlockDialogRef
  } = useRequestContext()
  const { collections, addCollection } = useStorageContext()
  const saveDialogRef = React.useRef<HTMLDialogElement>(null)

  const handleOpenSaveDialog = () => {
    if (collections.length === 0) {
      addCollection("My Workspace")
    }
    saveDialogRef.current?.showModal()
  }

  return (
    <>
      <div className="p-3 md:p-4 border-b border-neutral-800 flex flex-col md:flex-row gap-2 bg-neutral-900/50">
        <div className="flex gap-2 w-full md:w-auto md:flex-1">
          <div className="w-28 md:w-32 shrink-0">
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
          
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              placeholder={isDemo && !isUnlocked ? "https://echo.free.beeceptor.com" : "https://api.example.com/v1/users"}
              value={request.url}
              onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
              className="w-full font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
          {isDemo && (
            !isUnlocked ? (
              <Button
                variant="outline"
                onClick={openUnlockDialog}
                className="gap-2 flex-1 md:flex-none text-neutral-300"
                title="Demo Mode: Requests restricted to https://echo.free.beeceptor.com. Click to enter password."
              >
                <Lock size={15} className="text-amber-500" />
                Unlock
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={lockDemo}
                className="gap-2 flex-1 md:flex-none text-neutral-400 hover:text-rose-400"
                title="Full access unlocked. Click to re-lock demo mode."
              >
                <Unlock size={15} className="text-emerald-500" />
                Unlocked
              </Button>
            )
          )}

          <Button variant="outline" onClick={handleOpenSaveDialog} className="gap-2 flex-1 md:flex-none">
            <BookmarkPlus size={16} />
            Save
          </Button>

          <Button onClick={execute} disabled={isLoading} className="gap-2 flex-1 md:w-28">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isLoading ? "Sending" : "Send"}
          </Button>
        </div>
      </div>

      <SaveRequestDialog dialogRef={saveDialogRef} />
      <DemoUnlockDialog dialogRef={unlockDialogRef} />
    </>
  )
}


