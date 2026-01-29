import type {
  PR,
  Issue,
  Repo,
  Activity,
  MyActivity,
  GQLPullRequest,
  GQLIssue,
  GQLRepo,
  GitHubEvent,
} from "./types";

export function makeSnippet(body: string | null, maxLength = 150): string {
  if (!body) return "";
  const stripped = body
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > maxLength ? `${stripped.slice(0, maxLength)}...` : stripped;
}

export const reactionEmoji: Record<string, string> = {
  THUMBS_UP: "👍",
  THUMBS_DOWN: "👎",
  LAUGH: "😄",
  HOORAY: "🎉",
  CONFUSED: "😕",
  HEART: "❤️",
  ROCKET: "🚀",
  EYES: "👀",
};

export function mapPR(p: GQLPullRequest): PR {
  return {
    number: p.number,
    title: p.title,
    body: p.body,
    snippet: makeSnippet(p.body),
    url: p.url,
    repo: p.repository.nameWithOwner,
    isPrivate: p.repository.isPrivate,
    author: p.author?.login || "ghost",
    authorAvatar: p.author?.avatarUrl || "",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    comments: p.comments.totalCount,
    labels: p.labels.nodes.map((l) => ({ name: l.name, color: l.color })),
    assignees: p.assignees.nodes.map((a) => ({ login: a.login, avatarUrl: a.avatarUrl })),
    milestone: p.milestone?.title || null,
    draft: p.isDraft,
    additions: p.additions,
    deletions: p.deletions,
    changedFiles: p.changedFiles,
    commits: p.commits.totalCount,
    headBranch: p.headRefName,
    baseBranch: p.baseRefName,
    reviewDecision: p.reviewDecision,
    reviews: p.latestReviews.nodes.map((r) => ({ state: r.state, author: r.author })),
    reviewRequests: p.reviewRequests.nodes.map((r) => ({
      login: r.requestedReviewer?.login,
      avatarUrl: r.requestedReviewer?.avatarUrl,
      teamName: r.requestedReviewer?.name,
    })),
  };
}

export function mapIssue(i: GQLIssue): Issue {
  return {
    number: i.number,
    title: i.title,
    body: i.body,
    snippet: makeSnippet(i.body),
    url: i.url,
    repo: i.repository.nameWithOwner,
    isPrivate: i.repository.isPrivate,
    author: i.author?.login || "ghost",
    authorAvatar: i.author?.avatarUrl || "",
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    closedAt: i.closedAt,
    comments: i.comments.totalCount,
    labels: i.labels.nodes.map((l) => ({ name: l.name, color: l.color })),
    assignees: i.assignees.nodes.map((a) => ({ login: a.login, avatarUrl: a.avatarUrl })),
    milestone: i.milestone?.title || null,
    stateReason: i.stateReason,
    reactionGroups: i.reactionGroups
      .filter((g) => g.users.totalCount > 0)
      .map((g) => ({ emoji: reactionEmoji[g.content] || g.content, count: g.users.totalCount })),
    participants: i.participants.totalCount,
    isPinned: i.isPinned,
    trackedIn: i.trackedInIssues.totalCount,
    tracks: i.trackedIssues.totalCount,
    linkedBranches: i.linkedBranches.nodes.filter((n) => n.ref).map((n) => n.ref!.name),
  };
}

export function mapRepo(r: GQLRepo): Repo {
  return {
    name: r.name,
    nameWithOwner: r.nameWithOwner,
    description: r.description,
    language: r.primaryLanguage?.name || null,
    stars: r.stargazerCount,
    forks: r.forkCount,
    watchers: r.watchers.totalCount,
    openIssues: r.issues.totalCount,
    openPRs: r.pullRequests.totalCount,
    pushedAt: r.pushedAt,
    url: r.url,
    isPrivate: r.isPrivate,
    isArchived: r.isArchived,
    isTemplate: r.isTemplate,
    isFork: r.isFork,
    topics: r.repositoryTopics.nodes.map((t) => t.topic.name),
  };
}

export function mapContributionLevel(level: string): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case "FIRST_QUARTILE":
      return 1;
    case "SECOND_QUARTILE":
      return 2;
    case "THIRD_QUARTILE":
      return 3;
    case "FOURTH_QUARTILE":
      return 4;
    default:
      return 0;
  }
}

export function mapRepoActivity(repos: GQLRepo[]): Activity[] {
  return repos
    .flatMap((repo) => [
      ...(repo.stargazers?.edges.map((edge) => ({
        type: "star" as const,
        repo: repo.name,
        repoUrl: repo.url,
        actor: edge.node.login,
        actorAvatar: edge.node.avatarUrl,
        actorUrl: edge.node.url,
        createdAt: edge.starredAt,
      })) ?? []),
      ...(repo.forks?.nodes.map((fork) => ({
        type: "fork" as const,
        repo: repo.name,
        repoUrl: repo.url,
        actor: fork.owner.login,
        actorAvatar: fork.owner.avatarUrl,
        actorUrl: fork.owner.url,
        createdAt: fork.createdAt,
        forkName: fork.nameWithOwner,
        forkUrl: fork.url,
      })) ?? []),
    ])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function mapEvent(e: GitHubEvent): MyActivity | null {
  const base = {
    repo: e.repo.name,
    repoUrl: `https://github.com/${e.repo.name}`,
    createdAt: e.created_at,
  };

  switch (e.type) {
    case "PushEvent":
      return {
        ...base,
        type: "push",
        commits: e.payload.size,
        ref: e.payload.ref?.replace("refs/heads/", ""),
      };
    case "PullRequestEvent":
      return {
        ...base,
        type: "pr",
        title: e.payload.pull_request?.title,
        url: e.payload.pull_request?.html_url,
        action: e.payload.action,
      };
    case "IssuesEvent":
      return {
        ...base,
        type: "issue",
        title: e.payload.issue?.title,
        url: e.payload.issue?.html_url,
        action: e.payload.action,
      };
    case "PullRequestReviewEvent":
      return {
        ...base,
        type: "review",
        title: e.payload.pull_request?.title,
        url: e.payload.pull_request?.html_url,
        action: e.payload.action,
      };
    case "IssueCommentEvent":
    case "CommitCommentEvent":
    case "PullRequestReviewCommentEvent":
      return { ...base, type: "comment", url: e.payload.comment?.html_url };
    case "CreateEvent":
      return {
        ...base,
        type: "create",
        ref: e.payload.ref || undefined,
        refType: e.payload.ref_type,
      };
    case "DeleteEvent":
      return {
        ...base,
        type: "delete",
        ref: e.payload.ref || undefined,
        refType: e.payload.ref_type,
      };
    case "ForkEvent":
      return {
        ...base,
        type: "fork",
        title: e.payload.forkee?.full_name,
        url: e.payload.forkee?.html_url,
      };
    case "WatchEvent":
      return { ...base, type: "star" };
    case "ReleaseEvent":
      return {
        ...base,
        type: "release",
        title: e.payload.release?.name,
        url: e.payload.release?.html_url,
        action: e.payload.action,
      };
    default:
      return null;
  }
}
