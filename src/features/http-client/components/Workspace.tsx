import { RequestPanel } from "./RequestPanel"
import { RequestEditor } from "./RequestEditor"
import { ResponseViewer } from "./ResponseViewer"
import { RequestProvider } from "../context/RequestContext"

export function Workspace() {
  return (
    <RequestProvider>
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-950 text-neutral-100 p-6 pl-0">
        <RequestPanel />
        {/* We use flex-1 for the split view area to take remaining space, and split it vertically */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <RequestEditor />
          </div>
          <div className="h-2 bg-neutral-900 cursor-row-resize border-y border-neutral-800 hover:bg-neutral-700 transition-colors" />
          <div className="flex-1 min-h-0 flex flex-col">
            <ResponseViewer />
          </div>
        </div>
      </div>
    </RequestProvider>
  )
}
