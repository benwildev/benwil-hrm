"use client"

import {
  BellIcon,
  CheckCircle2Icon,
  ClockAlertIcon,
  ListChecksIcon,
  MessageSquareIcon,
} from "lucide-react"

import { NotificationItem } from "@/components/shared/notification-item"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const notifications = [
  {
    id: "1",
    icon: ListChecksIcon,
    title: 'New task assigned: "Prepare Q3 payroll report"',
    timestamp: "5 minutes ago",
    unread: true,
    tone: "default" as const,
  },
  {
    id: "2",
    icon: CheckCircle2Icon,
    title: "Leave request approved for Sarah Chen",
    timestamp: "1 hour ago",
    unread: true,
    tone: "success" as const,
  },
  {
    id: "3",
    icon: MessageSquareIcon,
    title: "You have a new message from David Kim",
    timestamp: "3 hours ago",
    unread: false,
    tone: "default" as const,
  },
  {
    id: "4",
    icon: ClockAlertIcon,
    title: "Attendance marked late for 3 employees",
    timestamp: "Yesterday",
    unread: false,
    tone: "warning" as const,
  },
]

export function NotificationsMenu() {
  const unreadCount = notifications.filter((notification) => notification.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Notifications" />}
      >
        <span className="relative">
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <div className="flex items-center justify-between px-1 py-1">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-0.5">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} {...notification} />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
