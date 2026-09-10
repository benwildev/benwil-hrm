import { NextResponse } from "next/server";
import { getDocumentForDownload } from "@/server/dal/documents";
import { UnauthenticatedError } from "@/server/dal/session";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const key = path.join("/");

  try {
    const result = await getDocumentForDownload(key);
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const extension = key.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(result.data), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(result.fileName)}"`,
        "Cache-Control": "private, max-age=0, no-cache",
      },
    });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
