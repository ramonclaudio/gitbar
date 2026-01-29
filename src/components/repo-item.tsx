import { memo } from "react";
import { open } from "@tauri-apps/plugin-shell";
import type { Repo } from "@/hooks/github/types";
import { timeAgo } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import {
  RepoIcon,
  StarIcon,
  ForkIcon,
  EyeIcon,
  IssueIcon,
  PRIcon,
  LockIcon,
} from "@/components/icons";

export const RepoItem = memo(function RepoItem({
  repo: r,
  showOwner,
}: {
  repo: Repo;
  showOwner: boolean;
}) {
  return (
    <li
      className="flex items-start gap-2.5 py-2.5 border-b border-secondary last:border-b-0 cursor-pointer hover:bg-muted transition-colors -mx-4 px-4"
      onClick={() => open(r.url)}
    >
      {r.isPrivate ? (
        <LockIcon className="size-3.5 shrink-0 mt-0.5 text-accent-yellow" />
      ) : (
        <RepoIcon />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-medium text-sm">{showOwner ? r.nameWithOwner : r.name}</span>
          {r.isArchived && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
              Archived
            </Badge>
          )}
          {r.isFork && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
              Fork
            </Badge>
          )}
          {r.isTemplate && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
              Template
            </Badge>
          )}
        </div>
        {r.description && (
          <p className="text-[11px] text-muted-foreground mb-1 line-clamp-1">{r.description}</p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
          {r.language && <span className="text-primary">{r.language}</span>}
          <span className="flex items-center gap-0.5">
            <StarIcon className="size-2.5" /> {r.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5">
            <ForkIcon className="size-2.5 mt-0" /> {r.forks.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5">
            <EyeIcon /> {r.watchers.toLocaleString()}
          </span>
          {r.openIssues > 0 && (
            <span className="flex items-center gap-0.5">
              <IssueIcon className="size-2.5" /> {r.openIssues}
            </span>
          )}
          {r.openPRs > 0 && (
            <span className="flex items-center gap-0.5">
              <PRIcon className="size-2.5" /> {r.openPRs}
            </span>
          )}
          <span className="text-muted-foreground/60">· {timeAgo(r.pushedAt)}</span>
        </div>
        {r.topics.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {r.topics.slice(0, 4).map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary"
              >
                {t}
              </Badge>
            ))}
            {r.topics.length > 4 && (
              <span className="text-[9px] text-muted-foreground">+{r.topics.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </li>
  );
});
