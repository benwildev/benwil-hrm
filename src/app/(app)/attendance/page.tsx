import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { AttendanceTable } from "@/features/attendance/attendance-table"

export default function AttendancePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Attendance"
        description="Track daily check-ins, late arrivals, and absences."
      />
      <AttendanceTable />
    </PageContainer>
  )
}
