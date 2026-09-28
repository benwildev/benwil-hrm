import { HelpCircleIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"

export default function HelpPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Help"
        description="Guides and support resources for using Benwil HRM."
      />
      <EmptyState
        icon={HelpCircleIcon}
        title="Need help?"
        description="Documentation and support resources will be available here soon."
      />
    </PageContainer>
  )
}
