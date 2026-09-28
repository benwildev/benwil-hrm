import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: "default" | "success" | "warning" | "danger"
  trend?: { value: string; direction: "up" | "down" }
  subtext?: string
  className?: string
}

const TONE_STYLES: Record<NonNullable<StatCardProps["tone"]>, { icon: string; dot: string }> = {
  default: {
    icon: "bg-zinc-100 text-zinc-700 border-zinc-200/70",
    dot: "bg-zinc-500",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    dot: "bg-emerald-500",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700 border-amber-200/60",
    dot: "bg-amber-500",
  },
  danger: {
    icon: "bg-rose-50 text-rose-700 border-rose-200/60",
    dot: "bg-rose-500",
  },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  trend,
  subtext,
  className,
}: StatCardProps) {
  const toneStyle = TONE_STYLES[tone]

  return (
    <Card className={cn("hover:-translate-y-0.5 hover:border-zinc-300/80 hover:shadow-xs transition-all duration-200", className)}>
      <CardContent className="flex flex-col justify-between gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {Icon && (
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md border",
                toneStyle.icon
              )}
            >
              <Icon className="size-3.5" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          {(trend || subtext) && (
            <div className="flex items-center gap-1.5 text-xs">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center font-medium",
                    trend.direction === "up" ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {trend.direction === "up" ? "↑" : "↓"} {trend.value}
                </span>
              )}
              {subtext && (
                <span className="text-[11px] text-muted-foreground truncate">
                  {subtext}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
