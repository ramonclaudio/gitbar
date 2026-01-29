import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getOrdinalSuffix } from "@/lib/time";

const levelColors = [
  "bg-border",
  "bg-[var(--cal-1)]",
  "bg-[var(--cal-2)]",
  "bg-[var(--cal-3)]",
  "bg-[var(--cal-4)]",
];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${month} ${d}${getOrdinalSuffix(d)}`;
}

export const ContributionCalendar = memo(function ContributionCalendar({
  calendar,
}: {
  calendar: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>;
}) {
  const weeks = useMemo(() => {
    const recent = calendar.slice(-365);
    const w: (typeof recent)[] = [];
    for (let i = 0; i < recent.length; i += 7) {
      w.push(recent.slice(i, i + 7));
    }
    return w;
  }, [calendar]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-px p-1 bg-muted/30 rounded-md">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-px">
            {week.map((day) => (
              <div
                key={day.date}
                className={cn("size-1.5 rounded-[2px]", levelColors[day.level])}
                title={`${day.count} contribution${day.count !== 1 ? "s" : ""} on ${formatDate(day.date)}.`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {levelColors.map((color, i) => (
          <div key={i} className={cn("size-1.5 rounded-[2px]", color)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
});
