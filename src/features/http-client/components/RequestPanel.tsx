"use client"
import { Input } from "@/shared/components/ui/Input"
import { Select } from "@/shared/components/ui/Select"
import { Button } from "@/shared/components/ui/Button"
import { Send, Loader2 } from "lucide-react"
import { useRequestContext } from "../context/RequestContext"
import { HttpMethod } from "../types"

export function RequestPanel() {
  const { request, setRequest, execute, isLoading } = useRequestContext()

  return (
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
          placeholder="Enter request URL"
          value={request.url}
          onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') execute();
          }}
        />
      </div>
      <Button className="gap-2" onClick={execute} disabled={isLoading}>
        <span>Send</span>
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </Button>
    </div>
  )
}
