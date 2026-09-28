"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// A small allowlist of errors it's safe to show verbatim — deliberate,
// human-authored validation messages thrown by DAL/business-logic code
// (e.g. "You already have a pending leave request that overlaps these
// dates."). Anything else (a Prisma error, a thrown null-pointer, a
// database connection failure, ...) must never reach the browser as raw
// `error.message` — it can carry table/column names or other internals.
// Those are logged server-side via console.error below instead.
function friendlyMessage(error: Error) {
  if (error.name === "ForbiddenError" || error.message.startsWith("Missing required permission")) {
    return "You don't have permission to view this page.";
  }
  if (error.name === "UnauthenticatedError") {
    return "Your session has expired. Please sign in again.";
  }
  if (error.name === "Error" && !error.message.includes("Prisma") && !error.message.includes("prisma")) {
    return error.message || "Something went wrong loading this page.";
  }
  return "Something went wrong loading this page. Our team has been notified — please try again.";
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>{friendlyMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
