import { MessageSquareIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"

export default function ChatPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Chat"
        description="Message your team and colleagues directly."
      />
      <EmptyState
        icon={MessageSquareIcon}
        title="No conversations yet"
        description="Start a conversation with your team once employees are added."
      />
    </PageContainer>
  )
}
