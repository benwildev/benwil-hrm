"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"
import type { DayOfWeek } from "@/types/auth"

const ALL_DAYS: { id: DayOfWeek; label: string; short: string }[] = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
]

export default function SetupPage() {
  const router = useRouter()
  const { completeCompanySetup, company, isAuthenticated, isLoading } = useAuth()

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login?from=/setup")
      }
    }
  }, [isLoading, isAuthenticated, router])

  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Step 2 Form State: Company Information
  const [companyName, setCompanyName] = React.useState(company?.name ?? "Acme Global Technologies")
  const [industry, setIndustry] = React.useState(company?.industry ?? "Software & Technology")
  const [country, setCountry] = React.useState(company?.country ?? "United States")
  const [timezone, setTimezone] = React.useState(company?.timezone ?? "America/New_York (EST, UTC-5)")
  const [currency, setCurrency] = React.useState(company?.currency ?? "USD ($)")
  const [step2Errors, setStep2Errors] = React.useState<{ name?: string }>({})

  // Step 3 Form State: Working Schedule
  const [workingDays, setWorkingDays] = React.useState<DayOfWeek[]>([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ])
  const [startTime, setStartTime] = React.useState("09:00")
  const [endTime, setEndTime] = React.useState("18:00")
  const [breakDuration, setBreakDuration] = React.useState(60)

  // Validation before advancing
  const handleNextFromStep2 = () => {
    if (!companyName.trim()) {
      setStep2Errors({ name: "Company name is required." })
      return
    }
    setStep2Errors({})
    setCurrentStep(3)
  }

  const handleNextFromStep3 = () => {
    if (workingDays.length === 0) {
      alert("Please select at least one working day.")
      return
    }
    setCurrentStep(4)
  }

  const toggleDay = (day: DayOfWeek) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleCompleteSetup = async () => {
    setIsSubmitting(true)
    try {
      await completeCompanySetup({
        name: companyName,
        industry,
        country,
        timezone,
        currency,
        workingDays,
        startTime,
        endTime,
        breakDuration,
      })
      router.push("/dashboard")
    } catch {
      alert("Failed to complete setup. Please try again.")
      setIsSubmitting(false)
    }
  }

  const steps = [
    { num: 1, title: "Welcome" },
    { num: 2, title: "Company" },
    { num: 3, title: "Schedule" },
    { num: 4, title: "Review" },
  ]

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 flex flex-col justify-between px-4 py-8 sm:px-6">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-2xl mx-auto w-full pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-sm font-bold">
            B
          </div>
          <div>
            <span className="font-semibold text-sm text-foreground">Benwil HRM</span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">Setup Wizard</span>
          </div>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center gap-2">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors",
                  currentStep === s.num
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                    : currentStep > s.num
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                )}
              >
                {currentStep > s.num ? "✓" : s.num}
              </span>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                {s.title}
              </span>
              {s.num < 4 && (
                <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">·</span>
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-xl">
          {/* STEP 1: WELCOME */}
          {currentStep === 1 && (
            <Card className="border-border/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-card">
              <CardHeader className="text-center space-y-2 pb-6 pt-6">
                <div className="mx-auto size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-xs">
                  <SparklesIcon className="size-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Let’s set up your company
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Welcome to Benwil HRM! We’ll configure your organization workspace, operational schedule, and working hours in 3 quick steps.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="rounded-lg border border-border/80 p-3.5 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <Building2Icon className="size-4 text-zinc-700 dark:text-zinc-300 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">1. Company Profile</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Your legal entity, industry classification, timezone, and accounting currency.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarCheckIcon className="size-4 text-zinc-700 dark:text-zinc-300 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">2. Operating Work Schedule</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Working days of the week, standard daily shift hours, and scheduled break duration.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BriefcaseIcon className="size-4 text-zinc-700 dark:text-zinc-300 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">3. Immediate Access</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Instant transition to your live single-tenant dashboard ready for operations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 pb-6 border-t border-border/60 justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 h-9 px-4"
                >
                  <span>Continue</span>
                  <ArrowRightIcon className="size-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 2: COMPANY INFORMATION */}
          {currentStep === 2 && (
            <Card className="border-border/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-card">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                  Company Information
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Provide baseline business identifiers for your workspace.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-xs font-medium text-foreground">
                    Legal Company Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Benwil Technologies Inc."
                    className={step2Errors.name ? "border-rose-500" : ""}
                  />
                  {step2Errors.name && (
                    <p className="text-[11px] text-rose-600 font-medium">{step2Errors.name}</p>
                  )}
                </div>

                {/* Industry & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="industry" className="text-xs font-medium text-foreground">
                      Industry
                    </Label>
                    <Input
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Technology & SaaS"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs font-medium text-foreground">
                      Operating Country
                    </Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States"
                    />
                  </div>
                </div>

                {/* Timezone & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="timezone" className="text-xs font-medium text-foreground">
                      Primary Timezone
                    </Label>
                    <Input
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="e.g. America/New_York (UTC-5)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="currency" className="text-xs font-medium text-foreground">
                      Payroll Currency
                    </Label>
                    <Input
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="e.g. USD ($)"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 pb-6 border-t border-border/60 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs"
                >
                  <ArrowLeftIcon className="size-3.5 mr-1" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleNextFromStep2}
                  className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                >
                  <span>Continue to Schedule</span>
                  <ArrowRightIcon className="size-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 3: WORKING SCHEDULE */}
          {currentStep === 3 && (
            <Card className="border-border/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-card">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                  Working Schedule
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Define normal business days and shift timings.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Working Days */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-foreground">
                      Operational Working Days
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {workingDays.length} days selected
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {ALL_DAYS.map((day) => {
                      const isSelected = workingDays.includes(day.id)
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-lg border py-2.5 text-xs font-medium transition-colors",
                            isSelected
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                              : "border-border/80 bg-zinc-50/60 text-muted-foreground hover:bg-zinc-100 dark:bg-zinc-900/40"
                          )}
                        >
                          <span>{day.short}</span>
                          <span className="text-[9px] opacity-80 mt-0.5">
                            {isSelected ? "ON" : "OFF"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Shift Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="startTime" className="text-xs font-medium text-foreground">
                      Shift Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endTime" className="text-xs font-medium text-foreground">
                      Shift End Time
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Break Duration */}
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="breakDuration" className="text-xs font-medium text-foreground">
                    Scheduled Daily Break
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="breakDuration"
                      type="number"
                      min={15}
                      max={180}
                      step={15}
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number(e.target.value))}
                      className="w-24 tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">minutes (e.g. 1:00 PM – 2:00 PM)</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 pb-6 border-t border-border/60 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs"
                >
                  <ArrowLeftIcon className="size-3.5 mr-1" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleNextFromStep3}
                  className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                >
                  <span>Review & Finalize</span>
                  <ArrowRightIcon className="size-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 4: REVIEW & COMPLETE */}
          {currentStep === 4 && (
            <Card className="border-border/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-card">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                  Review Configuration
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Confirm your settings before launching the workspace.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="rounded-lg border border-border/80 divide-y divide-border/60 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Company Profile
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Name</span>
                        <strong className="font-semibold text-foreground">{companyName}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Industry</span>
                        <span className="text-foreground">{industry}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Location</span>
                        <span className="text-foreground">{country}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Currency</span>
                        <span className="text-foreground">{currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Operating Schedule
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Working Days</span>
                        <span className="text-foreground capitalize font-medium">
                          {workingDays.join(", ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Daily Shift</span>
                        <span className="text-foreground font-medium">
                          {startTime} – {endTime} ({breakDuration}m break)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  You can fine-tune all parameters later under <strong className="font-medium text-foreground">Settings → Company</strong> and <strong className="font-medium text-foreground">Settings → Work Schedule</strong>.
                </p>
              </CardContent>

              <CardFooter className="pt-3 pb-6 border-t border-border/60 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(3)}
                  className="text-xs"
                >
                  <ArrowLeftIcon className="size-3.5 mr-1" />
                  Back
                </Button>
                <Button
                  size="sm"
                  disabled={isSubmitting}
                  onClick={handleCompleteSetup}
                  className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="size-3.5 animate-spin" />
                      <span>Finalizing workspace...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2Icon className="size-3.5" />
                      <span>Complete Setup & Launch</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground">
        <span>© 2026 Benwil Technologies · Organization Setup</span>
      </footer>
    </div>
  )
}
