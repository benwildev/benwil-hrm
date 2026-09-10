import { ImageResponse } from "next/og";
import { getCompany } from "@/server/dal/company";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function Icon() {
  const company = await getCompany();

  if (company.logoUrl) {
    const logoResponse = await fetch(company.logoUrl);
    if (logoResponse.ok && logoResponse.body) {
      return new Response(logoResponse.body, {
        headers: { "Content-Type": logoResponse.headers.get("content-type") ?? "image/png" },
      });
    }
  }

  // No logo uploaded yet — fall back to a navy monogram matching the
  // brand treatment used on the login screen and sidebar.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#18315B",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {initials(company.name)}
      </div>
    ),
    { ...size },
  );
}
