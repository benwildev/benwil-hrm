import { redirect } from "next/navigation";
import Image from "next/image";
import { Building2Icon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebarNav } from "@/components/layout/nav-main";
import { UserMenu } from "@/components/layout/user-menu";
import { getSession } from "@/server/dal/session";
import { getCompany } from "@/server/dal/company";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const company = await getCompany();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<a href="/dashboard" />}>
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground">
                  {company.logoUrl ? (
                    <Image src={company.logoUrl} alt={company.name} width={32} height={32} className="size-full object-cover" />
                  ) : (
                    <Building2Icon className="size-4" />
                  )}
                </div>
                <div className="flex flex-1 flex-col text-left leading-tight">
                  <span className="truncate font-medium">{company.name}</span>
                  <span className="truncate text-xs text-muted-foreground">HRM</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <AppSidebarNav permissions={session.user.permissions} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <UserMenu
                name={session.user.name ?? session.user.email ?? "User"}
                email={session.user.email ?? ""}
                roleName={session.user.roleName}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
