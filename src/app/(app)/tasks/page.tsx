import { ListChecksIcon, PlusIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export default function TasksPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        description="Assign, track, and follow up on work across your team."
      />
      <EmptyState
        icon={ListChecksIcon}
        title="No tasks yet"
        description="Create your first task to start tracking work across your team."
        action={
          <Button>
            <PlusIcon data-icon="inline-start" />
            Create Task
          </Button>
        }
      />
    </PageContainer>
  )
}
