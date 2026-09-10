import type { Company } from "@/generated/prisma/client";

export function BrandStyle({ company }: { company: Company }) {
  const vars = `
    --primary: ${company.primaryColor};
    --primary-foreground: ${company.primaryForeground};
    --accent: ${company.accentColor};
    --accent-foreground: ${company.accentForeground};
    --sidebar-primary: ${company.sidebarPrimary};
    --sidebar-primary-foreground: ${company.primaryForeground};
    --sidebar-accent: ${company.sidebarAccent};
    --sidebar-accent-foreground: ${company.accentForeground};
    --ring: ${company.primaryColor};
    --sidebar-ring: ${company.primaryColor};
  `;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root { ${vars} } .dark { ${vars} }`,
      }}
    />
  );
}
