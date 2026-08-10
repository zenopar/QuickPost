import { Sidebar } from "@/features/http-client/components/Sidebar"
import { Workspace } from "@/features/http-client/components/Workspace"

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
      <Sidebar />
      <Workspace />
    </main>
  );
}
