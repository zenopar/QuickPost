"use client"
import { Folder, History, Plus, FileCode2, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/shared/components/ui/Button"
import { useStorageContext } from "../context/StorageContext"
import { useRequestContext } from "../context/RequestContext"

export function Sidebar() {
  const { collections, history, addCollection, deleteCollection, renameCollection, deleteRequestFromCollection } = useStorageContext()
  const { setRequest } = useRequestContext()

  const handleAddCollection = () => {
    const name = window.prompt("Enter collection name:")
    if (name) {
      addCollection(name)
    }
  }

  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-neutral-200">Collections</h2>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-400 hover:text-neutral-100" onClick={handleAddCollection}>
          <Plus size={16} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Collections */}
        <div className="space-y-1">
          {collections.length === 0 ? (
            <div className="px-3 py-2 text-xs text-neutral-500 italic">No collections yet.</div>
          ) : (
            collections.map(col => (
              <div key={col.id}>
                <div className="group flex items-center justify-between px-2 py-1.5 text-sm text-neutral-300 font-medium hover:bg-neutral-900 rounded-md">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Folder size={14} className="text-neutral-500 shrink-0" />
                    <span className="truncate">{col.name}</span>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-neutral-500 hover:text-neutral-200" onClick={() => {
                      const newName = window.prompt("Rename collection:", col.name)
                      if (newName) renameCollection(col.id, newName)
                    }}>
                      <Edit2 size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-neutral-500 hover:text-rose-400" onClick={() => {
                      if (window.confirm(`Delete collection "${col.name}"?`)) deleteCollection(col.id)
                    }}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                {col.requests.length === 0 && (
                  <div className="pl-8 py-1 text-xs text-neutral-600 italic">Empty</div>
                )}
                {col.requests.map(req => (
                  <div key={req.id} className="group flex items-center pr-2 w-full">
                    <Button 
                      variant="ghost" 
                      className="flex-1 justify-start gap-2 pl-8 pr-1 py-1 h-auto text-neutral-400 hover:text-neutral-200 font-normal text-xs min-w-0"
                      onClick={() => setRequest(req)}
                    >
                      <span className={`font-semibold shrink-0 ${
                        req.method === 'GET' ? 'text-emerald-500' : 
                        req.method === 'POST' ? 'text-amber-500' : 
                        req.method === 'PUT' ? 'text-blue-500' : 
                        req.method === 'DELETE' ? 'text-rose-500' : 'text-neutral-500'
                      }`}>
                        {req.method}
                      </span>
                      <span className="truncate">{req.name || req.url || "New Request"}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 shrink-0" 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Delete request "${req.name || req.url}"?`)) {
                          deleteRequestFromCollection(col.id, req.id)
                        }
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* History */}
        <div>
          <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <History size={14} />
            History
          </div>
          <div className="space-y-0.5 mt-1">
            {history.length === 0 ? (
              <div className="px-3 py-1 text-xs text-neutral-600 italic">No history yet.</div>
            ) : (
              history.map(item => (
                <Button 
                  key={item.id} 
                  variant="ghost" 
                  className="w-full justify-start gap-2 px-3 py-1.5 h-auto text-neutral-400 hover:text-neutral-200 font-normal text-xs"
                  onClick={() => setRequest(item.request)}
                >
                  <span className={`font-semibold w-10 text-left shrink-0 ${
                    item.request.method === 'GET' ? 'text-emerald-500' : 
                    item.request.method === 'POST' ? 'text-amber-500' : 
                    item.request.method === 'PUT' ? 'text-blue-500' : 
                    item.request.method === 'DELETE' ? 'text-rose-500' : 'text-neutral-500'
                  }`}>
                    {item.request.method}
                  </span>
                  <span className="truncate">{item.request.url}</span>
                </Button>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
