"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function friendlyMessage(error: Error) {
  if (error.name === "ForbiddenError" || error.message.startsWith("Missing required permission")) {
    return "You don't have permission to view this page.";
  }
  if (error.name === "UnauthenticatedError") {
    return "Your session has expired. Please sign in again.";
  }
  return error.message || "Something went wrong loading this page.";
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
