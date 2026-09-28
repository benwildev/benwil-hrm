"use client"

import {
  FolderTreeIcon,
  LayersIcon,
  NetworkIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface OrgNavProps {
  counts?: {
    employees?: number
    departments?: number
    teams?: number
    designations?: number
  }
}

export function OrgNav({ counts }: OrgNavProps) {
  const pathname = usePathname()

  const tabs = [
    {
      label: "Employees",
      href: "/employees",
      icon: UsersIcon,
      count: counts?.employees,
      exact: true,
    },
    {
      label: "Departments",
      href: "/departments",
      icon: FolderTreeIcon,
      count: counts?.departments,
      exact: false,
    },
    {
      label: "Teams",
      href: "/teams",
      icon: LayersIcon,
      count: counts?.teams,
      exact: false,
    },
    {
      label: "Designations",
      href: "/designations",
      icon: TagIcon,
      count: counts?.designations,
      exact: false,
    },
    {
      label: "Org Structure",
      href: "/employees/organization",
      icon: NetworkIcon,
      exact: true,
    },
  ]

  const isActive = (tabHref: string, exact: boolean) => {
    if (exact) {
      return pathname === tabHref
    }
    return pathname === tabHref || pathname.startsWith(`${tabHref}/`)
  }

  return (
    <div className="flex w-full min-w-0 items-center gap-1 overflow-x-auto border-b border-border/80 pb-2 text-xs font-medium scroll-smooth scrollbar-none">
      {tabs.map((tab) => {
        const active = isActive(tab.href, tab.exact)
        const Icon = tab.icon

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all select-none whitespace-nowrap",
              active
                ? "bg-zinc-900 font-semibold text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[10px] font-mono",
                  active
                    ? "bg-white/20 text-white dark:bg-zinc-800 dark:text-zinc-200"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
