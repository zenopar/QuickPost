import * as React from "react"
import { Folder, History, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/Button"

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="font-semibold text-neutral-200">Collections</h2>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-400 hover:text-neutral-100">
          <Plus size={16} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Placeholder Items */}
        <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-1.5 h-auto text-neutral-400 hover:text-neutral-200 font-normal">
          <Folder size={16} />
          <span>My Workspace</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-1.5 h-auto text-neutral-400 hover:text-neutral-200 font-normal">
          <History size={16} />
          <span>History</span>
        </Button>
      </div>
    </aside>
  )
}
