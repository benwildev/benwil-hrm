"use client"

import { Building2Icon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { mainNav, secondaryNav } from "@/lib/nav-config"

import { useAuthorization } from "@/lib/auth/authorization"

export function AppSidebar() {
  const pathname = usePathname()
  const { hasPermission, isAdmin } = useAuthorization()

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const canViewNavItem = (item: (typeof mainNav)[0]) => {
    if (isAdmin) return true
    if (!item.permission) return true
    if (item.permission === "attendance.view") {
      return hasPermission("attendance.view") || hasPermission("attendance.view_own") || hasPermission("attendance.view_team")
    }
    if (item.permission === "leave.view") {
      return hasPermission("leave.view") || hasPermission("leave.view_own") || hasPermission("leave.view_team")
    }
    if (item.permission === "payroll.view") {
      return hasPermission("payroll.view") || hasPermission("payroll.view_own")
    }
    return hasPermission(item.permission)
  }

  const visibleMainNav = mainNav.filter(canViewNavItem)

  return (
    <Sidebar collapsible="icon" className="border-r border-border/80">
      <SidebarHeader className="border-b border-border/40 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />} className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-xs border border-zinc-800 dark:bg-zinc-100 dark:text-zinc-950">
                <Building2Icon className="size-4" />
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate text-sm font-bold tracking-tight text-foreground">
                  Benwil HRM
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Single-Tenant HQ
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleMainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isItemActive(item.href)}
                    tooltip={item.title}
                    className="data-active:bg-zinc-100 data-active:font-semibold data-active:text-zinc-950 hover:bg-zinc-50 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-100 rounded-lg transition-colors text-xs font-medium"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                    {item.title === "Leave" && (
                      <span className="ml-auto flex items-center justify-center rounded-full bg-amber-50 border border-amber-200/70 px-1.5 py-0.2 text-[10px] font-mono font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        3
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 pt-2">
        <SidebarMenu className="gap-1 mb-1">
          {secondaryNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={isItemActive(item.href)}
                tooltip={item.title}
                className="data-active:bg-zinc-100 data-active:font-semibold data-active:text-zinc-950 hover:bg-zinc-50 dark:data-active:bg-zinc-800 dark:data-active:text-zinc-100 rounded-lg transition-colors text-xs font-medium"
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
