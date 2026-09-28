import { CalendarClockIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"

export default function LeavePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Leave"
        description="Review and manage employee time-off requests."
      />
      <EmptyState
        icon={CalendarClockIcon}
        title="No leave requests yet"
        description="Leave requests submitted by employees will show up here for review."
      />
    </PageContainer>
  )
}
