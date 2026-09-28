// Fixed status palette (good/warning/critical) — same values as
// attendance-trend-chart.tsx, per the dataviz skill: status color is reserved
// and must stay consistent everywhere it appears on the page.
const STATUS = {
  present: "#0ca30c",
  late: "#fab219",
  absent: "#d03b3b",
  unmarked: "var(--muted-foreground)",
} as const;

const SIZE = 168;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AttendanceRing({
  present,
  late,
  absent,
  total,
}: {
  present: number;
  late: number;
  absent: number;
  total: number;
}) {
  const accountedFor = present + late + absent;
  const unmarked = Math.max(0, total - accountedFor);
  const safeTotal = total > 0 ? total : 1;

  const segments = [
    { key: "present", value: present, color: STATUS.present },
    { key: "late", value: late, color: STATUS.late },
    { key: "absent", value: absent, color: STATUS.absent },
    { key: "unmarked", value: unmarked, color: STATUS.unmarked },
  ].filter((s) => s.value > 0);

  let offset = 0;
  const arcs = segments.map((segment) => {
    const length = (segment.value / safeTotal) * CIRCUMFERENCE;
    const gap = segments.length > 1 ? 3 : 0;
    const arc = (
      <circle
        key={segment.key}
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={segment.color}
        strokeWidth={STROKE}
        strokeDasharray={`${Math.max(length - gap, 0)} ${CIRCUMFERENCE}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
    );
    offset += length;
    return arc;
  });

  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${attendanceRate}% of employees present today`}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        {arcs}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{attendanceRate}%</span>
        <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">present</span>
      </div>
    </div>
  );
}

export { STATUS as attendanceStatusColors };
