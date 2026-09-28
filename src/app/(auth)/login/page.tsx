import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { getCompany } from "@/server/dal/company";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [{ callbackUrl }, company] = await Promise.all([searchParams, getCompany()]);

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-neutral-950/5">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-neutral-100">
        <div className="size-11 rounded-xl overflow-hidden border border-neutral-200/80 bg-white shadow-xs flex items-center justify-center p-1 shrink-0">
          <Image
            src={company.logoUrl || "/logo.png"}
            alt={company.name || "Benwil"}
            width={40}
            height={40}
            className="size-full object-contain"
            priority
          />
        </div>
        <div>
          <span className="text-lg font-black tracking-tight text-[#162E51] leading-none block">
            {company.name || "Benwil"}
          </span>
          <span className="text-[10px] font-bold text-[#C52227] tracking-widest uppercase mt-1 block">
            HRM System
          </span>
        </div>
      </div>

      {/* Form Header */}
      <div className="mb-6 space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#162E51]">
          Sign in to your account
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500">
          Welcome back! Access your workspace credentials.
        </p>
      </div>

      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}

