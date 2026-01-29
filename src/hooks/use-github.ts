import { useState, useCallback, useRef } from "react";
import type {
  Data,
  Stats,
  GQLViewerResponse,
  GQLPRSearchResponse,
  GQLIssueSearchResponse,
} from "./github/types";
import { VIEWER_QUERY, PR_SEARCH_QUERY, ISSUE_SEARCH_QUERY } from "./github/queries";
import { mapPR, mapIssue, mapRepo, mapContributionLevel, mapRepoActivity } from "./github/mappers";
import {
  API,
  CACHE_TTL,
  getCache,
  getCachedUsername,
  setCachedUsername,
  getToken,
  fetchWithRetry,
  fetchUserEvents,
  persistCache,
} from "./github/api";

export { fetchAllComments } from "./github/api";
export type { PR, Issue, Activity, MyActivity, Comment, SelectedItem } from "./github/types";

const EMPTY_STATS: Stats = {
  totalContributions: 0,
  commits: 0,
  prs: 0,
  reviews: 0,
  calendar: [],
};

function initState(): Omit<Data, "load" | "refresh"> {
  const c = getCache();
  return {
    reviewRequests: c?.reviewRequests ?? [],
    prMentions: c?.prMentions ?? [],
    issueMentions: c?.issueMentions ?? [],
    myPRs: c?.myPRs ?? [],
    assignedPRs: c?.assignedPRs ?? [],
    myIssues: c?.myIssues ?? [],
    assignedIssues: c?.assignedIssues ?? [],
    myRepos: c?.myRepos ?? [],
    contributedTo: c?.contributedTo ?? [],
    activity: c?.activity ?? [],
    myActivity: c?.myActivity ?? [],
    stats: c?.stats ?? EMPTY_STATS,
    loading: false,
    error: null,
  };
}

export function useGitHub(): Data {
  const [state, setState] = useState(initState);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    const token = await getToken();
    if (!token) {
      setState((s) => ({ ...s, loading: false, error: "gh auth login" }));
      fetchingRef.current = false;
      return;
    }

    try {
      const gqlHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const gqlFetch = (query: string) =>
        fetchWithRetry(`${API}/graphql`, {
          method: "POST",
          headers: gqlHeaders,
          body: JSON.stringify({ query }),
        });

      const viewerFetch = gqlFetch(VIEWER_QUERY);
      const prFetch = gqlFetch(PR_SEARCH_QUERY);
      const issueFetch = gqlFetch(ISSUE_SEARCH_QUERY);
      const username = getCachedUsername();
      const eventsFetch = username ? fetchUserEvents(username, token) : null;

      const viewerRes = await viewerFetch;
      if (!viewerRes.ok) throw new Error(`${viewerRes.status}`);
      const viewerJson = (await viewerRes.json()) as GQLViewerResponse;
      if (viewerJson.errors) {
        for (const err of viewerJson.errors) {
          console.warn("[gitbar] GQL viewer error:", err.message, err.path);
        }
      }
      const { viewer } = viewerJson.data;
      setCachedUsername(viewer.login);

      const myRepos = viewer.repositories.nodes.map(mapRepo);
      const contributedTo = viewer.repositoriesContributedTo.nodes.map(mapRepo);
      const contrib = viewer.contributionsCollection;
      const calendar = contrib.contributionCalendar.weeks.flatMap((week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: mapContributionLevel(day.contributionLevel),
        })),
      );
      const stats: Stats = {
        totalContributions: contrib.contributionCalendar.totalContributions,
        commits: contrib.totalCommitContributions,
        prs: contrib.totalPullRequestContributions,
        reviews: contrib.totalPullRequestReviewContributions,
        calendar,
      };
      setState((s) => ({ ...s, myRepos, contributedTo, stats }));

      const [prRes, issueRes] = await Promise.all([prFetch, issueFetch]);
      if (!prRes.ok) throw new Error(`PR search: ${prRes.status}`);
      if (!issueRes.ok) throw new Error(`Issue search: ${issueRes.status}`);
      const [prJson, issueJson] = await Promise.all([
        prRes.json() as Promise<GQLPRSearchResponse>,
        issueRes.json() as Promise<GQLIssueSearchResponse>,
      ]);
      if (prJson.errors) {
        for (const err of prJson.errors) {
          console.warn("[gitbar] GQL PR search error:", err.message, err.path);
        }
      }
      if (issueJson.errors) {
        for (const err of issueJson.errors) {
          console.warn("[gitbar] GQL issue search error:", err.message, err.path);
        }
      }
      const reviewRequests = prJson.data.reviewRequests.nodes.map(mapPR);
      const prMentions = prJson.data.prMentions.nodes.map(mapPR);
      const myPRs = prJson.data.myPRs.nodes.map(mapPR);
      const assignedPRs = prJson.data.assignedPRs.nodes.map(mapPR);
      const issueMentions = issueJson.data.issueMentions.nodes.map(mapIssue);
      const myIssues = issueJson.data.myIssues.nodes.map(mapIssue);
      const assignedIssues = issueJson.data.assignedIssues.nodes.map(mapIssue);

      const coreData = {
        reviewRequests,
        prMentions,
        issueMentions,
        myPRs,
        assignedPRs,
        myIssues,
        assignedIssues,
        myRepos,
        contributedTo,
        stats,
      };
      setState((s) => ({ ...s, ...coreData, loading: false, error: null }));

      const rawRepoActivity = mapRepoActivity(viewer.repositories.nodes.slice(0, 10));
      const rawMyActivity = await (eventsFetch ?? fetchUserEvents(viewer.login, token));
      const activity = rawRepoActivity.slice(0, 20);
      const myActivity = rawMyActivity.slice(0, 20);
      persistCache({ ...coreData, activity, myActivity, timestamp: Date.now() });
      setState((s) => ({ ...s, ...coreData, activity, myActivity, loading: false, error: null }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: String(e) }));
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const load = useCallback(() => {
    const cached = getCache();
    if (cached) {
      setState((s) => ({ ...s, ...cached, loading: false, error: null }));
      if (Date.now() - cached.timestamp < CACHE_TTL) return;
    }
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { ...state, load, refresh };
}
