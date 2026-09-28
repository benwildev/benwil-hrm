import { STATUS_TONE_MAP, type StatusTone } from "@/types/status"
import { cn } from "@/lib/utils"

const TONE_STYLES: Record<StatusTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
  neutral: "bg-muted text-muted-foreground",
}

const DOT_STYLES: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-primary",
  neutral: "bg-muted-foreground",
}

interface StatusBadgeProps {
  status: string
  tone?: StatusTone
  className?: string
}

export function StatusBadge({ status, tone, className }: StatusBadgeProps) {
  const resolvedTone = tone ?? STATUS_TONE_MAP[status.toLowerCase()] ?? "neutral"

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_STYLES[resolvedTone],
        className
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", DOT_STYLES[resolvedTone])} />
      {status}
    </span>
  )
}
