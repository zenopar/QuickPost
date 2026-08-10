"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/Tabs"

export function RequestEditor() {
  const [activeTab, setActiveTab] = React.useState("params")

  return (
    <div className="flex-1 flex flex-col min-h-0 border-b border-neutral-800 bg-neutral-950">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b border-neutral-800">
          <TabsList className="bg-transparent gap-2">
            <TabsTrigger value="params" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Params</TabsTrigger>
            <TabsTrigger value="headers" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Headers (7)</TabsTrigger>
            <TabsTrigger value="body" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Body</TabsTrigger>
            <TabsTrigger value="auth" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 text-neutral-400">Auth</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <TabsContent value="params" className="h-full mt-0">
            <div className="text-sm text-neutral-500 italic">Query parameters will appear here.</div>
          </TabsContent>
          <TabsContent value="headers" className="h-full mt-0">
            <div className="text-sm text-neutral-500 italic">Headers configuration.</div>
          </TabsContent>
          <TabsContent value="body" className="h-full mt-0">
            <div className="h-full rounded-md border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-300">
              {`{\n  "message": "Hello World"\n}`}
            </div>
          </TabsContent>
          <TabsContent value="auth" className="h-full mt-0">
            <div className="text-sm text-neutral-500 italic">Authorization settings.</div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
