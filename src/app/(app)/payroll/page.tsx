import { WalletIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export default function PayrollPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Payroll"
        description="Generate and review payroll runs for your company."
      />
      <EmptyState
        icon={WalletIcon}
        title="No payroll runs yet"
        description="Generate your first payroll run once employee records are set up."
        action={<Button>Generate Payroll</Button>}
      />
    </PageContainer>
  )
}
