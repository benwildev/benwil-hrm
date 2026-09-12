import { redirect } from "next/navigation";
import { getSession } from "@/server/dal/session";
import { getCompany } from "@/server/dal/company";
import { getLiveNotifications } from "@/server/dal/notifications";
import { TopNav } from "@/components/layout/top-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const [company, notifications] = await Promise.all([
    getCompany(),
    getLiveNotifications(),
  ]);

  return (
    <div className="min-h-screen bg-[#edf0f5]/60 flex flex-col font-sans antialiased text-neutral-900">
      <TopNav
        companyName={company.name}
        companyLogoUrl={company.logoUrl}
        userName={session.user.name ?? session.user.email ?? "Admin User"}
        userEmail={session.user.email ?? ""}
        userRole={session.user.roleName ?? "Admin"}
        permissions={session.user.permissions}
        notifications={notifications}
      />
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
