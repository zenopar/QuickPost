"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/Tabs"
import { Badge } from "@/shared/components/ui/Badge"

export function ResponseViewer() {
  const [activeTab, setActiveTab] = React.useState("body")

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-400">Response</span>
          <div className="flex items-center gap-3">
            <span className="text-neutral-500">Status: <Badge variant="success" className="ml-1">200 OK</Badge></span>
            <span className="text-neutral-500">Time: <span className="text-green-400 font-mono">124 ms</span></span>
            <span className="text-neutral-500">Size: <span className="text-neutral-300 font-mono">1.2 KB</span></span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b border-neutral-800">
          <TabsList className="bg-transparent gap-2">
            <TabsTrigger value="body" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Body</TabsTrigger>
            <TabsTrigger value="headers" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Headers (12)</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <TabsContent value="body" className="h-full mt-0">
            <div className="h-full rounded-md border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-300 overflow-auto">
              <pre>{JSON.stringify([
                { id: 1, name: "Leanne Graham", username: "Bret" },
                { id: 2, name: "Ervin Howell", username: "Antonette" }
              ], null, 2)}</pre>
            </div>
          </TabsContent>
          <TabsContent value="headers" className="h-full mt-0">
            <div className="text-sm text-neutral-500 italic">Response headers will appear here.</div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
