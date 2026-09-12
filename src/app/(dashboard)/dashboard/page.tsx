import { getSession } from "@/server/dal/session";
import { getCompanyDashboard, getMyDashboard } from "@/server/dal/dashboard";
import { getCompany } from "@/server/dal/company";
import { nowAsUtcNominal } from "@/server/attendance/calendar";
import { ModernDashboard } from "@/components/dashboard/modern-dashboard";

function greetingFor(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const [session, companyInfo, companyStats, myDashboard] = await Promise.all([
    getSession(),
    getCompany(),
    getCompanyDashboard(),
    getMyDashboard(),
  ]);

  const user = session?.user;
  const now = nowAsUtcNominal();
  const rawName = user?.name ?? "";
  const firstName = rawName.includes("@") ? user?.roleName : rawName.split(" ")[0];
  const showCheckIn = user?.roleName !== "Admin";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(now);

  const greeting = greetingFor(now.getUTCHours());

  return (
    <ModernDashboard
      companyName={companyInfo?.name || "Benwil Technologies"}
      userName={user?.name ?? firstName ?? "Admin User"}
      userRole={user?.roleName ?? "Admin"}
      userEmail={user?.email ?? "admin@benwil.com"}
      employeeId={user?.employeeId ?? null}
      dateLabel={dateLabel}
      greeting={greeting}
      showCheckIn={showCheckIn}
      companyStats={companyStats}
      myStats={myDashboard}
    />
  );
}
