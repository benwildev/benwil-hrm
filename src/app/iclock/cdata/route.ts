import { NextResponse, type NextRequest } from "next/server"

import { attendanceService } from "@/lib/services/attendance-service"

// ZKTeco / ADMS "PUSH" protocol.
// Devices call this endpoint directly at the fixed path /iclock/cdata —
// GET is the handshake, POST is the actual data upload.

function textResponse(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=UTF-8" },
  })
}

export async function GET(request: NextRequest) {
  const serialNumber = request.nextUrl.searchParams.get("SN")
  if (!serialNumber) return textResponse("ERROR", 400)

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip")
  await attendanceService.touchDevice(serialNumber, ip)

  // Tells the device what to sync and how often. We only care about
  // attendance punches, pushed in real time.
  const body = [
    `GET OPTION FROM: ${serialNumber}`,
    "Stamp=9999",
    "OpStamp=9999",
    "ErrorDelay=60",
    "Delay=30",
    "TransFlag=TransData AttLog",
    "TransInterval=1",
    "Realtime=1",
    "Encrypt=None",
  ].join("\n")

  return textResponse(body)
}

export async function POST(request: NextRequest) {
  const serialNumber = request.nextUrl.searchParams.get("SN")
  if (!serialNumber) return textResponse("ERROR", 400)

  const table = request.nextUrl.searchParams.get("table")?.toUpperCase()
  const body = await request.text()

  if (table && table !== "ATTLOG") {
    // User/fingerprint/photo sync tables aren't needed for attendance yet.
    return textResponse("OK")
  }

  const stored = await attendanceService.recordAttLog(serialNumber, body)
  return textResponse(`OK: ${stored}`)
}
