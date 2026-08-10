"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/Tabs"
import { useRequestContext } from "../context/RequestContext"
import { KeyValueEditor } from "./KeyValueEditor"
import { AuthEditor } from "./AuthEditor"

export function RequestEditor() {
  const [activeTab, setActiveTab] = React.useState("params")
  const { request, setRequest } = useRequestContext()

  const enabledParamsCount = request.queryParams.filter(p => p.enabled && p.key.trim() !== "").length
  const enabledHeadersCount = request.headers.filter(h => h.enabled && h.key.trim() !== "").length

  return (
    <div className="flex-1 flex flex-col min-h-0 border-b border-neutral-800 bg-neutral-950">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b border-neutral-800 shrink-0">
          <TabsList className="bg-transparent gap-2">
            <TabsTrigger value="params" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">
              Params {enabledParamsCount > 0 && <span className="ml-1.5 text-xs text-neutral-500">({enabledParamsCount})</span>}
            </TabsTrigger>
            <TabsTrigger value="headers" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">
              Headers {enabledHeadersCount > 0 && <span className="ml-1.5 text-xs text-neutral-500">({enabledHeadersCount})</span>}
            </TabsTrigger>
            <TabsTrigger value="body" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Body</TabsTrigger>
            <TabsTrigger value="auth" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">
              Auth {request.auth.type !== 'none' && <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <TabsContent value="params" className="h-full mt-0">
            <KeyValueEditor 
              items={request.queryParams} 
              onChange={(items) => setRequest(prev => ({ ...prev, queryParams: items }))} 
            />
          </TabsContent>
          
          <TabsContent value="headers" className="h-full mt-0">
            <KeyValueEditor 
              items={request.headers} 
              onChange={(items) => setRequest(prev => ({ ...prev, headers: items }))} 
            />
          </TabsContent>
          
          <TabsContent value="body" className="h-full mt-0 flex flex-col">
            <textarea
              className="flex-1 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-700"
              placeholder='{\n  "key": "value"\n}'
              value={request.body.rawContent || ""}
              onChange={(e) => {
                const newContent = e.target.value;
                setRequest(prev => ({
                  ...prev,
                  body: {
                    ...prev.body,
                    type: newContent ? "json" : "none",
                    rawContent: newContent
                  }
                }))
              }}
              spellCheck={false}
            />
          </TabsContent>
          
          <TabsContent value="auth" className="h-full mt-0">
            <AuthEditor 
              auth={request.auth} 
              onChange={(auth) => setRequest(prev => ({ ...prev, auth }))} 
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
