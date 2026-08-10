"use client"
import * as React from "react"
import { Folder, History, Plus, Edit2, Trash2, Menu, X } from "lucide-react"
import { Button } from "@/shared/components/ui/Button"
import { useStorageContext } from "../context/StorageContext"
import { useRequestContext } from "../context/RequestContext"
import { cn } from "@/shared/utils/cn"

export function Sidebar() {
  const { collections, history, addCollection, deleteCollection, renameCollection, deleteRequestFromCollection } = useStorageContext()
  const { setRequest } = useRequestContext()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleAddCollection = () => {
    const name = window.prompt("Enter collection name:")
    if (name) {
      addCollection(name)
    }
  }

  const handleSelectRequest = (req: any) => {
    setRequest(req)
    setIsOpen(false) // Close drawer on mobile after selection
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
        <div className="font-bold text-lg text-emerald-500">QuickPost</div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Menu size={20} />
        </Button>
      </div>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out md:relative md:w-64 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-neutral-200">Collections</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-400 hover:text-neutral-100" onClick={handleAddCollection}>
              <Plus size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-400 hover:text-neutral-100 md:hidden" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </Button>
          </div>
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
                      onClick={() => handleSelectRequest(req)}
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
                  onClick={() => handleSelectRequest(item.request)}
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
    </>
  )
}
