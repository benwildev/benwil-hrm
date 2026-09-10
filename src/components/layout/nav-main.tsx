"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, settingsNav, type NavItem } from "@/config/nav";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function visibleItems(items: NavItem[], permissions: string[]) {
  return items.filter((item) => !item.permission || permissions.includes(item.permission));
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();

  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={isActive}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebarNav({ permissions }: { permissions: string[] }) {
  const visibleMain = visibleItems(mainNav, permissions);
  const visibleSettings = visibleItems(settingsNav, permissions);

  return (
    <>
      <NavGroup label="Workspace" items={visibleMain} />
      {visibleSettings.length > 0 ? <NavGroup label="Settings" items={visibleSettings} /> : null}
    </>
  );
}
