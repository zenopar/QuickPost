import { Sidebar } from "@/features/http-client/components/Sidebar"
import { Code2 } from "lucide-react"
import { Workspace } from "@/features/http-client/components/Workspace"
import { Providers } from "@/features/http-client/context/Providers"

export default function Home() {
  return (
    <Providers>
      <main className="relative flex h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100 flex-col md:flex-row">
        <Sidebar />
        <Workspace />
        <a 
          href="https://github.com/zenopar/QuickPost" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute bottom-6 right-6 flex items-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors text-sm bg-neutral-950/80 px-3 py-1.5 rounded-full backdrop-blur border border-neutral-800 shadow-sm z-50"
        >
          <Code2 className="w-4 h-4" />
          Open-source project
        </a>
      </main>
    </Providers>
  );
}
