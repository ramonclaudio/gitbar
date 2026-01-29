import { memo, useMemo, useState } from "react";
import type { Activity, MyActivity } from "@/hooks/use-github";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabButton } from "@/components/tab-button";
import { EmptyState } from "@/components/empty-state";
import { StatsSummary } from "@/components/stats-summary";
import { MyActivityItem } from "@/components/my-activity-item";
import { OtherActivityItem } from "@/components/other-activity-item";
import type { Stats } from "@/hooks/github/types";

interface ActivitySectionProps {
  stats: Stats;
  myActivity: MyActivity[];
  activity: Activity[];
  loading: boolean;
}

export const ActivitySection = memo(function ActivitySection({
  stats,
  myActivity,
  activity,
  loading,
}: ActivitySectionProps) {
  const [tab, setTab] = useState<"mine" | "others">("others");
  const myItems = useMemo(() => myActivity.slice(0, 10), [myActivity]);
  const otherItems = useMemo(() => activity.slice(0, 10), [activity]);

  return (
    <ScrollArea className="flex-1 h-0">
      <StatsSummary stats={stats} />
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground">Recent</h3>
          <div className="flex gap-0.5">
            <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>
              Mine
            </TabButton>
            <TabButton active={tab === "others"} onClick={() => setTab("others")}>
              Others
            </TabButton>
          </div>
        </div>
        {tab === "mine" ? (
          myActivity.length === 0 ? (
            <EmptyState loading={loading} message="No activity" />
          ) : (
            <ul>
              {myItems.map((a) => (
                <MyActivityItem key={`${a.type}-${a.repo}-${a.createdAt}`} activity={a} />
              ))}
            </ul>
          )
        ) : activity.length === 0 ? (
          <EmptyState loading={loading} message="No activity" />
        ) : (
          <ul>
            {otherItems.map((a) => (
              <OtherActivityItem
                key={`${a.type}-${a.repo}-${a.actor}-${a.createdAt}`}
                activity={a}
              />
            ))}
          </ul>
        )}
      </div>
    </ScrollArea>
  );
});
