"use client"

import { RequestProvider } from "./RequestContext"
import { StorageProvider } from "./StorageContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StorageProvider>
      <RequestProvider>
        {children}
      </RequestProvider>
    </StorageProvider>
  )
}
