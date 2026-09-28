"use client"

import Link from "next/link"
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  Settings2Icon,
  SlidersHorizontalIcon,
  UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/auth-context"
import { getInitials } from "@/lib/utils"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, signOut } = useAuth()

  const displayName = user?.name ?? "Amara Whitfield"
  const displayEmail = user?.email ?? "admin@benwilhrm.com"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
            <Avatar size="sm" className="rounded-lg">
              <AvatarFallback className="rounded-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="truncate text-sm font-medium">
                {displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            className="w-56"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/settings/account" />}>
                <UserIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings/account" />}>
                <Settings2Icon />
                Account settings
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings/company" />}>
                <SlidersHorizontalIcon />
                Company settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void signOut()}
              className="cursor-pointer"
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
