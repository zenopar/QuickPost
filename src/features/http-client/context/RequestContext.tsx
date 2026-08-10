"use client"

import * as React from "react"
import { HttpRequest, HttpResponse, HttpMethod } from "../types"
import { executeHttpRequest } from "../actions/execute-request"

interface RequestContextValue {
  request: HttpRequest
  response: HttpResponse | null
  isLoading: boolean
  setRequest: React.Dispatch<React.SetStateAction<HttpRequest>>
  execute: () => Promise<void>
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

  const execute = async () => {
    setIsLoading(true)
    try {
      const result = await executeHttpRequest(request)
      setResponse(result)
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
    <RequestContext.Provider value={{ request, response, isLoading, setRequest, execute }}>
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
