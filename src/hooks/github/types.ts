export interface Label {
  name: string;
  color: string;
}

export interface Assignee {
  login: string;
  avatarUrl: string;
}

export interface Review {
  state: string;
  author: { login: string; avatarUrl: string } | null;
}

export interface ReviewRequest {
  login?: string;
  avatarUrl?: string;
  teamName?: string;
}

export interface PR {
  number: number;
  title: string;
  body: string | null;
  snippet: string;
  url: string;
  repo: string;
  isPrivate: boolean;
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  comments: number;
  labels: Label[];
  assignees: Assignee[];
  milestone: string | null;
  draft: boolean;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  headBranch: string;
  baseBranch: string;
  reviewDecision: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null;
  reviews: Review[];
  reviewRequests: ReviewRequest[];
}

export interface Reaction {
  emoji: string;
  count: number;
}

export interface Issue {
  number: number;
  title: string;
  body: string | null;
  snippet: string;
  url: string;
  repo: string;
  isPrivate: boolean;
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  comments: number;
  labels: Label[];
  assignees: Assignee[];
  milestone: string | null;
  stateReason: string | null;
  reactionGroups: Reaction[];
  participants: number;
  isPinned: boolean;
  trackedIn: number;
  tracks: number;
  linkedBranches: string[];
}

export interface Repo {
  name: string;
  nameWithOwner: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  openPRs: number;
  pushedAt: string;
  url: string;
  isPrivate: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  isFork: boolean;
  topics: string[];
}

export interface Activity {
  type: "star" | "fork";
  repo: string;
  repoUrl: string;
  actor: string;
  actorAvatar: string;
  actorUrl: string;
  createdAt: string;
  forkName?: string;
  forkUrl?: string;
}

export interface MyActivity {
  type:
    | "push"
    | "pr"
    | "issue"
    | "review"
    | "comment"
    | "create"
    | "delete"
    | "fork"
    | "star"
    | "release";
  repo: string;
  repoUrl: string;
  createdAt: string;
  title?: string;
  url?: string;
  ref?: string;
  refType?: string;
  commits?: number;
  action?: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface Stats {
  totalContributions: number;
  commits: number;
  prs: number;
  reviews: number;
  calendar: ContributionDay[];
}

export interface Comment {
  id: number;
  body: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface CachedData {
  reviewRequests: PR[];
  prMentions: PR[];
  issueMentions: Issue[];
  myPRs: PR[];
  assignedPRs: PR[];
  myIssues: Issue[];
  assignedIssues: Issue[];
  myRepos: Repo[];
  contributedTo: Repo[];
  activity: Activity[];
  myActivity: MyActivity[];
  stats: Stats;
  timestamp: number;
}

export interface Data extends Omit<CachedData, "timestamp"> {
  loading: boolean;
  error: string | null;
  load: () => void;
  refresh: () => Promise<void>;
}

export type SelectedItem = (PR & { type: "pr" }) | (Issue & { type: "issue" }) | null;

// GraphQL Response Types

export interface GQLRepo {
  name: string;
  nameWithOwner: string;
  description: string | null;
  primaryLanguage: { name: string } | null;
  stargazerCount: number;
  forkCount: number;
  watchers: { totalCount: number };
  issues: { totalCount: number };
  pullRequests: { totalCount: number };
  pushedAt: string;
  url: string;
  isPrivate: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  isFork: boolean;
  repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
  stargazers?: {
    edges: Array<{ starredAt: string; node: { login: string; avatarUrl: string; url: string } }>;
  };
  forks?: {
    nodes: Array<{
      owner: { login: string; avatarUrl: string; url: string };
      createdAt: string;
      nameWithOwner: string;
      url: string;
    }>;
  };
}

export interface GQLPullRequest {
  number: number;
  title: string;
  body: string | null;
  url: string;
  repository: { nameWithOwner: string; isPrivate: boolean };
  author: { login: string; avatarUrl: string } | null;
  createdAt: string;
  updatedAt: string;
  comments: { totalCount: number };
  labels: { nodes: Array<{ name: string; color: string }> };
  assignees: { nodes: Array<{ login: string; avatarUrl: string }> };
  milestone: { title: string } | null;
  isDraft: boolean;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: { totalCount: number };
  headRefName: string;
  baseRefName: string;
  reviewDecision: "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null;
  latestReviews: {
    nodes: Array<{ state: string; author: { login: string; avatarUrl: string } | null }>;
  };
  reviewRequests: {
    nodes: Array<{
      requestedReviewer: { login?: string; avatarUrl?: string; name?: string } | null;
    }>;
  };
}

export interface GQLIssue {
  number: number;
  title: string;
  body: string | null;
  url: string;
  repository: { nameWithOwner: string; isPrivate: boolean };
  author: { login: string; avatarUrl: string } | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  comments: { totalCount: number };
  labels: { nodes: Array<{ name: string; color: string }> };
  assignees: { nodes: Array<{ login: string; avatarUrl: string }> };
  milestone: { title: string } | null;
  stateReason: string | null;
  reactionGroups: Array<{ content: string; users: { totalCount: number } }>;
  participants: { totalCount: number };
  isPinned: boolean;
  trackedInIssues: { totalCount: number };
  trackedIssues: { totalCount: number };
  linkedBranches: { nodes: Array<{ ref: { name: string } | null }> };
}

export interface GQLError {
  message: string;
  path?: string[];
}

export interface GQLViewerResponse {
  data: {
    viewer: {
      login: string;
      repositories: { nodes: GQLRepo[] };
      repositoriesContributedTo: { nodes: GQLRepo[] };
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalPullRequestReviewContributions: number;
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }>;
          }>;
        };
      };
    };
  };
  errors?: GQLError[];
}

export interface GQLPRSearchResponse {
  data: {
    reviewRequests: { nodes: GQLPullRequest[] };
    prMentions: { nodes: GQLPullRequest[] };
    myPRs: { nodes: GQLPullRequest[] };
    assignedPRs: { nodes: GQLPullRequest[] };
  };
  errors?: GQLError[];
}

export interface GQLIssueSearchResponse {
  data: {
    issueMentions: { nodes: GQLIssue[] };
    myIssues: { nodes: GQLIssue[] };
    assignedIssues: { nodes: GQLIssue[] };
  };
  errors?: GQLError[];
}

export interface GitHubEvent {
  type: string;
  repo: { name: string; url: string };
  created_at: string;
  payload: {
    action?: string;
    ref?: string;
    ref_type?: string;
    size?: number;
    commits?: Array<{ message: string }>;
    pull_request?: { title: string; html_url: string };
    issue?: { title: string; html_url: string };
    comment?: { html_url: string };
    release?: { name: string; html_url: string };
    forkee?: { full_name: string; html_url: string };
  };
}
