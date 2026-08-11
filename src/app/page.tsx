import { Sidebar } from "@/features/http-client/components/Sidebar"
import { Workspace } from "@/features/http-client/components/Workspace"
import { Providers } from "@/features/http-client/context/Providers"

export const dynamic = 'force-dynamic'

export default function Home() {
  const privacyUrl = process.env.PRIVACY_URL;

  return (
    <Providers>
      <main className="relative flex h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100 flex-col md:flex-row">
        <Sidebar privacyUrl={privacyUrl} />
        <Workspace />
      </main>
    </Providers>
  );
}
