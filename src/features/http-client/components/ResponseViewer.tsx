"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/Tabs"
import { Badge } from "@/shared/components/ui/Badge"
import { Button } from "@/shared/components/ui/Button"
import { useRequestContext } from "../context/RequestContext"
import { Loader2 } from "lucide-react"

export function ResponseViewer() {
  const [activeTab, setActiveTab] = React.useState("body")
  const { response, isLoading, openUnlockDialog, isDemo, isUnlocked } = useRequestContext()

  const getStatusVariant = (status: number) => {
    if (status >= 200 && status < 300) return "success"
    if (status >= 400 && status < 500) return "warning"
    if (status >= 500 || status === 0) return "error"
    return "info"
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  const formatJSON = (data: string) => {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-neutral-950 items-center justify-center text-neutral-500 gap-3">
        <Loader2 className="animate-spin" size={24} />
        <span>Sending request...</span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-neutral-950 items-center justify-center text-neutral-500">
        Enter a URL and click Send to see the response.
      </div>
    )
  }

  const headerEntries = Object.entries(response.headers)

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-neutral-800 gap-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-400">Response</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-neutral-500">
              Status: <Badge variant={getStatusVariant(response.status)} className="ml-1">{response.status} {response.statusText}</Badge>
            </span>
            <span className="text-neutral-500">Time: <span className="text-green-400 font-mono">{response.executionTimeMs} ms</span></span>
            <span className="text-neutral-500">Size: <span className="text-neutral-300 font-mono">{formatSize(response.sizeBytes)}</span></span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b border-neutral-800">
          <TabsList className="bg-transparent gap-2">
            <TabsTrigger value="body" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Body</TabsTrigger>
            <TabsTrigger value="headers" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Headers ({headerEntries.length})</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <TabsContent value="body" className="h-full mt-0">
            {response.errorDetails && !response.data ? (
              <div className="h-full rounded-md border border-neutral-800 bg-neutral-900 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap flex flex-col justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-200 mb-2">{response.statusText}</div>
                  <div className="text-neutral-400">{response.errorDetails}</div>
                </div>
                {isDemo && !isUnlocked && response.statusText.includes('Demo') && (
                  <div className="pt-4 mt-4 border-t border-neutral-800 flex justify-start">
                    <Button
                      size="sm"
                      onClick={openUnlockDialog}
                    >
                      Unlock Full Access
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full rounded-md border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-300 overflow-auto whitespace-pre-wrap break-all">
                {formatJSON(response.data) || <span className="italic text-neutral-600">No content</span>}
              </div>
            )}
          </TabsContent>
          <TabsContent value="headers" className="h-full mt-0">
            <div className="rounded-md border border-neutral-800 bg-neutral-900 overflow-hidden">
              <table className="w-full text-sm text-left font-mono">
                <tbody>
                  {headerEntries.map(([key, value]) => (
                    <tr key={key} className="border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50">
                      <td className="px-4 py-2 font-medium text-neutral-300 w-1/3 align-top">{key}</td>
                      <td className="px-4 py-2 text-neutral-400 break-all">{value}</td>
                    </tr>
                  ))}
                  {headerEntries.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-neutral-500 italic">No headers received</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
