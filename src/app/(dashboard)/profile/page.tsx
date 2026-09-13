import { redirect } from "next/navigation";
import { getSession } from "@/server/dal/session";
import { prisma } from "@/lib/prisma";
import { listBalancesForEmployee } from "@/server/dal/leave-balances";
import { listAttendanceForEmployee } from "@/server/dal/attendance";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata = {
  title: "My Profile | HRM",
  description: "View and manage your personal and employment profile.",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      employee: {
        include: {
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, name: true } },
          shift: true,
          reportingManager: {
            select: {
              id: true,
              fullName: true,
              employeeCode: true,
              workEmail: true,
            },
          },
            documents: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              documentName: true,
              documentType: true,
              fileUrl: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  let leaveBalances: Array<{
    leaveType: { id: string; name: string };
    allocatedDays: number | string;
    usedDays: number | string;
    remainingDays: number | string;
  }> = [];

  let attendanceStats = {
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    halfDays: 0,
    absentDays: 0,
  };

  let latestPayroll = null;

  if (user.employee) {
    try {
      const balances = await listBalancesForEmployee(user.employee.id, currentYear);
      leaveBalances = balances.map((b) => ({
        leaveType: {
          id: b.leaveType.id,
          name: b.leaveType.name,
        },
        allocatedDays: Number(b.allocatedDays),
        usedDays: Number(b.usedDays),
        remainingDays: Number(b.remainingDays),
      }));
    } catch {
      // ignore
    }

    try {
      const attendance = await listAttendanceForEmployee(
        user.employee.id,
        currentYear,
        currentMonth,
      );

      attendanceStats = {
        totalDays: attendance.length,
        presentDays: attendance.filter((a) => a.status === "PRESENT").length,
        lateDays: attendance.filter((a) => a.status === "LATE").length,
        halfDays: attendance.filter((a) => a.status === "HALF_DAY").length,
        absentDays: attendance.filter((a) => a.status === "ABSENT").length,
      };
    } catch {
      // ignore
    }

    try {
      const latestRecord = await prisma.payrollRecord.findFirst({
        where: { employeeId: user.employee.id },
        include: { payrollPeriod: true },
        orderBy: { createdAt: "desc" },
      });

      if (latestRecord) {
        latestPayroll = {
          periodName: `${latestRecord.payrollPeriod.year} - ${latestRecord.payrollPeriod.month}`,
          netSalary: latestRecord.netSalary.toString(),
          paymentStatus: latestRecord.paymentStatus,
          recordId: latestRecord.id,
          periodId: latestRecord.payrollPeriodId,
        };
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="w-full pb-12">
      <ProfileView
        user={{
          id: user.id,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
          role: user.role,
        }}
        employee={user.employee}
        leaveBalances={leaveBalances}
        attendanceStats={attendanceStats}
        latestPayroll={latestPayroll}
      />
    </div>
  );
}
