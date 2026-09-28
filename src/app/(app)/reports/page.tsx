import { BarChart3Icon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"

export default function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Insights and analytics across your workforce."
      />
      <EmptyState
        icon={BarChart3Icon}
        title="No reports yet"
        description="Reports and analytics will appear here as workforce data becomes available."
      />
    </PageContainer>
  )
}
