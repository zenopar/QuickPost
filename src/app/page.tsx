import { Sidebar } from "@/features/http-client/components/Sidebar"
import { Workspace } from "@/features/http-client/components/Workspace"
import { Providers } from "@/features/http-client/context/Providers"

export default function Home() {
  return (
    <Providers>
      <main className="flex h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
        <Sidebar />
        <Workspace />
      </main>
    </Providers>
  );
}
