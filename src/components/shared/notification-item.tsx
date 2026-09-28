import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface NotificationItemProps {
  icon: LucideIcon
  title: string
  timestamp: string
  unread?: boolean
  tone?: "default" | "success" | "warning" | "danger"
}

const TONE_STYLES: Record<NonNullable<NotificationItemProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
}

export function NotificationItem({
  icon: Icon,
  title,
  timestamp,
  unread,
  tone = "default",
}: NotificationItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          TONE_STYLES[tone]
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
      {unread && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  )
}
