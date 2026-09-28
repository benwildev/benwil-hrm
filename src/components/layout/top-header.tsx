"use client"

import { HelpCircleIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { GlobalSearch } from "@/components/layout/global-search"
import { NotificationsMenu } from "@/components/layout/notifications-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { mainNav, secondaryNav } from "@/lib/nav-config"

const orgNav = [
  { title: "Departments", href: "/departments" },
  { title: "Teams", href: "/teams" },
  { title: "Designations", href: "/designations" },
  { title: "Organization", href: "/employees/organization" },
]

const allNav = [...mainNav, ...secondaryNav, ...orgNav]

export function TopHeader() {
  const pathname = usePathname()
  const activeItem = allNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full min-w-0 shrink-0 items-center justify-between gap-2.5 sm:gap-3 border-b border-border bg-background/95 px-3 sm:px-4 md:px-6 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium text-foreground">
                {activeItem?.title ?? "Dashboard"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <span className="text-sm font-semibold text-foreground sm:hidden truncate max-w-[140px]">
          {activeItem?.title ?? "Dashboard"}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <GlobalSearch />
        <NotificationsMenu />
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/help" />}
          aria-label="Help"
        >
          <HelpCircleIcon />
        </Button>
      </div>
    </header>
  )
}
