import { NextResponse } from "next/server"

// Devices POST here to report the result of a command we queued via
// /iclock/getrequest. We don't issue commands yet, so just acknowledge.
export async function POST() {
  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=UTF-8" },
  })
}
