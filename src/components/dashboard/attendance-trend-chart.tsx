"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Fixed status palette (good/warning/critical) — never themed, per the
// dataviz skill's reference palette, since present/late/absent is a status
// encoding rather than generic categorical identity.
const chartConfig = {
  present: { label: "Present", color: "#0ca30c" },
  late: { label: "Late", color: "#fab219" },
  absent: { label: "Absent", color: "#d03b3b" },
} satisfies ChartConfig;

export function AttendanceTrendChart({
  data,
}: {
  data: { date: string; present: number; late: number; absent: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} barCategoryGap={4}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="present" stackId="a" fill="var(--color-present)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="late" stackId="a" fill="var(--color-late)" />
        <Bar dataKey="absent" stackId="a" fill="var(--color-absent)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
