import Image from "next/image";
import { getCompany } from "@/server/dal/company";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const company = await getCompany();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col md:flex-row bg-[#F5F7FA]">
      {/* Left panel: brand + product framing */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden bg-[#18315B] p-8 text-white md:w-1/2 md:p-16 lg:p-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 15% 0%, rgba(255,255,255,0.08), transparent 55%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/20">
            {company.logoUrl ? (
              <Image src={company.logoUrl} alt={company.name} width={36} height={36} className="size-full object-cover" />
            ) : (
              <span className="text-sm font-semibold">{initials(company.name)}</span>
            )}
          </div>
          <span className="font-semibold tracking-tight text-lg">{company.name}</span>
        </div>

        <div className="relative z-10 mt-auto pt-16">
          <span className="mb-4 inline-block rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60 ring-1 ring-white/10">
            Internal platform
          </span>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-5xl">
            Everything HR.
            <br />
            One dashboard.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-white/65">
            Attendance, leave, payroll, and employee records for {company.name}, all in one place.
          </p>
        </div>
      </div>

      {/* Right panel: sign-in form */}
      <div className="flex w-full items-center justify-center bg-[#F5F7FA] p-6 md:w-1/2 md:p-12 lg:p-24">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
