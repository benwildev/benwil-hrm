import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex flex-1 flex-col min-w-0 w-full max-w-full gap-5 sm:gap-6 p-3.5 sm:p-5 md:p-6 lg:p-8", className)}>
      {children}
    </div>
  )
}
