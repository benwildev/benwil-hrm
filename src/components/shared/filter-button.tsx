import { ListFilterIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterButtonProps extends ComponentProps<typeof Button> {
  count?: number
}

export function FilterButton({
  children = "Filter",
  count,
  className,
  ...props
}: FilterButtonProps) {
  return (
    <Button variant="outline" size="sm" className={cn(className)} {...props}>
      <ListFilterIcon data-icon="inline-start" />
      {children}
      {!!count && (
        <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {count}
        </span>
      )}
    </Button>
  )
}
