import { Badge } from "@/components/ui/badge";
import { AttendanceTrendChart } from "@/components/dashboard/attendance-trend-chart";
import { AttendanceRing } from "@/components/dashboard/attendance-ring";
import { CheckInOutCard } from "@/components/dashboard/check-in-out-card";
import { StatRow } from "@/components/dashboard/stat-row";
import { getSession } from "@/server/dal/session";
import { getCompanyDashboard, getMyDashboard } from "@/server/dal/dashboard";
import { nowAsUtcNominal } from "@/server/attendance/calendar";

const PAYROLL_STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  DRAFT: "Draft",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  LOCKED: "Locked",
};

function greetingFor(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getSession();
  const user = session?.user;

  const [company, mine] = await Promise.all([getCompanyDashboard(), getMyDashboard()]);

  const now = nowAsUtcNominal();
  const rawName = user?.name ?? "";
  const firstName = rawName.includes("@") ? user?.roleName : rawName.split(" ")[0];
  // Check-in/check-out is a floor-staff action — the Admin system role doesn't
  // punch a clock, even on the rare account that also has an Employee record.
  const showCheckIn = user?.roleName !== "Admin";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(now);

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto w-full pb-16">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {greetingFor(now.getUTCHours())}
          {firstName ? `, ${firstName}` : ""}
        </h1>
      </header>

      {mine ? (
        <section className={showCheckIn ? "grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4" : ""}>
          {showCheckIn ? (
            <div className="rounded-3xl bg-primary p-8">
              <CheckInOutCard checkIn={mine.todayCheckIn} checkOut={mine.todayCheckOut} />
            </div>
          ) : null}
          <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
            <StatRow
              label="Pending leave"
              detail="Awaiting approval"
              value={mine.myPendingLeave}
              href="/leave"
            />
            <StatRow
              label="Latest payslip"
              detail="Net salary, last period"
              value={mine.latestPayslip ? mine.latestPayslip.netSalary.toString() : "—"}
              href={mine.latestPayslip ? `/payroll/${mine.latestPayslip.payrollPeriodId}/${mine.latestPayslip.id}` : undefined}
            />
          </div>
        </section>
      ) : null}

      {company ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Company overview
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
            <div className="rounded-3xl border border-border p-8 flex items-center gap-8">
              <AttendanceRing
                present={company.todayPresent}
                late={company.todayLate}
                absent={company.todayAbsent}
                total={company.employeeCount}
              />
              <div className="flex flex-col gap-3">
                <LegendRow color="#0ca30c" label="Present" value={company.todayPresent} />
                <LegendRow color="#fab219" label="Late" value={company.todayLate} />
                <LegendRow color="#d03b3b" label="Absent" value={company.todayAbsent} />
                <p className="text-xs text-muted-foreground pt-1">
                  {company.employeeCount} employee{company.employeeCount === 1 ? "" : "s"} total
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
              <StatRow label="Employees" detail="Active personnel" value={company.employeeCount} href="/employees" />
              <StatRow label="Pending leaves" detail="Across all employees" value={company.pendingLeaveCount} href="/leave/approvals" />
              <StatRow
                label="Payroll status"
                detail="Current month"
                value={
                  <Badge variant="outline" className="font-mono uppercase tracking-wider">
                    {PAYROLL_STATUS_LABEL[company.payrollStatus] ?? company.payrollStatus}
                  </Badge>
                }
                href="/payroll"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold">Attendance, last 14 working days</h3>
              <p className="text-xs text-muted-foreground">Company-wide, weekends and holidays excluded.</p>
            </div>
            <AttendanceTrendChart data={company.trend} />
          </div>
        </section>
      ) : null}

      {!company && !mine ? (
        <p className="text-sm text-muted-foreground">No dashboard data available yet.</p>
      ) : null}
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm text-muted-foreground w-14">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}
