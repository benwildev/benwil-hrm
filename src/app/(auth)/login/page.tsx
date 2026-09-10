import { LoginForm } from "@/components/auth/login-form";
import { getCompany } from "@/server/dal/company";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [{ callbackUrl }, company] = await Promise.all([searchParams, getCompany()]);

  return (
    <div className="rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_32px_rgba(17,24,39,0.06)] md:p-10">
      <div className="mb-8 flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">Sign in</h2>
        <p className="text-sm text-[#64748B]">Sign in to your {company.name} account.</p>
      </div>

      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
