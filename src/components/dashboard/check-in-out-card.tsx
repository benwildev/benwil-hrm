"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selfCheckInAction, selfCheckOutAction } from "@/server/actions/attendance.actions";

function formatTime(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
    new Date(date),
  );
}

export function CheckInOutCard({
  checkIn,
  checkOut,
}: {
  checkIn: Date | null;
  checkOut: Date | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckIn() {
    setError(null);
    startTransition(async () => {
      try {
        await selfCheckInAction();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to check in.");
      }
    });
  }

  function handleCheckOut() {
    setError(null);
    startTransition(async () => {
      try {
        await selfCheckOutAction();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to check out.");
      }
    });
  }

  const checkInTime = formatTime(checkIn);
  const checkOutTime = formatTime(checkOut);
  const done = Boolean(checkInTime && checkOutTime);

  return (
    <div className="flex flex-col justify-between h-full gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground/60">
          Today&apos;s attendance
        </span>
        {done ? (
          <div className="flex items-center gap-2 text-primary-foreground">
            <CheckIcon className="size-5" />
            <p className="text-lg font-medium">You&apos;re done for the day</p>
          </div>
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-primary-foreground max-w-[22ch]">
            {!checkInTime ? "Ready when you are." : "You're checked in."}
          </p>
        )}
        <p className="text-sm text-primary-foreground/70">
          {!checkInTime
            ? "You haven't checked in today."
            : !checkOutTime
              ? `Checked in at ${checkInTime}.`
              : `Checked in ${checkInTime} · Checked out ${checkOutTime}.`}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {!checkInTime ? (
          <Button
            onClick={handleCheckIn}
            disabled={isPending}
            className="h-12 w-full rounded-full text-sm font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-300 active:scale-[0.97]"
          >
            {isPending ? "Checking in…" : "Check in"}
            <ArrowRightIcon className="size-4" />
          </Button>
        ) : !checkOutTime ? (
          <Button
            onClick={handleCheckOut}
            disabled={isPending}
            className="h-12 w-full rounded-full text-sm font-semibold bg-transparent text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10 transition-all duration-300 active:scale-[0.97]"
          >
            {isPending ? "Checking out…" : "Check out"}
            <ArrowRightIcon className="size-4" />
          </Button>
        ) : null}
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
      </div>
    </div>
  );
}
