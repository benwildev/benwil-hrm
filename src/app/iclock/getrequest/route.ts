import { NextResponse, type NextRequest } from "next/server"

import { attendanceService } from "@/lib/services/attendance-service"

// Devices poll this endpoint for queued commands (reboot, user sync, etc).
// We don't issue remote commands yet, so we always report "nothing to do".
export async function GET(request: NextRequest) {
  const serialNumber = request.nextUrl.searchParams.get("SN")
  if (serialNumber) {
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip")
    await attendanceService.touchDevice(serialNumber, ip)
  }

  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=UTF-8" },
  })
}
