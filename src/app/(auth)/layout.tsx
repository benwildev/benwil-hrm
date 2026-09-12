import Image from "next/image";
import {
  SparklesIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  ClockIcon,
  TrendingUpIcon,
  LockIcon,
} from "lucide-react";
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
    <div className="h-[100dvh] w-full flex flex-col lg:flex-row bg-[#F8FAFC] overflow-hidden">
      {/* Left panel: Brand Showcase + Ambient Product Showcase */}
      <div className="relative hidden lg:flex lg:w-1/2 h-full flex-col justify-between overflow-hidden bg-[#0D1C33] p-8 xl:p-12 text-white selection:bg-[#C52227] selection:text-white">
        {/* Ambient atmospheric glows with logo colors */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-[#162E51]/60 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#C52227]/20 blur-[120px]" />

        {/* Subtle grid background texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-md ring-1 ring-white/20">
              <Image
                src={company.logoUrl || "/logo.png"}
                alt={company.name || "Benwil"}
                width={36}
                height={36}
                className="size-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block leading-snug">
                {company.name}
              </span>
              <span className="text-[10px] font-bold text-[#C52227] tracking-widest uppercase block">
                Enterprise HRM
              </span>
            </div>
          </div>

          {/* System status pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            <span>All Systems Live</span>
          </div>
        </div>

        {/* Center: Hero Heading + HRM Feature Showcase Cards */}
        <div className="relative z-10 my-auto py-4 space-y-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C52227]/30 bg-[#C52227]/15 px-3 py-0.5 text-xs font-semibold text-[#FF8587] backdrop-blur-md">
              <SparklesIcon className="size-3 text-[#FF8587]" />
              <span>Modern Workforce Platform</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
              Effortless HR Operations.
              <br />
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Unified in one place.
              </span>
            </h1>

            <p className="text-xs xl:text-sm leading-relaxed text-white/70 max-w-md">
              Manage complete employee records, multi-component automated payroll, live biometric shift logs, and leaves with enterprise reliability.
            </p>
          </div>

          {/* Live HRM Feature Preview Bento Tiles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Tile 1: Payroll Engine */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-white/20 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CreditCardIcon className="size-3.5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2Icon className="size-2.5" /> Ready
                </span>
              </div>
              <span className="text-xs font-bold text-white block">Payroll Engine</span>
              <span className="text-[10px] text-white/50 block mt-0.5">Automated Salary & Slips</span>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/70 pt-2 border-t border-white/5">
                <span>Monthly Cycle</span>
                <span className="font-mono font-bold text-white">100% Punctual</span>
              </div>
            </div>

            {/* Tile 2: Smart Attendance */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-white/20 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#162E51]/60 text-slate-300 border border-white/15">
                  <ClockIcon className="size-3.5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FF8587] bg-[#C52227]/20 px-1.5 py-0.5 rounded-md border border-[#C52227]/30">
                  <TrendingUpIcon className="size-2.5" /> Live
                </span>
              </div>
              <span className="text-xs font-bold text-white block">Time & Attendance</span>
              <span className="text-[10px] text-white/50 block mt-0.5">Shifts, Breaks & Logs</span>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/70 pt-2 border-t border-white/5">
                <span>Accuracy</span>
                <span className="font-mono font-bold text-white">99.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer: Security assurance */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-[11px] text-white/50">
          <div className="flex items-center gap-1.5">
            <LockIcon className="size-3 text-[#C52227]" />
            <span>256-bit TLS Encryption · End-to-End Secure</span>
          </div>
          <span className="font-semibold text-white/60">Benwil HRM v2.4</span>
        </div>
      </div>

      {/* Right panel: Sign-in experience (fitted, no page scroll) */}
      <div className="flex w-full lg:w-1/2 h-full items-center justify-center p-4 sm:p-8 lg:p-10 overflow-y-auto bg-[#F8FAFC]">
        <div className="w-full max-w-[420px] my-auto">{children}</div>
      </div>
    </div>
  );
}


