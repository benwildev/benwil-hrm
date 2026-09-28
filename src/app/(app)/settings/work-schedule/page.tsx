"use client"

import * as React from "react"
import { CheckCircle2Icon, InfoIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"
import type { DayOfWeek } from "@/types/auth"

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
]

export default function WorkScheduleSettingsPage() {
  const { schedule, updateSchedule } = useAuth()

  const [workingDays, setWorkingDays] = React.useState<DayOfWeek[]>(
    schedule?.workingDays ?? ["monday", "tuesday", "wednesday", "thursday", "friday"]
  )
  const [startTime, setStartTime] = React.useState(schedule?.startTime ?? "09:00")
  const [endTime, setEndTime] = React.useState(schedule?.endTime ?? "18:00")
  const [breakStart, setBreakStart] = React.useState(schedule?.breakStart ?? "13:00")
  const [breakEnd, setBreakEnd] = React.useState(schedule?.breakEnd ?? "14:00")

  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const toggleDay = (day: DayOfWeek) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (workingDays.length === 0) {
      alert("Please select at least one working day.")
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await updateSchedule({
        workingDays,
        startTime,
        endTime,
        breakStart,
        breakEnd,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      alert("Failed to save schedule. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      {/* Save Success Alert */}
      {saveSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in duration-200"
        >
          <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">Working schedule configuration updated successfully.</span>
        </div>
      )}

      {/* Info notice explaining attendance integration */}
      <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-zinc-50/70 p-3.5 text-xs text-muted-foreground dark:bg-zinc-900/40">
        <InfoIcon className="size-4 shrink-0 text-zinc-700 dark:text-zinc-300 mt-0.5" />
        <p className="leading-relaxed">
          These schedule parameters define standard expected working days, shift intervals, and break times. In Phase 2, the attendance telemetry engine will automatically utilize these rules to flag on-time, late, and overtime records.
        </p>
      </div>

      {/* Section 1: Working Days */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Operating Days
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Select which days of the week are considered standard active business days.
              </CardDescription>
            </div>
            <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums">
              {workingDays.length} / 7 days
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-background">
            {DAYS.map((day) => {
              const isChecked = workingDays.includes(day.id)
              return (
                <div
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={day.id}
                      checked={isChecked}
                      onCheckedChange={() => toggleDay(day.id)}
                    />
                    <Label
                      htmlFor={day.id}
                      className="text-xs font-medium text-foreground cursor-pointer"
                    >
                      {day.label}
                    </Label>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider",
                      isChecked
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    )}
                  >
                    {isChecked ? "Working Day" : "Off Day"}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Shift Hours & Daily Break */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            Shift & Break Windows
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Define standard clock-in target, expected shift conclusion, and official meal break window.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-medium">
                Standard Start Time (Clock-in target)
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs font-medium">
                Standard End Time (Shift conclusion)
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-foreground block mb-2">
              Scheduled Daily Break
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="breakStart" className="text-xs font-medium text-muted-foreground">
                  Break Begins
                </Label>
                <Input
                  id="breakStart"
                  type="time"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="breakEnd" className="text-xs font-medium text-muted-foreground">
                  Break Concludes
                </Label>
                <Input
                  id="breakEnd"
                  type="time"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 h-9 px-4 transition-all"
        >
          {isSaving ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
