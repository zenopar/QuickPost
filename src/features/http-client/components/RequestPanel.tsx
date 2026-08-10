import * as React from "react"
import { Input } from "@/shared/components/ui/Input"
import { Select } from "@/shared/components/ui/Select"
import { Button } from "@/shared/components/ui/Button"
import { Send } from "lucide-react"

export function RequestPanel() {
  return (
    <div className="p-4 border-b border-neutral-800 flex gap-2 items-center bg-neutral-900/50">
      <div className="w-32">
        <Select 
          defaultValue="GET" 
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
        <Input placeholder="Enter request URL" defaultValue="https://api.example.com/v1/users" />
      </div>
      <Button className="gap-2">
        <span>Send</span>
        <Send size={16} />
      </Button>
    </div>
  )
}
