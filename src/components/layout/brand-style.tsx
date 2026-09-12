import type { Company } from "@/generated/prisma/client";

export function BrandStyle({ company }: { company: Company }) {
  const primary = company.primaryColor || "#162E51";
  const primaryFg = company.primaryForeground || "#ffffff";
  const accent = company.accentColor || "#C52227";
  const accentFg = company.accentForeground || "#ffffff";

  const vars = `
    --primary: ${primary};
    --primary-foreground: ${primaryFg};
    --accent: ${accent};
    --accent-foreground: ${accentFg};
    --destructive: #C52227;
    --destructive-foreground: #ffffff;
    --sidebar-primary: ${company.sidebarPrimary || primary};
    --sidebar-primary-foreground: ${primaryFg};
    --sidebar-accent: ${company.sidebarAccent || "#F0F4F9"};
    --sidebar-accent-foreground: ${primary};
    --ring: ${primary};
    --sidebar-ring: ${primary};
    --brand-navy: #162E51;
    --brand-navy-dark: #0D1C33;
    --brand-navy-light: #1E3E6B;
    --brand-navy-subtle: #F0F4F9;
    --brand-red: #C52227;
    --brand-red-dark: #A3181C;
    --brand-red-light: #E0353A;
    --brand-red-subtle: #FEF2F2;
  `;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root { ${vars} } .dark { ${vars} }`,
      }}
    />
  );
}
