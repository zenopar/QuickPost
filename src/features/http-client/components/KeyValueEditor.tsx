"use client"
import { KeyValuePair } from "../types"
import { Trash2 } from "lucide-react"
import { Button } from "@/shared/components/ui/Button"
import { Input } from "@/shared/components/ui/Input"

interface KeyValueEditorProps {
  items: KeyValuePair[]
  onChange: (items: KeyValuePair[]) => void
  placeholderKey?: string
  placeholderValue?: string
}

export function KeyValueEditor({
  items,
  onChange,
  placeholderKey = "Key",
  placeholderValue = "Value"
}: KeyValueEditorProps) {
  // Ensure we always have at least one empty item at the end
  const displayItems = [...items]
  const lastItem = displayItems[displayItems.length - 1]

  if (!lastItem || lastItem.key !== "" || lastItem.value !== "") {
    displayItems.push({
      id: crypto.randomUUID(),
      key: "",
      value: "",
      enabled: true,
      description: ""
    })
  }

  const updateItem = (index: number, field: keyof KeyValuePair, value: any) => {
    const newItems = [...displayItems]
    newItems[index] = { ...newItems[index], [field]: value }

    // Only pass non-empty items back to parent to avoid polluting state with the placeholder
    // We filter out items where key and value are both empty.
    const filtered = newItems.filter(item => item.key.trim() !== "" || item.value.trim() !== "")
    onChange(filtered)
  }

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden border border-neutral-800 rounded-md bg-neutral-950">
      <div className="flex border-b border-neutral-800 bg-neutral-900 text-xs font-medium text-neutral-400">
        <div className="w-10 flex items-center justify-center border-r border-neutral-800 py-2"></div>
        <div className="flex-1 px-3 py-2 border-r border-neutral-800">Key</div>
        <div className="flex-1 px-3 py-2 border-r border-neutral-800">Value</div>
        <div className="flex-1 px-3 py-2 border-r border-neutral-800">Description</div>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayItems.map((item, index) => {
          const isEmptyRow = item.key === "" && item.value === "" && index === displayItems.length - 1;

          return (
            <div key={item.id} className="flex border-b border-neutral-800/50 group hover:bg-neutral-900/30 transition-colors">
              <div className="w-10 flex items-center justify-center border-r border-neutral-800/50">
                {!isEmptyRow && (
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) => updateItem(index, "enabled", e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-neutral-950 cursor-pointer"
                  />
                )}
              </div>
              <div className="flex-1 border-r border-neutral-800/50">
                <Input
                  type="text"
                  value={item.key}
                  onChange={(e) => updateItem(index, "key", e.target.value)}
                  placeholder={placeholderKey}
                  className="h-8 border-0 bg-transparent rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-neutral-700 focus-visible:ring-offset-0 placeholder:text-neutral-600 px-3"
                  spellCheck={false}
                />
              </div>
              <div className="flex-1 border-r border-neutral-800/50">
                <Input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateItem(index, "value", e.target.value)}
                  placeholder={placeholderValue}
                  className="h-8 border-0 bg-transparent rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-neutral-700 focus-visible:ring-offset-0 placeholder:text-neutral-600 px-3"
                  spellCheck={false}
                />
              </div>
              <div className="flex-1 border-r border-neutral-800/50">
                <Input
                  type="text"
                  value={item.description || ""}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Description"
                  className="h-8 border-0 bg-transparent rounded-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-neutral-700 focus-visible:ring-offset-0 placeholder:text-neutral-700 px-3 text-neutral-400"
                  spellCheck={false}
                />
              </div>
              <div className="w-10 flex items-center justify-center">
                {!isEmptyRow && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 text-neutral-600 hover:text-red-400 hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
