import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatRow({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className={cn("flex items-center justify-between gap-4 px-6 py-5", href && "group")}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {detail ? <span className="text-xs text-muted-foreground/70">{detail}</span> : null}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-semibold tabular-nums">{value}</span>
        {href ? (
          <ArrowUpRightIcon className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:bg-muted/40 transition-colors">
        {content}
      </Link>
    );
  }

  return content;
}
