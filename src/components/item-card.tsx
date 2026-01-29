import { memo, useState, useEffect } from "react";
import type { PR, Issue } from "@/hooks/use-github";
import { timeAgo } from "@/lib/time";
import { getReviewBadge } from "@/lib/review-badge";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PRIcon, IssueIcon, CommentIcon, ChevronIcon } from "@/components/icons";
import { LabelBadge } from "./label-badge";

type ItemCardProps = {
  type: "pr" | "issue";
  item: PR | Issue;
  showAuthor: boolean;
  expandAll: boolean;
  onSelect: (item: PR | Issue) => void;
};

export const ItemCard = memo(function ItemCard({
  type,
  item,
  showAuthor,
  expandAll,
  onSelect,
}: ItemCardProps) {
  const [expanded, setExpanded] = useState(expandAll);
  useEffect(() => setExpanded(expandAll), [expandAll]);
  const Icon = type === "pr" ? PRIcon : IssueIcon;
  const pr = type === "pr" ? (item as PR) : null;
  const issue = type === "issue" ? (item as Issue) : null;
  const isDraft = pr?.draft;
  const isCompleted = issue?.stateReason === "completed";
  const isNotPlanned = issue?.stateReason === "not_planned";
  const reviewBadge = pr ? getReviewBadge(pr.reviewDecision, true) : null;
  const showDetails = expanded;

  return (
    <li
      className="py-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted transition-colors -mx-4 px-4"
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start gap-2 mb-1">
        <Icon className="mt-0.5" />
        <div className="flex-1 flex items-start gap-2 min-w-0 flex-wrap">
          <span className="text-sm font-semibold text-foreground leading-snug">{item.title}</span>
          {isDraft && (
            <Badge variant="secondary" className="uppercase text-[10px] shrink-0">
              Draft
            </Badge>
          )}
          {reviewBadge && (
            <Badge className={cn("uppercase text-[10px] shrink-0", reviewBadge.className)}>
              {reviewBadge.text}
            </Badge>
          )}
          {isCompleted && (
            <Badge className="bg-accent-green/20 text-accent-green border-0 uppercase text-[10px] shrink-0">
              Done
            </Badge>
          )}
          {isNotPlanned && (
            <Badge variant="secondary" className="uppercase text-[10px] shrink-0">
              Closed
            </Badge>
          )}
        </div>
        {item.comments > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground shrink-0">
            <CommentIcon />
            <span className="text-[11px]">{item.comments}</span>
          </div>
        )}
        <button
          className="p-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          <ChevronIcon
            className={cn("transition-transform", expanded ? "rotate-180" : "rotate-0")}
          />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 pl-5 flex-wrap">
        <span>
          {item.repo}#{item.number}
        </span>
        {showAuthor && <span>· {item.author}</span>}
        <span>· {timeAgo(item.updatedAt)}</span>
        {pr && (
          <>
            <span className="text-accent-green">+{pr.additions}</span>
            <span className="text-red-400">-{pr.deletions}</span>
            <span>{pr.changedFiles} files</span>
            <span>{pr.commits} commits</span>
          </>
        )}
      </div>
      {showDetails && (
        <>
          {pr && (
            <div className="text-[11px] text-muted-foreground/70 pl-5 mb-1.5 font-mono">
              {pr.headBranch} → {pr.baseBranch}
            </div>
          )}
          {item.snippet && (
            <p className="text-sm text-muted-foreground my-1.5 ml-5 leading-relaxed">
              {item.snippet}
            </p>
          )}
          {item.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-5">
              {item.labels.slice(0, 4).map((l) => (
                <LabelBadge key={l.name} label={l} />
              ))}
            </div>
          )}
          {pr && pr.reviews.length > 0 && (
            <div className="flex items-center gap-1 ml-5 mt-1.5">
              <span className="text-[10px] text-muted-foreground mr-1">Reviews:</span>
              {pr.reviews.slice(0, 4).map((r, i) => (
                <Avatar
                  key={`${r.author?.login}-${r.state}-${i}`}
                  className="size-5 border border-background"
                  title={`${r.author?.login}: ${r.state}`}
                >
                  <AvatarImage src={r.author?.avatarUrl} />
                  <AvatarFallback className="text-[8px]">{r.author?.login?.[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
          {issue && issue.reactionGroups.length > 0 && (
            <div className="flex items-center gap-2 ml-5 mt-1.5">
              {issue.reactionGroups.slice(0, 6).map((r) => (
                <span key={r.emoji} className="text-xs text-muted-foreground">
                  {r.emoji} {r.count}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </li>
  );
});
