import { memo } from "react";
import type { Stats } from "@/hooks/github/types";
import { ContributionCalendar } from "./contribution-calendar";

export const StatsSummary = memo(function StatsSummary({ stats }: { stats: Stats }) {
  return (
    <div className="px-4 py-3 border-b border-border/50">
      <div className="flex gap-6 mb-4">
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{stats.totalContributions.toLocaleString()}</span>
          <span className="text-[11px] text-muted-foreground">total</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{stats.commits.toLocaleString()}</span>
          <span className="text-[11px] text-muted-foreground">commits</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{stats.prs}</span>
          <span className="text-[11px] text-muted-foreground">PRs</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{stats.reviews}</span>
          <span className="text-[11px] text-muted-foreground">reviews</span>
        </div>
      </div>
      <ContributionCalendar calendar={stats.calendar} />
    </div>
  );
});
