import { memo, useMemo, useState } from "react";
import type { PR, Issue } from "@/hooks/use-github";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LockIcon, ExpandAllIcon, CollapseAllIcon } from "@/components/icons";
import { TabButton } from "@/components/tab-button";
import { EmptyState } from "@/components/empty-state";
import { ItemCard } from "@/components/item-card";

interface PRSectionProps {
  myPRs: PR[];
  reviewRequests: PR[];
  assignedPRs: PR[];
  prMentions: PR[];
  showPrivate: boolean;
  loading: boolean;
  onTogglePrivate: () => void;
  onSelect: (pr: PR) => void;
}

export const PRSection = memo(function PRSection({
  myPRs,
  reviewRequests,
  assignedPRs,
  prMentions,
  showPrivate,
  loading,
  onTogglePrivate,
  onSelect,
}: PRSectionProps) {
  const [tab, setTab] = useState<"created" | "review" | "assigned" | "mentioned">("created");
  const [expandAll, setExpandAll] = useState(true);

  const allPRs = useMemo(() => {
    switch (tab) {
      case "review":
        return reviewRequests;
      case "created":
        return myPRs;
      case "assigned":
        return assignedPRs;
      case "mentioned":
        return prMentions;
    }
  }, [tab, reviewRequests, myPRs, assignedPRs, prMentions]);

  const prs = useMemo(
    () => (showPrivate ? allPRs : allPRs.filter((p) => !p.isPrivate)),
    [allPRs, showPrivate],
  );

  return (
    <section className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold">Pull Requests</h2>
        <div className="flex items-center gap-0.5">
          <TabButton
            active={tab === "created"}
            onClick={() => setTab("created")}
            count={myPRs.length}
          >
            Created
          </TabButton>
          <TabButton
            active={tab === "review"}
            onClick={() => setTab("review")}
            count={reviewRequests.length}
          >
            Review
          </TabButton>
          <TabButton
            active={tab === "assigned"}
            onClick={() => setTab("assigned")}
            count={assignedPRs.length}
          >
            Assigned
          </TabButton>
          <TabButton
            active={tab === "mentioned"}
            onClick={() => setTab("mentioned")}
            count={prMentions.length}
          >
            @me
          </TabButton>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setExpandAll((v) => !v)}
            className={cn(
              "ml-1",
              expandAll ? "opacity-100 text-primary" : "opacity-50 hover:opacity-100",
            )}
            title={expandAll ? "Collapse all" : "Expand all"}
          >
            {expandAll ? <CollapseAllIcon /> : <ExpandAllIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onTogglePrivate}
            className={cn(
              showPrivate ? "opacity-50 hover:opacity-100" : "opacity-100 text-accent-yellow",
            )}
            title={showPrivate ? "Hide private" : "Show private"}
          >
            <LockIcon />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 h-0">
        <div className="px-4">
          {prs.length === 0 ? (
            <EmptyState loading={loading} />
          ) : (
            <ul>
              {prs.map((p) => (
                <ItemCard
                  key={`${p.repo}-${p.number}`}
                  type="pr"
                  item={p}
                  showAuthor={tab !== "created"}
                  expandAll={expandAll}
                  onSelect={onSelect as (item: PR | Issue) => void}
                />
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </section>
  );
});
