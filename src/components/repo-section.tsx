import { memo, useMemo, useState } from "react";
import type { Repo } from "@/hooks/github/types";
import { useLazyList } from "@/hooks/use-lazy-list";
import { LoadMoreSentinel } from "@/components/load-more-sentinel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabButton } from "@/components/tab-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LockIcon } from "@/components/icons";
import { RepoItem } from "@/components/repo-item";

interface RepoSectionProps {
  myRepos: Repo[];
  contributedTo: Repo[];
  showPrivate: boolean;
  onTogglePrivate: () => void;
}

export const RepoSection = memo(function RepoSection({
  myRepos,
  contributedTo,
  showPrivate,
  onTogglePrivate,
}: RepoSectionProps) {
  const [tab, setTab] = useState<"mine" | "contributed">("mine");
  const allRepos = tab === "mine" ? myRepos : contributedTo;
  const repos = useMemo(
    () => (showPrivate ? allRepos : allRepos.filter((r) => !r.isPrivate)),
    [allRepos, showPrivate],
  );
  const lazy = useLazyList(repos, 10, 10);

  return (
    <>
      <div className="flex justify-between items-center px-4 py-3 border-b border-border shrink-0">
        <h3 className="text-xs font-semibold text-muted-foreground">Repositories</h3>
        <div className="flex items-center gap-1">
          <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>
            Mine
          </TabButton>
          <TabButton active={tab === "contributed"} onClick={() => setTab("contributed")}>
            Contrib
          </TabButton>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onTogglePrivate}
            className={cn(
              "ml-1",
              showPrivate ? "opacity-50 hover:opacity-100" : "opacity-100 text-accent-yellow",
            )}
            title={showPrivate ? "Hide private" : "Show private"}
          >
            <LockIcon />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 h-0">
        <div className="px-4 py-3">
          <ul>
            {lazy.visible.map((r) => (
              <RepoItem key={r.nameWithOwner} repo={r} showOwner={tab !== "mine"} />
            ))}
            <LoadMoreSentinel onLoadMore={lazy.loadMore} hasMore={lazy.hasMore} />
          </ul>
        </div>
      </ScrollArea>
    </>
  );
});
