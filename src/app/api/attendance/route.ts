import { NextResponse, type NextRequest } from "next/server"

import { attendanceService } from "@/lib/services/attendance-service"

export async function GET(request: NextRequest) {
  // Mirrors the session check in middleware.ts — this app's auth is
  // cookie-gated, not token-verified, so this route matches that bar.
  if (!request.cookies.get("benwil_auth_session")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const events = await attendanceService.listRecent()
  return NextResponse.json({ events })
}
