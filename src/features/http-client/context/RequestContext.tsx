"use client"

import * as React from "react"
import { HttpRequest, HttpResponse, HttpMethod } from "../types"
import { executeHttpRequest } from "../actions/execute-request"
import { getDemoStatus, verifyDemoPassword, lockDemoSession } from "../actions/demo-mode"
import { useStorageContext } from "./StorageContext"

interface RequestContextValue {
  request: HttpRequest
  response: HttpResponse | null
  isLoading: boolean
  isDemo: boolean
  isUnlocked: boolean
  setRequest: React.Dispatch<React.SetStateAction<HttpRequest>>
  execute: () => Promise<void>
  unlockDemo: (password: string) => Promise<{ success: boolean; error?: string }>
  lockDemo: () => Promise<void>
  openUnlockDialog: () => void
  unlockDialogRef: React.RefObject<HTMLDialogElement | null>
}

const defaultRequest: HttpRequest = {
  id: "default-req",
  method: "GET",
  url: "",
  queryParams: [],
  headers: [],
  auth: { type: "none" },
  body: { type: "none" }
}

const RequestContext = React.createContext<RequestContextValue | undefined>(undefined)

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = React.useState<HttpRequest>(defaultRequest)
  const [response, setResponse] = React.useState<HttpResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isDemo, setIsDemo] = React.useState(false)
  const [isUnlocked, setIsUnlocked] = React.useState(true)
  const unlockDialogRef = React.useRef<HTMLDialogElement | null>(null)
  const { addToHistory } = useStorageContext()

  React.useEffect(() => {
    getDemoStatus().then(status => {
      setIsDemo(status.isDemo)
      setIsUnlocked(status.isUnlocked)
    }).catch(err => {
      console.error("Failed to load demo status", err)
    })
  }, [])

  const openUnlockDialog = () => {
    unlockDialogRef.current?.showModal()
  }

  const unlockDemo = async (password: string) => {
    const res = await verifyDemoPassword(password)
    if (res.success) {
      setIsUnlocked(true)
    }
    return res
  }

  const lockDemo = async () => {
    await lockDemoSession()
    setIsUnlocked(false)
  }

  const execute = async () => {
    if (!request.url) return

    setIsLoading(true)
    try {
      const result = await executeHttpRequest(request)
      setResponse(result)
      addToHistory(request, result)
    } catch (error) {
      console.error("Failed to execute request", error)
      setResponse({
        status: 0,
        statusText: "Client Error",
        headers: {},
        data: "",
        executionTimeMs: 0,
        sizeBytes: 0,
        isError: true,
        errorDetails: String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RequestContext.Provider value={{
      request,
      response,
      isLoading,
      isDemo,
      isUnlocked,
      setRequest,
      execute,
      unlockDemo,
      lockDemo,
      openUnlockDialog,
      unlockDialogRef
    }}>
      {children}
    </RequestContext.Provider>
  )
}

export function useRequestContext() {
  const context = React.useContext(RequestContext)
  if (!context) {
    throw new Error("useRequestContext must be used within a RequestProvider")
  }
  return context
}

