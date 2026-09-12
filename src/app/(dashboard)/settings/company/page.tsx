import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompanyProfileForm } from "@/components/settings/company-profile-form";
import { CompanyBrandingForm } from "@/components/settings/company-branding-form";
import { CompanyLogoForm } from "@/components/settings/company-logo-form";
import { getCompany } from "@/server/dal/company";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export default async function CompanySettingsPage() {
  await requirePermission(PERMISSIONS.COMPANY_MANAGE);
  const rawCompany = await getCompany();

  const company = {
    ...rawCompany,
    absenceDeductionRate: rawCompany.absenceDeductionRate ? Number(rawCompany.absenceDeductionRate) : 100,
    lateDeductionRate: rawCompany.lateDeductionRate ? Number(rawCompany.lateDeductionRate) : 100,
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Company</h1>
        <p className="text-sm text-muted-foreground">
          Manage your company profile and UI branding.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Shown in the sidebar and on the login screen.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyLogoForm logoUrl={company.logoUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Shown across the app and on generated documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyProfileForm company={company} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Pick your brand colors for the whole app.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyBrandingForm
            primaryColor={company.primaryColor}
            accentColor={company.accentColor}
            sidebarPrimary={company.sidebarPrimary}
          />
        </CardContent>
      </Card>
    </div>
  );
}
