import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-shell";
import type { Comment, SelectedItem } from "@/hooks/use-github";
import { fetchAllComments } from "@/hooks/use-github";
import { SafeMarkdown } from "@/components/safe-markdown";
import { useLazyList } from "@/hooks/use-lazy-list";
import { timeAgo } from "@/lib/time";
import { getReviewBadge } from "@/lib/review-badge";
import { cn } from "@/lib/utils";
import { LoadMoreSentinel } from "@/components/load-more-sentinel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BackIcon,
  ExternalIcon,
  ChevronIcon,
  ExpandAllIcon,
  CollapseAllIcon,
} from "@/components/icons";
import { LabelBadge } from "./label-badge";

export function DetailView({
  item,
  onBack,
}: {
  item: NonNullable<SelectedItem>;
  onBack: () => void;
}) {
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [expandAllComments, setExpandAllComments] = useState(true);
  const [collapsedComments, setCollapsedComments] = useState<Set<number>>(new Set());
  const commentLazy = useLazyList(allComments, 10, 10);

  useEffect(() => {
    let stale = false;
    setLoadingComments(true);
    setCommentError(null);
    fetchAllComments(item.repo, item.number, item.type === "pr")
      .then((c) => {
        if (!stale) {
          setAllComments(c);
          setLoadingComments(false);
        }
      })
      .catch(() => {
        if (!stale) {
          setCommentError("Failed to load comments");
          setLoadingComments(false);
        }
      });
    return () => {
      stale = true;
    };
  }, [item.repo, item.number]);

  const isPR = item.type === "pr";
  const reviewBadge = isPR ? getReviewBadge(item.reviewDecision) : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <BackIcon />
        </Button>
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {isPR ? "Pull Request" : "Issue"}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => open(item.url)}>
          <ExternalIcon />
        </Button>
      </div>

      <ScrollArea className="flex-1 h-0">
        <div className="p-5">
          <div className="mb-3">
            <div className="flex items-start gap-2 mb-2">
              <h1 className="text-xl font-semibold text-foreground leading-tight">{item.title}</h1>
              {isPR && item.draft && (
                <Badge variant="secondary" className="uppercase text-[10px] shrink-0">
                  Draft
                </Badge>
              )}
              {reviewBadge && (
                <Badge className={cn("uppercase text-[10px] shrink-0", reviewBadge.className)}>
                  {reviewBadge.text}
                </Badge>
              )}
              {!isPR && item.isPinned && (
                <Badge variant="secondary" className="uppercase text-[10px] shrink-0">
                  📌 Pinned
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary">{item.repo}</span>
              <span>#{item.number}</span>
            </div>
          </div>

          {isPR && item.headBranch && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <div className="font-mono text-sm mb-3">
                <span className="text-primary">{item.headBranch}</span>
                <span className="text-muted-foreground mx-2">→</span>
                <span className="text-muted-foreground">{item.baseBranch}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-accent-green font-semibold">
                    +{item.additions?.toLocaleString()}
                  </span>
                  <span className="text-red-400 font-semibold">
                    -{item.deletions?.toLocaleString()}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  {item.changedFiles} {item.changedFiles === 1 ? "file" : "files"} changed
                </div>
                <div className="text-muted-foreground">
                  {item.commits} {item.commits === 1 ? "commit" : "commits"}
                </div>
              </div>
            </div>
          )}

          {isPR && (item.reviews?.length || item.reviewRequests?.length) ? (
            <div className="flex flex-wrap gap-4 mb-4">
              {item.reviews && item.reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Reviews:</span>
                  {item.reviews.map((r, i) => (
                    <div
                      key={`${r.author?.login}-${r.state}-${i}`}
                      className="flex items-center gap-1"
                    >
                      <Avatar className="size-5" title={`${r.author?.login}: ${r.state}`}>
                        <AvatarImage src={r.author?.avatarUrl} />
                        <AvatarFallback className="text-[8px]">
                          {r.author?.login?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "text-[10px]",
                          r.state === "APPROVED"
                            ? "text-accent-green"
                            : r.state === "CHANGES_REQUESTED"
                              ? "text-red-400"
                              : "text-muted-foreground",
                        )}
                      >
                        {r.state === "APPROVED" ? "✓" : r.state === "CHANGES_REQUESTED" ? "✗" : "◉"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {item.reviewRequests && item.reviewRequests.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Requested:</span>
                  {item.reviewRequests.map((r, i) => (
                    <Avatar
                      key={`${r.login || r.teamName}-${i}`}
                      className="size-5"
                      title={r.login || r.teamName}
                    >
                      {r.avatarUrl ? (
                        <>
                          <AvatarImage src={r.avatarUrl} />
                          <AvatarFallback className="text-[8px]">{r.login?.[0]}</AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback className="text-[8px]">{r.teamName?.[0]}</AvatarFallback>
                      )}
                    </Avatar>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {!isPR && (item.linkedBranches?.length || item.trackedIn || item.tracks) ? (
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              {item.linkedBranches && item.linkedBranches.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-muted-foreground">Linked branches: </span>
                  <span className="font-mono text-sm text-primary">
                    {item.linkedBranches.join(", ")}
                  </span>
                </div>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground">
                {item.tracks && item.tracks > 0 && (
                  <span>
                    Tracks {item.tracks} {item.tracks === 1 ? "issue" : "issues"}
                  </span>
                )}
                {item.trackedIn && item.trackedIn > 0 && (
                  <span>
                    Tracked in {item.trackedIn} {item.trackedIn === 1 ? "issue" : "issues"}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 items-center my-4 pb-4 border-b border-border">
            {item.authorAvatar && (
              <Avatar className="size-5">
                <AvatarImage src={item.authorAvatar} />
                <AvatarFallback>{item.author[0]}</AvatarFallback>
              </Avatar>
            )}
            <Badge variant="outline" className="rounded-full">
              {item.author}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              <span className="text-muted-foreground">created</span> {timeAgo(item.createdAt)}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              <span className="text-muted-foreground">updated</span> {timeAgo(item.updatedAt)}
            </Badge>
            {!isPR && item.closedAt && (
              <Badge variant="outline" className="rounded-full">
                <span className="text-muted-foreground">closed</span> {timeAgo(item.closedAt)}
              </Badge>
            )}
            {item.assignees.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">→</span>
                {item.assignees.map((a) => (
                  <Avatar key={a.login} className="size-5" title={a.login}>
                    <AvatarImage src={a.avatarUrl} />
                    <AvatarFallback className="text-[8px]">{a.login[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
            {item.milestone && (
              <Badge variant="outline" className="rounded-full">
                {item.milestone}
              </Badge>
            )}
            {!isPR && item.participants && item.participants > 1 && (
              <Badge variant="outline" className="rounded-full">
                {item.participants} participants
              </Badge>
            )}
          </div>

          {!isPR && item.reactionGroups && item.reactionGroups.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.reactionGroups.map((r) => (
                <span
                  key={r.emoji}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-sm"
                >
                  {r.emoji} <span className="text-muted-foreground">{r.count}</span>
                </span>
              ))}
            </div>
          )}

          {item.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.labels.map((l) => (
                <LabelBadge key={l.name} label={l} />
              ))}
            </div>
          )}

          {item.body && (
            <div>
              <SafeMarkdown
                className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
                repo={item.repo}
              >
                {bodyExpanded ? item.body : item.body.split("\n").slice(0, 10).join("\n")}
              </SafeMarkdown>
              {item.body.split("\n").length > 10 && (
                <button
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors mt-2"
                  onClick={() => setBodyExpanded((v) => !v)}
                >
                  <ChevronIcon
                    className={cn("transition-transform", bodyExpanded ? "rotate-180" : "rotate-0")}
                  />
                  {bodyExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Comments ({item.comments})</h3>
              {allComments.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setExpandAllComments((v) => !v);
                    setCollapsedComments(new Set());
                  }}
                  className={cn(
                    expandAllComments ? "opacity-100 text-primary" : "opacity-50 hover:opacity-100",
                  )}
                  title={expandAllComments ? "Collapse all comments" : "Expand all comments"}
                >
                  {expandAllComments ? <CollapseAllIcon /> : <ExpandAllIcon />}
                </Button>
              )}
            </div>
            {loadingComments ? (
              <p className="text-sm text-muted-foreground py-4">Loading...</p>
            ) : commentError ? (
              <p className="text-sm text-destructive py-4">{commentError}</p>
            ) : allComments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No comments yet</p>
            ) : (
              <div className="flex flex-col gap-4">
                {commentLazy.visible.map((c) => {
                  const commentOpen = expandAllComments
                    ? !collapsedComments.has(c.id)
                    : collapsedComments.has(c.id);
                  return (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={c.authorAvatar} alt={c.author} />
                        <AvatarFallback>{c.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 border border-border rounded-md overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted border-b border-border">
                          <span className="text-sm font-semibold">{c.author}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {timeAgo(c.createdAt)}
                          </span>
                        </div>
                        <SafeMarkdown
                          className="px-4 py-3 text-sm prose prose-sm dark:prose-invert max-w-none"
                          repo={item.repo}
                        >
                          {commentOpen ? c.body : c.body.split("\n").slice(0, 10).join("\n")}
                        </SafeMarkdown>
                        {c.body.split("\n").length > 10 && (
                          <button
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-4 pb-3"
                            onClick={() =>
                              setCollapsedComments((prev) => {
                                const next = new Set(prev);
                                if (next.has(c.id)) next.delete(c.id);
                                else next.add(c.id);
                                return next;
                              })
                            }
                          >
                            <ChevronIcon
                              className={cn(
                                "transition-transform",
                                commentOpen ? "rotate-180" : "rotate-0",
                              )}
                            />
                            {commentOpen ? "Show less" : "Show more"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <LoadMoreSentinel onLoadMore={commentLazy.loadMore} hasMore={commentLazy.hasMore} />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
