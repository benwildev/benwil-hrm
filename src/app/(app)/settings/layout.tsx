"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BellIcon,
  Building2Icon,
  CalendarCheckIcon,
  CalendarClockIcon,
  FingerprintIcon,
  ShieldCheckIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react"

import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"

interface SettingsNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  badge?: string
}

const SETTINGS_NAV: { group: string; items: SettingsNavItem[] }[] = [
  {
    group: "Core Organization",
    items: [
      {
        title: "Company Profile",
        href: "/settings/company",
        icon: Building2Icon,
        active: true,
      },
      {
        title: "Work Schedule",
        href: "/settings/work-schedule",
        icon: CalendarClockIcon,
        active: true,
      },
      {
        title: "Roles & Permissions",
        href: "/settings/roles",
        icon: ShieldCheckIcon,
        active: true,
      },
    ],
  },
  {
    group: "Personal & Security",
    items: [
      {
        title: "Account & Security",
        href: "/settings/account",
        icon: UserIcon,
        active: true,
      },
    ],
  },
  {
    group: "Future Extensions (Coming Soon)",
    items: [
      {
        title: "Attendance Policy",
        href: "#",
        icon: CalendarCheckIcon,
        badge: "Future",
        active: false,
      },
      {
        title: "Leave Policy",
        href: "#",
        icon: CalendarClockIcon,
        badge: "Future",
        active: false,
      },
      {
        title: "Payroll Config",
        href: "#",
        icon: WalletIcon,
        badge: "Future",
        active: false,
      },
      {
        title: "Biometric Devices",
        href: "#",
        icon: FingerprintIcon,
        badge: "Future",
        active: false,
      },
      {
        title: "Notifications",
        href: "#",
        icon: BellIcon,
        badge: "Future",
        active: false,
      },
    ],
  },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage workspace organization, working schedules, and account preferences."
      />

      <div className="flex flex-col md:flex-row gap-8 items-start pt-2">
        {/* Settings Secondary Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          {SETTINGS_NAV.map((section) => (
            <div key={section.group} className="space-y-1.5">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                {section.group}
              </span>
              <nav className="flex flex-col space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isCurrent = pathname === item.href

                  if (!item.active) {
                    return (
                      <div
                        key={item.title}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/60 cursor-not-allowed select-none"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="size-3.5" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9.5px] font-medium bg-zinc-100 dark:bg-zinc-800 text-muted-foreground px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        isCurrent
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </aside>

        {/* Main Settings Content Area */}
        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
    </PageContainer>
  )
}
