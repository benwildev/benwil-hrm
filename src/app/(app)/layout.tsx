import type { ReactNode } from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { TopHeader } from "@/components/layout/top-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AuthGuard } from "@/features/auth/auth-guard"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopHeader />
          <div className="flex flex-1 flex-col min-w-0 w-full max-w-full">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
