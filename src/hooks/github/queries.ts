export const VIEWER_QUERY = `
query Viewer {
  viewer {
    login
    repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}, ownerAffiliations: OWNER) {
      nodes {
        name
        nameWithOwner
        description
        primaryLanguage { name }
        stargazerCount
        forkCount
        watchers { totalCount }
        issues(states: OPEN) { totalCount }
        pullRequests(states: OPEN) { totalCount }
        pushedAt
        url
        isPrivate
        isArchived
        isTemplate
        isFork
        repositoryTopics(first: 10) { nodes { topic { name } } }
        stargazers(first: 5, orderBy: {field: STARRED_AT, direction: DESC}) {
          edges { starredAt node { login avatarUrl url } }
        }
        forks(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes { owner { login avatarUrl url } createdAt nameWithOwner url }
        }
      }
    }
    repositoriesContributedTo(first: 20, contributionTypes: [COMMIT, PULL_REQUEST], orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        name
        nameWithOwner
        description
        primaryLanguage { name }
        stargazerCount
        forkCount
        watchers { totalCount }
        issues(states: OPEN) { totalCount }
        pullRequests(states: OPEN) { totalCount }
        pushedAt
        url
        isPrivate
        isArchived
        isTemplate
        isFork
        repositoryTopics(first: 10) { nodes { topic { name } } }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

export const PR_SEARCH_QUERY = `
query PRSearch {
  reviewRequests: search(query: "is:pr is:open review-requested:@me sort:updated", type: ISSUE, first: 25) {
    nodes { ...prFields }
  }
  prMentions: search(query: "is:pr is:open mentions:@me -author:@me sort:updated", type: ISSUE, first: 25) {
    nodes { ...prFields }
  }
  myPRs: search(query: "is:pr is:open author:@me sort:updated", type: ISSUE, first: 25) {
    nodes { ...prFields }
  }
  assignedPRs: search(query: "is:pr is:open assignee:@me -author:@me sort:updated", type: ISSUE, first: 25) {
    nodes { ...prFields }
  }
}
fragment prFields on PullRequest {
  number
  title
  body
  url
  repository { nameWithOwner isPrivate }
  author { login avatarUrl }
  createdAt
  updatedAt
  comments { totalCount }
  labels(first: 5) { nodes { name color } }
  assignees(first: 5) { nodes { login avatarUrl } }
  milestone { title }
  isDraft
  additions
  deletions
  changedFiles
  commits { totalCount }
  headRefName
  baseRefName
  reviewDecision
  latestReviews(first: 5) { nodes { state author { login avatarUrl } } }
  reviewRequests(first: 5) { nodes { requestedReviewer { ... on User { login avatarUrl } ... on Team { name } } } }
}`;

export const ISSUE_SEARCH_QUERY = `
query IssueSearch {
  issueMentions: search(query: "is:issue is:open mentions:@me -author:@me sort:updated", type: ISSUE, first: 25) {
    nodes { ...issueFields }
  }
  myIssues: search(query: "is:issue is:open author:@me sort:updated", type: ISSUE, first: 25) {
    nodes { ...issueFields }
  }
  assignedIssues: search(query: "is:issue is:open assignee:@me -author:@me sort:updated", type: ISSUE, first: 25) {
    nodes { ...issueFields }
  }
}
fragment issueFields on Issue {
  number
  title
  body
  url
  repository { nameWithOwner isPrivate }
  author { login avatarUrl }
  createdAt
  updatedAt
  closedAt
  comments { totalCount }
  labels(first: 5) { nodes { name color } }
  assignees(first: 5) { nodes { login avatarUrl } }
  milestone { title }
  stateReason
  reactionGroups { content users { totalCount } }
  participants { totalCount }
  isPinned
  trackedInIssues { totalCount }
  trackedIssues { totalCount }
  linkedBranches(first: 5) { nodes { ref { name } } }
}`;

export function escapeGraphQLString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
