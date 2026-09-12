import { NextResponse } from "next/server";
import { uploadEmployeePhoto } from "@/server/dal/employees";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("photo");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please select an image file to upload." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Employee photo must be under 5 MB." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Uploaded file must be an image (PNG, JPG, WEBP)." },
        { status: 400 }
      );
    }

    const data = Buffer.from(await file.arrayBuffer());
    const url = await uploadEmployeePhoto(data, "headshot");

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload photo to Cloudinary.",
      },
      { status: 500 }
    );
  }
}
