import { describe, expect, it } from "vitest";
import {
  makeSnippet,
  reactionEmoji,
  mapPR,
  mapIssue,
  mapRepo,
  mapContributionLevel,
  mapEvent,
} from "./mappers";
import type { GQLPullRequest, GQLIssue, GQLRepo, GitHubEvent } from "./types";

describe("makeSnippet", () => {
  it("returns empty string for null", () => {
    expect(makeSnippet(null)).toBe("");
  });

  it("returns empty string for empty body", () => {
    expect(makeSnippet("")).toBe("");
  });

  it("strips markdown headings", () => {
    expect(makeSnippet("# Hello\n## World")).toBe("Hello World");
  });

  it("strips bold and italic", () => {
    expect(makeSnippet("**bold** and *italic*")).toBe("bold and italic");
  });

  it("strips links", () => {
    expect(makeSnippet("[click](http://example.com)")).toBe("click");
  });

  it("strips inline code", () => {
    expect(makeSnippet("`code here`")).toBe("code here");
  });

  it("strips list markers", () => {
    expect(makeSnippet("- item one\n* item two\n1. item three")).toBe(
      "item one item two item three",
    );
  });

  it("truncates at maxLength", () => {
    const long = "a".repeat(200);
    const result = makeSnippet(long, 150);
    expect(result.length).toBe(153); // 150 + "..."
    expect(result.endsWith("...")).toBe(true);
  });

  it("does not truncate short strings", () => {
    expect(makeSnippet("short")).toBe("short");
  });

  it("collapses whitespace", () => {
    expect(makeSnippet("hello\n\n\nworld   test")).toBe("hello world test");
  });
});

describe("reactionEmoji", () => {
  it("maps all GitHub reaction types", () => {
    expect(reactionEmoji.THUMBS_UP).toBe("👍");
    expect(reactionEmoji.THUMBS_DOWN).toBe("👎");
    expect(reactionEmoji.LAUGH).toBe("😄");
    expect(reactionEmoji.HOORAY).toBe("🎉");
    expect(reactionEmoji.CONFUSED).toBe("😕");
    expect(reactionEmoji.HEART).toBe("❤️");
    expect(reactionEmoji.ROCKET).toBe("🚀");
    expect(reactionEmoji.EYES).toBe("👀");
  });
});

describe("mapContributionLevel", () => {
  it("maps quartile strings to numbers", () => {
    expect(mapContributionLevel("FIRST_QUARTILE")).toBe(1);
    expect(mapContributionLevel("SECOND_QUARTILE")).toBe(2);
    expect(mapContributionLevel("THIRD_QUARTILE")).toBe(3);
    expect(mapContributionLevel("FOURTH_QUARTILE")).toBe(4);
  });

  it("defaults to 0 for unknown", () => {
    expect(mapContributionLevel("NONE")).toBe(0);
    expect(mapContributionLevel("")).toBe(0);
    expect(mapContributionLevel("UNKNOWN")).toBe(0);
  });
});

const mockGQLPR: GQLPullRequest = {
  number: 42,
  title: "Fix bug",
  body: "**Details** here",
  url: "https://github.com/owner/repo/pull/42",
  repository: { nameWithOwner: "owner/repo", isPrivate: false },
  author: { login: "alice", avatarUrl: "https://avatar.url/alice" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
  comments: { totalCount: 5 },
  labels: { nodes: [{ name: "bug", color: "ff0000" }] },
  assignees: { nodes: [{ login: "bob", avatarUrl: "https://avatar.url/bob" }] },
  milestone: { title: "v1.0" },
  isDraft: true,
  additions: 10,
  deletions: 3,
  changedFiles: 2,
  commits: { totalCount: 1 },
  headRefName: "fix/bug",
  baseRefName: "main",
  reviewDecision: "APPROVED",
  latestReviews: {
    nodes: [
      { state: "APPROVED", author: { login: "carol", avatarUrl: "https://avatar.url/carol" } },
    ],
  },
  reviewRequests: {
    nodes: [{ requestedReviewer: { login: "dave", avatarUrl: "https://avatar.url/dave" } }],
  },
};

describe("mapPR", () => {
  it("maps GQL PR to domain PR", () => {
    const pr = mapPR(mockGQLPR);
    expect(pr.number).toBe(42);
    expect(pr.title).toBe("Fix bug");
    expect(pr.snippet).toBe("Details here");
    expect(pr.repo).toBe("owner/repo");
    expect(pr.isPrivate).toBe(false);
    expect(pr.author).toBe("alice");
    expect(pr.draft).toBe(true);
    expect(pr.additions).toBe(10);
    expect(pr.deletions).toBe(3);
    expect(pr.changedFiles).toBe(2);
    expect(pr.commits).toBe(1);
    expect(pr.headBranch).toBe("fix/bug");
    expect(pr.baseBranch).toBe("main");
    expect(pr.reviewDecision).toBe("APPROVED");
    expect(pr.labels).toEqual([{ name: "bug", color: "ff0000" }]);
    expect(pr.assignees).toEqual([{ login: "bob", avatarUrl: "https://avatar.url/bob" }]);
    expect(pr.milestone).toBe("v1.0");
    expect(pr.reviews).toEqual([
      { state: "APPROVED", author: { login: "carol", avatarUrl: "https://avatar.url/carol" } },
    ]);
    expect(pr.reviewRequests).toEqual([
      { login: "dave", avatarUrl: "https://avatar.url/dave", teamName: undefined },
    ]);
  });

  it("handles null author", () => {
    const pr = mapPR({ ...mockGQLPR, author: null });
    expect(pr.author).toBe("ghost");
    expect(pr.authorAvatar).toBe("");
  });

  it("handles null milestone", () => {
    const pr = mapPR({ ...mockGQLPR, milestone: null });
    expect(pr.milestone).toBeNull();
  });
});

const mockGQLIssue: GQLIssue = {
  number: 7,
  title: "Feature request",
  body: "Please add X",
  url: "https://github.com/owner/repo/issues/7",
  repository: { nameWithOwner: "owner/repo", isPrivate: true },
  author: { login: "eve", avatarUrl: "https://avatar.url/eve" },
  createdAt: "2024-02-01T00:00:00Z",
  updatedAt: "2024-02-02T00:00:00Z",
  closedAt: null,
  comments: { totalCount: 2 },
  labels: { nodes: [{ name: "enhancement", color: "00ff00" }] },
  assignees: { nodes: [] },
  milestone: null,
  stateReason: null,
  reactionGroups: [
    { content: "THUMBS_UP", users: { totalCount: 2 } },
    { content: "HEART", users: { totalCount: 1 } },
    { content: "LAUGH", users: { totalCount: 0 } },
  ],
  participants: { totalCount: 4 },
  isPinned: true,
  trackedInIssues: { totalCount: 1 },
  trackedIssues: { totalCount: 0 },
  linkedBranches: { nodes: [{ ref: { name: "feat/x" } }, { ref: null }] },
};

describe("mapIssue", () => {
  it("maps GQL Issue to domain Issue", () => {
    const issue = mapIssue(mockGQLIssue);
    expect(issue.number).toBe(7);
    expect(issue.title).toBe("Feature request");
    expect(issue.repo).toBe("owner/repo");
    expect(issue.isPrivate).toBe(true);
    expect(issue.isPinned).toBe(true);
    expect(issue.participants).toBe(4);
    expect(issue.trackedIn).toBe(1);
    expect(issue.tracks).toBe(0);
    expect(issue.linkedBranches).toEqual(["feat/x"]);
  });

  it("filters zero-count reaction groups", () => {
    const issue = mapIssue(mockGQLIssue);
    expect(issue.reactionGroups).toHaveLength(2);
    expect(issue.reactionGroups[0]).toEqual({ emoji: "👍", count: 2 });
    expect(issue.reactionGroups[1]).toEqual({ emoji: "❤️", count: 1 });
  });

  it("filters null branch refs", () => {
    const issue = mapIssue(mockGQLIssue);
    expect(issue.linkedBranches).toEqual(["feat/x"]);
  });
});

const mockGQLRepo: GQLRepo = {
  name: "my-repo",
  nameWithOwner: "alice/my-repo",
  description: "A test repo",
  primaryLanguage: { name: "TypeScript" },
  stargazerCount: 100,
  forkCount: 10,
  watchers: { totalCount: 50 },
  issues: { totalCount: 5 },
  pullRequests: { totalCount: 3 },
  pushedAt: "2024-01-15T00:00:00Z",
  url: "https://github.com/alice/my-repo",
  isPrivate: false,
  isArchived: false,
  isTemplate: true,
  isFork: false,
  repositoryTopics: { nodes: [{ topic: { name: "typescript" } }, { topic: { name: "tauri" } }] },
};

describe("mapRepo", () => {
  it("maps GQL Repo to domain Repo", () => {
    const repo = mapRepo(mockGQLRepo);
    expect(repo.name).toBe("my-repo");
    expect(repo.nameWithOwner).toBe("alice/my-repo");
    expect(repo.language).toBe("TypeScript");
    expect(repo.stars).toBe(100);
    expect(repo.forks).toBe(10);
    expect(repo.watchers).toBe(50);
    expect(repo.openIssues).toBe(5);
    expect(repo.openPRs).toBe(3);
    expect(repo.isTemplate).toBe(true);
    expect(repo.topics).toEqual(["typescript", "tauri"]);
  });

  it("handles null language", () => {
    const repo = mapRepo({ ...mockGQLRepo, primaryLanguage: null });
    expect(repo.language).toBeNull();
  });
});

describe("mapEvent", () => {
  const base: GitHubEvent = {
    type: "PushEvent",
    repo: { name: "alice/repo", url: "https://api.github.com/repos/alice/repo" },
    created_at: "2024-01-01T00:00:00Z",
    payload: { size: 3, ref: "refs/heads/main" },
  };

  it("maps PushEvent", () => {
    const result = mapEvent(base);
    expect(result).toEqual({
      type: "push",
      repo: "alice/repo",
      repoUrl: "https://github.com/alice/repo",
      createdAt: "2024-01-01T00:00:00Z",
      commits: 3,
      ref: "main",
    });
  });

  it("maps PullRequestEvent", () => {
    const result = mapEvent({
      ...base,
      type: "PullRequestEvent",
      payload: { action: "opened", pull_request: { title: "PR", html_url: "https://pr.url" } },
    });
    expect(result!.type).toBe("pr");
    expect(result!.title).toBe("PR");
    expect(result!.action).toBe("opened");
  });

  it("maps IssuesEvent", () => {
    const result = mapEvent({
      ...base,
      type: "IssuesEvent",
      payload: { action: "closed", issue: { title: "Bug", html_url: "https://issue.url" } },
    });
    expect(result!.type).toBe("issue");
    expect(result!.action).toBe("closed");
  });

  it("maps WatchEvent as star", () => {
    const result = mapEvent({ ...base, type: "WatchEvent", payload: {} });
    expect(result!.type).toBe("star");
  });

  it("maps ForkEvent", () => {
    const result = mapEvent({
      ...base,
      type: "ForkEvent",
      payload: { forkee: { full_name: "bob/fork", html_url: "https://fork.url" } },
    });
    expect(result!.type).toBe("fork");
    expect(result!.title).toBe("bob/fork");
  });

  it("maps CreateEvent", () => {
    const result = mapEvent({
      ...base,
      type: "CreateEvent",
      payload: { ref: "v1.0", ref_type: "tag" },
    });
    expect(result!.type).toBe("create");
    expect(result!.ref).toBe("v1.0");
    expect(result!.refType).toBe("tag");
  });

  it("maps DeleteEvent", () => {
    const result = mapEvent({
      ...base,
      type: "DeleteEvent",
      payload: { ref: "old-branch", ref_type: "branch" },
    });
    expect(result!.type).toBe("delete");
  });

  it("maps comment events", () => {
    for (const type of [
      "IssueCommentEvent",
      "CommitCommentEvent",
      "PullRequestReviewCommentEvent",
    ]) {
      const result = mapEvent({
        ...base,
        type,
        payload: { comment: { html_url: "https://comment.url" } },
      });
      expect(result!.type).toBe("comment");
    }
  });

  it("maps ReleaseEvent", () => {
    const result = mapEvent({
      ...base,
      type: "ReleaseEvent",
      payload: { action: "published", release: { name: "v1.0", html_url: "https://release.url" } },
    });
    expect(result!.type).toBe("release");
  });

  it("returns null for unknown events", () => {
    expect(mapEvent({ ...base, type: "UnknownEvent", payload: {} })).toBeNull();
  });
});
