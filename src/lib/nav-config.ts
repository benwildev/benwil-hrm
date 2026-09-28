import {
  BarChart3Icon,
  CalendarClockIcon,
  CalendarCheckIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"

import type { NavItem } from "@/types/nav"

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Employees", href: "/employees", icon: UsersIcon, permission: "employees.view" },
  { title: "Attendance", href: "/attendance", icon: CalendarCheckIcon, permission: "attendance.view" },
  { title: "Leave", href: "/leave", icon: CalendarClockIcon, permission: "leave.view" },
  { title: "Payroll", href: "/payroll", icon: WalletIcon, permission: "payroll.view" },
  { title: "Reports", href: "/reports", icon: BarChart3Icon, permission: "reports.view" },
]

export const secondaryNav: NavItem[] = [
  { title: "Settings", href: "/settings", icon: SettingsIcon },
  { title: "Help", href: "/help", icon: HelpCircleIcon },
]
