import { memo, useMemo, useState } from "react";
import type { Issue, PR } from "@/hooks/use-github";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LockIcon, ExpandAllIcon, CollapseAllIcon } from "@/components/icons";
import { TabButton } from "@/components/tab-button";
import { EmptyState } from "@/components/empty-state";
import { ItemCard } from "@/components/item-card";

interface IssueSectionProps {
  myIssues: Issue[];
  assignedIssues: Issue[];
  issueMentions: Issue[];
  showPrivate: boolean;
  loading: boolean;
  onTogglePrivate: () => void;
  onSelect: (issue: Issue) => void;
}

export const IssueSection = memo(function IssueSection({
  myIssues,
  assignedIssues,
  issueMentions,
  showPrivate,
  loading,
  onTogglePrivate,
  onSelect,
}: IssueSectionProps) {
  const [tab, setTab] = useState<"created" | "assigned" | "mentioned">("created");
  const [expandAll, setExpandAll] = useState(true);

  const allIssues = useMemo(() => {
    switch (tab) {
      case "created":
        return myIssues;
      case "assigned":
        return assignedIssues;
      case "mentioned":
        return issueMentions;
    }
  }, [tab, myIssues, assignedIssues, issueMentions]);

  const issues = useMemo(
    () => (showPrivate ? allIssues : allIssues.filter((i) => !i.isPrivate)),
    [allIssues, showPrivate],
  );

  return (
    <section className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold">Issues</h2>
        <div className="flex items-center gap-0.5">
          <TabButton
            active={tab === "created"}
            onClick={() => setTab("created")}
            count={myIssues.length}
          >
            Created
          </TabButton>
          <TabButton
            active={tab === "assigned"}
            onClick={() => setTab("assigned")}
            count={assignedIssues.length}
          >
            Assigned
          </TabButton>
          <TabButton
            active={tab === "mentioned"}
            onClick={() => setTab("mentioned")}
            count={issueMentions.length}
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
          {issues.length === 0 ? (
            <EmptyState loading={loading} />
          ) : (
            <ul>
              {issues.map((i) => (
                <ItemCard
                  key={`${i.repo}-${i.number}`}
                  type="issue"
                  item={i}
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
