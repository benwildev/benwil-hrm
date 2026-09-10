import type { PermissionKey } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions";
import {
  LayoutDashboardIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  WalletIcon,
  SettingsIcon,
  ShieldIcon,
  Building2Icon,
  NetworkIcon,
  IdCardIcon,
  ClockAlertIcon,
  CalendarOffIcon,
  ListChecksIcon,
  BadgeDollarSignIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboardIcon;
  permission?: PermissionKey;
};

export const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Employees", url: "/employees", icon: UsersIcon, permission: PERMISSIONS.EMPLOYEES_VIEW },
  { title: "Attendance", url: "/attendance", icon: ClockIcon },
  { title: "Leave", url: "/leave", icon: CalendarDaysIcon },
  { title: "Payroll", url: "/payroll", icon: WalletIcon },
];

export const settingsNav: NavItem[] = [
  { title: "Company", url: "/settings/company", icon: Building2Icon, permission: PERMISSIONS.COMPANY_MANAGE },
  { title: "Roles & Permissions", url: "/settings/roles", icon: ShieldIcon, permission: PERMISSIONS.ROLES_MANAGE },
  { title: "Departments", url: "/settings/departments", icon: NetworkIcon, permission: PERMISSIONS.EMPLOYEES_MANAGE },
  { title: "Designations", url: "/settings/designations", icon: IdCardIcon, permission: PERMISSIONS.EMPLOYEES_MANAGE },
  { title: "Shifts", url: "/settings/shifts", icon: ClockAlertIcon, permission: PERMISSIONS.EMPLOYEES_MANAGE },
  { title: "Holidays", url: "/settings/holidays", icon: CalendarOffIcon, permission: PERMISSIONS.ATTENDANCE_POLICY_MANAGE },
  { title: "Leave types", url: "/settings/leave-types", icon: ListChecksIcon, permission: PERMISSIONS.LEAVE_TYPES_MANAGE },
  { title: "Salary components", url: "/settings/salary-components", icon: BadgeDollarSignIcon, permission: PERMISSIONS.PAYROLL_MANAGE },
];

export const settingsGroupIcon = SettingsIcon;
